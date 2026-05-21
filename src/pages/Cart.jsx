import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useCart } from "../hooks/useCart";
import { toast } from "react-toastify";
import { LogIn, UserPlus, X } from "lucide-react";

export function Cart() {
  const {
    cartItems,
    cartCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem("userId");

  const redeemResult = useQuery(
    api.redeemCodes.validate,
    appliedCode ? { code: appliedCode, subtotal } : "skip"
  );
  const discountAmount = redeemResult?.valid ? redeemResult.discountAmount : 0;
  const shippingCost = subtotal > 200 ? 0 : 15;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  // Open modal if redirected from checkout (e.g. ?login=required)
  useEffect(() => {
    if (location.state?.requireLogin || new URLSearchParams(location.search).get("login") === "required") {
      setShowLoginModal(true);
      // Clear the state/query so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.requireLogin, location.search, location.pathname, navigate]);

  const handleProceedToCheckout = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginModal(true);
    } else {
      navigate("/checkout", {
        state: {
          appliedRedeemCode:
            appliedCode && redeemResult?.valid ? appliedCode : null,
        },
      });
    }
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    setTimeout(async () => {
      await removeItem(id);
      setRemovingId(null);
    }, 300);
  };

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-stone-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <Link
              to="/"
              className="text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40 text-xs">/</span>
            <Link
              to="/shop"
              className="text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors"
            >
              Shop
            </Link>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-amber-400 text-xs tracking-[0.2em] uppercase">
              Cart
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white tracking-wide">
            Shopping <span className="text-amber-400 font-light">Cart</span>
          </h1>
          {cartCount > 0 && (
            <p className="text-white/60 font-light tracking-wide mt-3 text-sm">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>
      </section>

      {/* Cart Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {cartItems.length > 0 ? (
          <div className="lg:flex lg:gap-12">
            {/* Cart Items */}
            <div className="flex-1">
              {/* Header - desktop */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 pb-4 border-b border-stone-200 mb-2">
                <span className="col-span-6 text-xs tracking-[0.2em] uppercase text-stone-500 font-light">
                  Product
                </span>
                <span className="col-span-2 text-xs tracking-[0.2em] uppercase text-stone-500 font-light text-center">
                  Price
                </span>
                <span className="col-span-2 text-xs tracking-[0.2em] uppercase text-stone-500 font-light text-center">
                  Quantity
                </span>
                <span className="col-span-2 text-xs tracking-[0.2em] uppercase text-stone-500 font-light text-right">
                  Total
                </span>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-stone-200">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className={`py-5 sm:py-6 transition-all duration-300 ${
                      removingId === item._id
                        ? "opacity-0 -translate-x-8"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-32 bg-stone-100 shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm text-stone-800 font-light tracking-wide pr-2 truncate">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="text-stone-400 hover:text-red-500 transition-colors shrink-0"
                            aria-label="Remove item"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {(item.size || item.color) && (
                          <div className="flex gap-3 mb-2 text-xs text-stone-500 font-light">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}

                        <p className="text-amber-700 font-light text-sm mb-3">
                          ${item.price}
                        </p>

                        {/* Quantity + Total */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-stone-300">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeWidth={1.5}
                                  d="M5 12h14"
                                />
                              </svg>
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-sm text-stone-800 border-x border-stone-300 font-light">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeWidth={1.5}
                                  d="M12 5v14M5 12h14"
                                />
                              </svg>
                            </button>
                          </div>
                          <span className="text-stone-800 font-light text-sm tracking-wide">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="col-span-6 flex items-center gap-5">
                        <div className="w-20 h-24 lg:w-24 lg:h-32 bg-stone-100 shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-stone-800 font-light tracking-wide mb-1 text-sm lg:text-base">
                            {item.name}
                          </h3>
                          {(item.size || item.color) && (
                            <div className="flex gap-3 mb-2 text-xs text-stone-500 font-light">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                          )}
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="text-xs text-stone-400 hover:text-red-500 transition-colors tracking-wide underline underline-offset-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center text-stone-700 font-light text-sm">
                        ${item.price}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border border-stone-300">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeWidth={1.5}
                                d="M5 12h14"
                              />
                            </svg>
                          </button>
                          <span className="w-10 h-9 flex items-center justify-center text-sm text-stone-800 border-x border-stone-300 font-light">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeWidth={1.5}
                                d="M12 5v14M5 12h14"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right text-stone-800 font-light text-sm tracking-wide">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-6 border-t border-stone-200">
                <Link
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase hover:border-stone-900 hover:text-stone-900 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                  Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="px-6 py-3 text-xs tracking-[0.15em] uppercase text-stone-500 hover:text-red-600 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px] lg:min-w-[320px] mt-10 lg:mt-0">
              <div className="bg-white border border-stone-200 p-4 sm:p-6 md:p-8 sticky top-8">
                <h2 className="text-sm tracking-[0.2em] uppercase text-stone-800 font-medium mb-6 pb-4 border-b border-stone-200">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600 font-light tracking-wide">
                      Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"}
                      )
                    </span>
                    <span className="text-stone-800 font-light">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600 font-light tracking-wide">
                      Shipping
                    </span>
                    <span className="text-stone-800 font-light">
                      {shippingCost === 0 ? (
                        <span className="text-green-700">Free</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-amber-700 font-light tracking-wide">
                      Free shipping on orders over $200
                    </p>
                  )}
                </div>

                {/* Promo Code */}
                <div className="mb-6 pb-6 border-b border-stone-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={redeemCodeInput}
                      onChange={(e) =>
                        setRedeemCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="Promo code"
                      className="flex-1 px-4 py-2.5 border border-stone-300 bg-transparent text-sm text-stone-700 tracking-wide placeholder:text-stone-400 focus:outline-none focus:border-amber-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAppliedCode(redeemCodeInput.trim() || null)
                      }
                      className="px-5 py-2.5 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-stone-800 transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCode && redeemResult !== undefined && (
                    <p
                      className={`mt-2 text-sm ${
                        redeemResult?.valid
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {redeemResult?.valid
                        ? `Discount applied: -$${redeemResult.discountAmount.toFixed(2)}`
                        : redeemResult?.message}
                    </p>
                  )}
                </div>

                {/* Total */}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-600 font-light text-sm">
                      Discount
                    </span>
                    <span className="text-green-700 font-medium text-sm">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-8">
                  <span className="text-stone-800 tracking-[0.15em] uppercase text-sm font-medium">
                    Total
                  </span>
                  <span className="text-xl text-stone-900 font-light tracking-wide">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="block w-full py-4 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300 mb-4 text-center"
                >
                  Proceed to Checkout
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-[10px] tracking-wide uppercase">
                      Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-[10px] tracking-wide uppercase">
                      Encrypted
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-[10px] tracking-wide uppercase">
                      Protected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            {/* Cart Icon */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-100 flex items-center justify-center mb-8">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extralight text-stone-800 tracking-wide mb-3">
              Your cart is empty
            </h2>
            <p className="text-stone-500 font-light tracking-wide text-sm sm:text-base max-w-md text-center mb-8">
              Discover our beautiful collection of handcrafted African fashion
              pieces
            </p>

            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300"
            >
              Start Shopping
              <svg
                className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>

            {/* Featured Categories */}
            <div className="mt-16 w-full max-w-lg px-2">
              <p className="text-xs tracking-[0.3em] uppercase text-stone-400 font-light text-center mb-6">
                Popular Categories
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {["Dresses", "Tops", "Sets", "Accessories"].map((cat) => (
                  <Link
                    key={cat}
                    to="/shop"
                    className="px-5 py-2 border border-stone-300 text-stone-600 text-xs tracking-[0.15em] uppercase hover:border-amber-700 hover:text-amber-700 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Login required modal */}
      {showLoginModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
            aria-hidden="true"
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            aria-describedby="login-modal-desc"
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <LogIn size={24} className="text-amber-700" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <h2 id="login-modal-title" className="text-xl sm:text-2xl font-light text-stone-900 tracking-wide mt-4">
                Sign in to checkout
              </h2>
              <p id="login-modal-desc" className="text-stone-600 font-light text-sm sm:text-base mt-2 leading-relaxed">
                Create an account or sign in to complete your order. Your cart is saved and will be waiting for you.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col gap-3">
                <Link
                  to="/login"
                  state={{ from: "cart" }}
                  onClick={() => setShowLoginModal(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-stone-900 text-white text-sm tracking-[0.15em] uppercase font-medium hover:bg-amber-800 transition-colors rounded-lg"
                >
                  <LogIn size={18} />
                  Log in
                </Link>
                <Link
                  to="/signup"
                  state={{ from: "cart" }}
                  onClick={() => setShowLoginModal(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-stone-900 text-stone-900 text-sm tracking-[0.15em] uppercase font-medium hover:bg-stone-50 transition-colors rounded-lg"
                >
                  <UserPlus size={18} />
                  Create account
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-3 text-stone-500 text-sm font-light hover:text-stone-700 transition-colors"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
