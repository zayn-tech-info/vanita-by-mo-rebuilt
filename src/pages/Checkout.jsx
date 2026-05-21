import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation, Navigate } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { getConvexErrorMessage } from "../lib/convexError";
import { api } from "../../convex/_generated/api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useCart } from "../hooks/useCart";
import { useSessionId } from "../hooks/useSessionId";
import { toast } from "react-toastify";
import {
  Loader2,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  CreditCard,
  Package,
  MapPin,
} from "lucide-react";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function getPaymentIntentIdFromClientSecret(clientSecret) {
  if (!clientSecret || typeof clientSecret !== "string") return undefined;
  const parts = clientSecret.split("_secret_");
  const id = parts[0]?.trim();
  return id && id.startsWith("pi_") ? id : undefined;
}

function FloatingInput({ name, label, type = "text", required = true, value, isActive, onChange, onFocus, onBlur }) {
  return (
    <div className="relative group">
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isActive
            ? "top-2 text-[10px] text-amber-600 tracking-widest uppercase font-medium"
            : "top-1/2 -translate-y-1/2 text-sm text-stone-400 font-light"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full h-14 px-4 pt-5 pb-2 border border-stone-200 text-sm text-stone-800 tracking-wide bg-white/80 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors duration-200 placeholder:text-stone-300"
      />
    </div>
  );
}

function EmbeddedPaymentForm({ onSuccess, onCancel, paymentIntentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const redirectToConfirmation = () => {
    const origin = window.location.origin;
    const url = paymentIntentId
      ? `${origin}/order-confirmation?payment_intent=${encodeURIComponent(paymentIntentId)}&redirect_status=succeeded`
      : `${origin}/order-confirmation`;
    window.location.href = url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMessage(null);
    const origin = window.location.origin;
    const returnUrl = paymentIntentId
      ? `${origin}/order-confirmation?payment_intent=${encodeURIComponent(paymentIntentId)}`
      : `${origin}/order-confirmation`;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });
    if (error) {
      setErrorMessage(error.message ?? "Payment failed");
      setLoading(false);
      return;
    }
    // Always redirect from our side so user never stays on checkout after success
    setRedirecting(true);
    if (onSuccess) onSuccess();
    redirectToConfirmation();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          spacing: "compact",
          radios: true,
          defaultValues: {
            billingDetails: {
              address: {
                country: "US",
              },
            },
          },
        }}
      />
      {errorMessage && (
        <p className="text-sm text-red-600 font-light bg-red-50 px-4 py-2 border border-red-100">{errorMessage}</p>
      )}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] px-6 sm:px-8 py-3.5 border border-stone-200 text-stone-600 text-sm font-medium tracking-wide hover:border-stone-400 hover:bg-stone-50 transition-colors active:scale-[0.98]"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading || redirecting}
          className="flex-1 min-h-[52px] px-8 sm:px-10 py-3.5 bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {redirecting ? "Redirecting…" : loading ? (<> <Loader2 size={18} className="animate-spin" /> Processing... </>) : "Pay now"}
        </button>
      </div>
    </form>
  );
}

