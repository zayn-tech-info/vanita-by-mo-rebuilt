import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CheckCircle2, Loader2, Package } from "lucide-react";

export function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const order = useQuery(
    api.orders.getByStripeCheckoutSessionId,
    sessionId ? { stripeCheckoutSessionId: sessionId } : "skip",
  );

  const isLoading = sessionId && order === undefined;
  const isPaid = order?.status === "pending" || order?.status === "processing";
  const isAwaiting =
    order?.status === "awaiting_payment" && sessionId;

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        {isLoading ? (
          <div className="py-12">
            <Loader2
              size={36}
              className="animate-spin text-amber-600 mx-auto mb-4"
            />
            <p className="text-stone-600 font-light">
              Confirming your order…
            </p>
          </div>
        ) : !sessionId ? (
          <>
            <Package size={48} className="mx-auto text-stone-300 mb-4" />
            <h1 className="text-2xl font-light text-stone-900 tracking-wide mb-2">
              No order found
            </h1>
            <p className="text-stone-500 font-light text-sm mb-8">
              If you just paid, wait a moment and refresh, or check My Orders.
            </p>
            <Link
              to="/shop"
              className="inline-flex px-6 py-3 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors"
            >
              Continue shopping
            </Link>
          </>
        ) : isAwaiting ? (
          <>
            <Loader2
              size={36}
              className="animate-spin text-amber-600 mx-auto mb-4"
            />
            <h1 className="text-2xl font-light text-stone-900 tracking-wide mb-2">
              Payment received
            </h1>
            <p className="text-stone-500 font-light text-sm mb-8 leading-relaxed">
              We are confirming your order. This usually takes a few seconds.
              You can refresh this page or view My Orders shortly.
            </p>
            <Link
              to="/my-orders"
              className="inline-flex px-6 py-3 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors"
            >
              View orders
            </Link>
          </>
        ) : isPaid && order ? (
          <>
            <CheckCircle2
              size={56}
              className="mx-auto text-green-600 mb-6"
            />
            <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-wide mb-2">
              Thank you for your order
            </h1>
            <p className="text-stone-500 font-light text-sm mb-2">
              A confirmation email was sent to{" "}
              <span className="text-stone-700">{order.customerEmail}</span>
            </p>
            <p className="text-stone-800 font-medium text-lg mb-8">
              Total: ${order.total.toFixed(2)}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/my-orders"
                className="inline-flex justify-center px-6 py-3 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors"
              >
                View orders
              </Link>
              <Link
                to="/shop"
                className="inline-flex justify-center px-6 py-3 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase hover:border-stone-500 transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <Package size={48} className="mx-auto text-stone-300 mb-4" />
            <h1 className="text-2xl font-light text-stone-900 tracking-wide mb-2">
              Order status unknown
            </h1>
            <p className="text-stone-500 font-light text-sm mb-8">
              Check My Orders for the latest status.
            </p>
            <Link
              to="/my-orders"
              className="inline-flex px-6 py-3 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors"
            >
              My orders
            </Link>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
