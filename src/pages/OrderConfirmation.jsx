import { useMemo } from "react";
import { Link, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Loader2,
  Clock,
  Truck,
  CreditCard,
  MapPin,
} from "lucide-react";

const statusConfig = {
  awaiting_payment: {
    label: "Awaiting payment",
    shortLabel: "Payment pending",
    icon: Clock,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  pending: {
    label: "Paid · Order confirmed",
    shortLabel: "Confirmed",
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  processing: {
    label: "Processing",
    shortLabel: "Processing",
    icon: Package,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    shortLabel: "Shipped",
    icon: Truck,
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  delivered: {
    label: "Delivered",
    shortLabel: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    icon: Clock,
    color: "text-stone-500 bg-stone-50 border-stone-200",
  },
};

const getStatusConfig = (status) =>
  statusConfig[status] ?? {
    label: status ?? "Unknown",
    shortLabel: status ?? "Unknown",
    icon: Package,
    color: "text-stone-600 bg-stone-50 border-stone-200",
  };

export function OrderConfirmation() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");

  const orderFromStripeSession = useQuery(
    api.orders.getByStripeSessionId,
    sessionId ? { stripeSessionId: sessionId } : "skip"
  );
  const orderFromPaymentIntent = useQuery(
    api.orders.getByPaymentIntentId,
    paymentIntentId ? { paymentIntentId } : "skip"
  );

  const orderFromStripe = orderFromStripeSession ?? orderFromPaymentIntent;
  const orderDataFromState = location.state;

  const orderData = useMemo(() => {
    if (orderFromStripe) {
      return {
        customerName: orderFromStripe.customerName,
        customerEmail: orderFromStripe.customerEmail,
        total: orderFromStripe.total,
        subtotal: orderFromStripe.subtotal,
        shippingCost: orderFromStripe.shippingCost,
        itemCount: orderFromStripe.items.reduce((s, i) => s + i.quantity, 0),
        items: orderFromStripe.items,
        status: orderFromStripe.status,
        shippingAddress: orderFromStripe.shippingAddress,
        orderId: orderFromStripe._id,
      };
    }
    if (orderDataFromState) {
      return {
        customerName: orderDataFromState.customerName,
        customerEmail: orderDataFromState.customerEmail,
        total: orderDataFromState.total,
        subtotal: orderDataFromState.subtotal,
        shippingCost: orderDataFromState.shippingCost,
        itemCount: orderDataFromState.itemCount,
        items: orderDataFromState.items,
        status: "pending",
        shippingAddress: orderDataFromState.shippingAddress,
        orderId: orderDataFromState.orderId,
      };
    }
    return null;
  }, [orderFromStripe, orderDataFromState]);

  const isLoading =
    (sessionId && orderFromStripeSession === undefined) ||
    (paymentIntentId && orderFromPaymentIntent === undefined);

  if (isLoading) {
    return (
      <div className="bg-[#faf9f7] min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-amber-600 mb-4" />
          <p className="text-stone-600 font-light tracking-wide">
            Loading your order...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // Payment just completed; webhook may not have run yet — show clear success state
  if ((sessionId || paymentIntentId) && orderFromStripe === null) {
    const redirectStatus = searchParams.get("redirect_status");
    const paid = redirectStatus === "succeeded" || !!sessionId || !!paymentIntentId;
    return (
      <div className="bg-[#faf9f7] min-h-screen">
        <Navbar />
        <section className="bg-stone-900 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 border border-emerald-400/30 mb-6">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide mb-2">
              Payment successful
            </h1>
            <p className="text-white/80 font-light text-sm sm:text-base max-w-md mx-auto">
              {paid
                ? "Your payment was received. We're confirming your order — it will appear in My Orders in a few seconds."
                : "We're confirming your order. Check My Orders shortly."}
            </p>
          </div>
        </section>
        <section className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white border border-stone-200 p-6 mb-6">
            <p className="text-stone-600 font-light text-sm mb-6">
              Your order will appear in My Orders once our system has finished confirming the payment. This usually takes a few seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                to="/my-orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-700 transition-colors"
              >
                View My Orders
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase hover:border-stone-900 hover:text-stone-900 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const currentStatusConfig = getStatusConfig(orderData.status);
  const StatusIcon = currentStatusConfig.icon;

  const nextSteps = [
    {
      key: "paid",
      title: "Payment received",
      description: "Your payment was successful. The order is confirmed.",
      icon: CreditCard,
      isDone: ["pending", "processing", "shipped", "delivered"].includes(orderData.status),
    },
    {
      key: "processing",
      title: "Order processing",
      description: "Our team will review and prepare your order within 24 hours.",
      icon: Package,
      isDone: ["processing", "shipped", "delivered"].includes(orderData.status),
    },
    {
      key: "shipping",
      title: "Shipping",
      description: "Your order will be carefully packaged and shipped within 2–3 business days.",
      icon: Truck,
      isDone: ["shipped", "delivered"].includes(orderData.status),
    },
    {
      key: "delivery",
      title: "Delivery",
      description: "Estimated delivery: 5–7 business days from shipping.",
      icon: CheckCircle,
      isDone: orderData.status === "delivered",
    },
  ];

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      {/* Hero: Payment success — full width */}
      <section className="bg-stone-900 py-14 sm:py-16 lg:py-20 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 border-2 border-emerald-400/40 mb-6">
            <CheckCircle size={36} className="text-emerald-400 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-wide mb-2">
            Payment successful
          </h1>
          <p className="text-white/80 font-light tracking-wide text-sm sm:text-base max-w-xl mx-auto">
            Thank you, {orderData.customerName}. Your order has been paid and confirmed.
          </p>
        </div>
      </section>

      {/* Main content — wider on large screens, two-column grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left column: Status + Order summary */}
          <div className="space-y-6 lg:space-y-8">
            {/* Current order status */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7">
              <h2 className="text-[11px] tracking-[0.25em] uppercase text-stone-500 font-semibold mb-4 text-left">
                Current order status
              </h2>
              <div
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 border-2 ${currentStatusConfig.color}`}
              >
                <StatusIcon size={20} />
                <span className="text-sm font-semibold tracking-wide">
                  {orderData.status === "pending"
                    ? "Paid · Order confirmed"
                    : currentStatusConfig.label}
                </span>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7">
              <h2 className="text-[11px] tracking-[0.25em] uppercase text-stone-500 font-semibold mb-5 text-left">
                Order summary
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between items-baseline gap-4 text-sm">
                  <dt className="text-stone-500 text-left shrink-0">Order for</dt>
                  <dd className="text-stone-800 font-medium text-right truncate min-w-0">{orderData.customerName}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-4 text-sm">
                  <dt className="text-stone-500 text-left shrink-0">Items</dt>
                  <dd className="text-stone-800 text-right">
                    {orderData.itemCount} {orderData.itemCount === 1 ? "item" : "items"}
                  </dd>
                </div>
                {orderData.subtotal != null && (
                  <div className="flex justify-between items-baseline gap-4 text-sm">
                    <dt className="text-stone-500 text-left shrink-0">Subtotal</dt>
                    <dd className="text-stone-800 text-right">${Number(orderData.subtotal).toFixed(2)}</dd>
                  </div>
                )}
                {orderData.shippingCost != null && (
                  <div className="flex justify-between items-baseline gap-4 text-sm">
                    <dt className="text-stone-500 text-left shrink-0">Shipping</dt>
                    <dd className="text-stone-800 text-right">
                      {orderData.shippingCost === 0 ? "Free" : `$${Number(orderData.shippingCost).toFixed(2)}`}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between items-baseline gap-4 text-base pt-4 mt-4 border-t-2 border-stone-100">
                  <dt className="text-stone-800 font-semibold text-left shrink-0">Total paid</dt>
                  <dd className="text-stone-900 font-bold text-right">${Number(orderData.total).toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right column: Shipping + What happens next */}
          <div className="space-y-6 lg:space-y-8">
            {/* Shipping to */}
            {orderData.shippingAddress?.street && (
              <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7 h-fit">
                <h2 className="text-[11px] tracking-[0.25em] uppercase text-stone-500 font-semibold mb-4 text-left flex items-center gap-2">
                  <MapPin size={14} className="text-amber-600 shrink-0" />
                  <span>Shipping to</span>
                </h2>
                <address className="text-sm text-stone-700 font-normal not-italic leading-relaxed text-left">
                  <p className="font-medium text-stone-800">{orderData.shippingAddress.street}</p>
                  <p className="mt-1">
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
                    {orderData.shippingAddress.zipCode}
                  </p>
                  <p className="text-stone-600">{orderData.shippingAddress.country}</p>
                </address>
              </div>
            )}

            {/* What happens next */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7">
              <h2 className="text-[11px] tracking-[0.25em] uppercase text-stone-500 font-semibold mb-5 text-left">
                What happens next
              </h2>
              <ul className="space-y-4" role="list">
                {nextSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.key} className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 shrink-0 flex items-center justify-center border-2 flex-shrink-0 ${
                          step.isDone ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-stone-50 text-stone-400 border-stone-200"
                        }`}
                      >
                        {step.isDone ? <CheckCircle size={20} /> : <Icon size={20} />}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="text-sm font-semibold text-stone-800 tracking-wide">
                          {step.title}
                        </h4>
                        <p className="text-stone-500 font-light text-sm leading-relaxed mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-stone-500 font-light text-sm mt-6 pt-5 border-t border-stone-100 text-left">
                A confirmation email will be sent to{" "}
                <span className="text-stone-800 font-medium">{orderData.customerEmail}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Actions — full width below grid */}
        <div className="mt-10 lg:mt-12 pt-8 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-amber-700 transition-colors duration-300"
            >
              Continue Shopping
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/my-orders"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-amber-600 text-amber-700 text-xs tracking-[0.15em] uppercase font-medium hover:bg-amber-600 hover:text-white transition-all duration-300"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase font-medium hover:border-stone-900 hover:text-stone-900 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="text-center mt-10 pt-6 border-t border-stone-200">
          <p className="text-stone-500 font-light text-sm tracking-wide">
            Need help? Contact us at{" "}
            <a
              href="https://wa.link/8xiw63"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 font-medium underline underline-offset-2 hover:text-amber-800"
            >
              WhatsApp
            </a>{" "}
            or{" "}
            <a
              href="mailto:support@vanitabymo.com"
              className="text-amber-700 font-medium underline underline-offset-2 hover:text-amber-800"
            >
              support@vanitabymo.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