export function Checkout() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { cartItems, cartCount, subtotal } = useCart();
  const sessionId = useSessionId();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const createCheckoutSession = useAction(api.payments.createCheckoutSession);
  const createPaymentIntent = useAction(api.payments.createPaymentIntent);
  const createOrderWithShipping = useAction(api.payments.createOrderWithShipping);

  const codeFromCart = location.state?.appliedRedeemCode;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [redeemCodeInput, setRedeemCodeInput] = useState(codeFromCart ?? "");
  const [appliedCode, setAppliedCode] = useState(codeFromCart ?? null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const shippingCost = subtotal > 200 ? 0 : 15;
  const baseTotal = subtotal + shippingCost;
  const redeemResult = useQuery(
    api.redeemCodes.validate,
    appliedCode ? { code: appliedCode, subtotal } : "skip"
  );
  const discountAmount = redeemResult?.valid ? redeemResult.discountAmount : 0;
  const total = Math.max(0, baseTotal - discountAmount);
  const useEmbeddedForm = !!stripePublishableKey;

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      toast.info("Checkout was cancelled. Your cart is still here.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (codeFromCart) {
      setRedeemCodeInput(codeFromCart);
      setAppliedCode(codeFromCart);
    }
  }, [codeFromCart]);

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="bg-[#faf9f7] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 flex items-center justify-center mb-6 border border-stone-200">
            <Package className="w-9 h-9 sm:w-10 sm:h-10 text-stone-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-stone-800 tracking-wide mb-2 text-center">
            Your cart is empty
          </h2>
          <p className="text-stone-500 font-light text-sm sm:text-base mb-8 text-center max-w-sm">
            Add some items before proceeding to checkout
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-amber-800 transition-colors active:scale-[0.98]"
          >
            Browse Collection
            <ChevronRight size={18} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Require login to checkout — redirect to cart and show login modal
  if (!userId && cartItems.length > 0) {
    return <Navigate to="/cart" state={{ requireLogin: true }} replace />;
  }

  const validateShipping = () => {
    const required = ["firstName", "lastName", "email", "phone", "street", "city", "state", "zipCode", "country"];
    for (const field of required) {
      if (!formData[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleContinueToPayment = async () => {
    if (!validateShipping()) return;
    if (useEmbeddedForm) {
      setLoading(true);
      const toastId = toast.loading("Preparing payment...");
      try {
        const userId = localStorage.getItem("userId") || undefined;
        const orderId = await createOrderWithShipping({
          userId: userId || undefined,
          sessionId,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          items: cartItems.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.image ?? "",
          })),
          subtotal,
          shippingCost,
          total,
          redeemCode: appliedCode && redeemResult?.valid ? appliedCode : undefined,
        });
        const { clientSecret: secret } = await createPaymentIntent({
          orderId,
          amountInCents: Math.round(total * 100),
          sessionId,
        });
        setClientSecret(secret);
        setStep(2);
        toast.update(toastId, { render: "Enter your card details below.", type: "success", isLoading: false, autoClose: 2000 });
      } catch (err) {
        toast.update(toastId, {
          render: getConvexErrorMessage(err, "Could not start payment. Try again."),
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      } finally {
        setLoading(false);
      }
    } else {
      handlePayWithStripeRedirect();
    }
  };

  const handlePayWithStripeRedirect = async () => {
    if (!validateShipping()) return;
    setLoading(true);
    const toastId = toast.loading("Redirecting to secure payment...");
    try {
      const userId = localStorage.getItem("userId") || undefined;
      const { url } = await createCheckoutSession({
        sessionId,
        userId: userId || undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        subtotal,
        shippingCost,
        total,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        redeemCode: appliedCode && redeemResult?.valid ? appliedCode : undefined,
      });
      toast.update(toastId, { render: "Redirecting to Stripe...", type: "info", isLoading: false, autoClose: 1500 });
      window.location.href = url;
    } catch (err) {
      setLoading(false);
      toast.update(toastId, {
        render: getConvexErrorMessage(err, "Could not start checkout. Please try again."),
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const renderInput = (name, label, type = "text") => (
    <FloatingInput
      name={name}
      label={label}
      type={type}
      value={formData[name]}
      isActive={focusedField === name || !!formData[name]}
      onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
      onFocus={() => setFocusedField(name)}
      onBlur={() => setFocusedField(null)}
    />
  );

  const OrderSummaryCard = () => (
    <div className="bg-white border border-stone-200 overflow-hidden">
      <div className="p-4 sm:p-5 md:p-6 border-b border-stone-100">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-500">Order summary</h2>
        <p className="text-stone-400 text-xs mt-0.5">{cartCount} {cartCount === 1 ? "item" : "items"}</p>
      </div>
      <div className="p-4 sm:p-5 md:p-6 space-y-4 max-h-[200px] overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item._id} className="flex gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-stone-100 shrink-0 overflow-hidden border border-stone-200">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
              <p className="text-xs text-stone-500">Qty {item.quantity} · ${item.price.toFixed(2)} each</p>
            </div>
            <p className="text-sm font-medium text-stone-800 shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="p-4 sm:p-5 md:p-6 bg-stone-50/80 space-y-3 border-t border-stone-100">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Subtotal</span>
          <span className="text-stone-800 font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Shipping</span>
          <span className="text-stone-800 font-medium">
            {shippingCost === 0 ? <span className="text-emerald-600">Free</span> : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Discount</span>
            <span className="text-emerald-600 font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-stone-200">
          <span className="text-sm font-semibold tracking-wide text-stone-800">Total</span>
          <span className="text-xl font-semibold text-stone-900">${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 flex items-center gap-2 text-stone-500 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Secure payment by Stripe</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#faf9f7] min-h-screen flex flex-col">
      <Navbar />

      {/* Header — compact on mobile */}
      <header className="bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm mb-4 sm:mb-5">
            <Link to="/" className="text-white/60 hover:text-white transition-colors tracking-wide">Home</Link>
            <span className="text-white/40">/</span>
            <Link to="/cart" className="text-white/60 hover:text-white transition-colors tracking-wide">Cart</Link>
            <span className="text-white/40">/</span>
            <span className="text-amber-400 tracking-wide font-medium">Checkout</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-center">
            Secure <span className="text-amber-400 font-normal">Checkout</span>
          </h1>
          <p className="text-white/70 text-center text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {useEmbeddedForm
              ? "Enter your details below. Payment is secure and embedded."
              : "Enter shipping here, then card details on Stripe."}
          </p>
          {useEmbeddedForm && (
            <div className="flex justify-center gap-2 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium ${step === 1 ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/70"}`}>
                <MapPin size={12} /> 1. Shipping
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium ${step === 2 ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/70"}`}>
                <CreditCard size={12} /> 2. Payment
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Mobile: order summary first (compact) so user sees total, then form */}
        <div className="block lg:hidden mb-6">
          <OrderSummaryCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form column — full width on mobile, 3 cols on lg */}
          <div className="lg:col-span-3">
            {step === 1 && (
              <div className="bg-white border border-stone-200 overflow-hidden">
                <div className="p-4 sm:p-5 md:p-6 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 flex items-center justify-center border border-amber-200">
                      <MapPin className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold tracking-wide text-stone-800">Shipping</h2>
                      <p className="text-xs text-stone-500">Where should we send your order?</p>
                    </div>
                  </div>
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleContinueToPayment(); }}
                  className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput("firstName", "First name")}
                    {renderInput("lastName", "Last name")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput("email", "Email", "email")}
                    {renderInput("phone", "Phone", "tel")}
                  </div>
                  <div className="pt-2">
                    <p className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-3">Address</p>
                    <div className="space-y-4">
                      {renderInput("street", "Street address")}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderInput("city", "City")}
                        {renderInput("state", "State / Province")}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderInput("zipCode", "Zip / Postal code")}
                        {renderInput("country", "Country")}
                      </div>
                    </div>
                  </div>
                  {/* Redeem code */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium tracking-widest uppercase text-stone-500">
                      Redeem code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={redeemCodeInput}
                        onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 h-12 px-4 border border-stone-200 text-sm text-stone-800 tracking-wide bg-white/80 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors placeholder:text-stone-300"
                      />
                      <button
                        type="button"
                        onClick={() => setAppliedCode(redeemCodeInput.trim() || null)}
                        className="px-4 py-2 border border-stone-300 text-stone-700 text-sm font-medium tracking-wide hover:border-amber-600 hover:text-amber-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCode && redeemResult !== undefined && (
                      <p className={`text-sm ${redeemResult.valid ? "text-emerald-600" : "text-red-600"}`}>
                        {redeemResult.valid
                          ? `Discount applied: -$${redeemResult.discountAmount.toFixed(2)}`
                          : redeemResult.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-4 sm:pt-6">
                    <Link
                      to="/cart"
                      className="min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 inline-flex items-center justify-center gap-2 border border-stone-200 text-stone-600 text-sm font-medium tracking-wide hover:border-stone-400 hover:bg-stone-50 transition-colors active:scale-[0.98]"
                    >
                      <ArrowLeft size={18} />
                      Back to cart
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="min-h-[52px] flex-1 px-8 sm:px-10 py-3.5 bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {loading && <Loader2 size={18} className="animate-spin" />}
                      {useEmbeddedForm ? "Continue to payment" : "Pay with Stripe"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && clientSecret && stripePromise && (
              <div className="bg-white border border-stone-200 overflow-hidden">
                <div className="p-4 sm:p-5 md:p-6 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 flex items-center justify-center border border-amber-200">
                      <CreditCard className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold tracking-wide text-stone-800">Payment</h2>
                      <p className="text-xs text-stone-500">Enter your card details securely</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#b45309", borderRadius: "0px" } } }}>
                    <EmbeddedPaymentForm
                      paymentIntentId={getPaymentIntentIdFromClientSecret(clientSecret)}
                      onSuccess={() => {}}
                      onCancel={() => { setClientSecret(null); setStep(1); }}
                    />
                  </Elements>
                </div>
              </div>
            )}
          </div>

          {/* Order summary — hidden on mobile (shown above), sticky on desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <OrderSummaryCard />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
