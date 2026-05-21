import { Link, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShoppingBag,
  Loader2,
  MapPin,
} from "lucide-react";

const statusConfig = {
  awaiting_payment: {
    label: "Awaiting payment",
    icon: Clock,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    iconColor: "text-amber-600",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    iconColor: "text-amber-600",
  },
  processing: {
    label: "Processing",
    icon: Package,
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    iconColor: "text-blue-600",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    badgeClass: "bg-violet-50 text-violet-800 border-violet-200",
    iconColor: "text-violet-600",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    iconColor: "text-red-500",
  },
};

export function MyOrders() {
  const userId = localStorage.getItem("userId");

  // Redirect to login if not authenticated
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  const orders = useQuery(api.orders.listByUser, { userId }) ?? undefined;

  // Loading
  if (orders === undefined) {
    return (
      <div className="bg-[#faf9f7] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
        <Footer />
      </div>
    );
  }

  // Sort by most recent
  const sortedOrders = [...orders].sort(
    (a, b) => b._creationTime - a._creationTime,
  );

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="bg-stone-900 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Link
              to="/"
              className="text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-amber-400 text-xs tracking-[0.2em] uppercase">
              My Orders
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white tracking-wide">
            My <span className="text-amber-400 font-light">Orders</span>
          </h1>
        </div>
      </section>

      {/* Orders List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {sortedOrders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
              <ShoppingBag size={28} className="text-stone-400" />
            </div>
            <h2 className="text-2xl font-extralight text-stone-800 tracking-wide mb-3">
              No orders yet
            </h2>
            <p className="text-stone-500 font-light tracking-wide text-sm mb-8">
              Start shopping to see your orders here
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-3 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300"
            >
              Browse Collection
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {sortedOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const orderDate = new Date(
                order._creationTime,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              // Generate a clean order number from the ID
              const orderNumber = order._id.slice(-8).toUpperCase();

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden"
                >
                  {/* Order Meta Header */}
                  <div className="bg-stone-50/80 border-b border-stone-100 px-5 sm:px-6 md:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium">
                          Order
                        </span>
                        <span className="text-lg sm:text-xl font-light text-stone-900 tracking-wide">
                          #{orderNumber}
                        </span>
                        <span className="text-sm text-stone-500 font-light">
                          · Placed {orderDate}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs uppercase tracking-widest text-stone-400 font-light">
                            Total
                          </span>
                          <span className="text-xl font-light text-stone-900 tracking-wide">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest border ${status.badgeClass}`}
                        >
                          <StatusIcon size={12} className={status.iconColor} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-5 sm:px-6 md:px-8 py-6">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium mb-4">
                      Items ({order.items.length})
                    </h4>
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="group flex gap-4 p-3 rounded-lg bg-stone-50/50 border border-stone-100 hover:border-stone-200 transition-colors"
                        >
                          <div className="w-20 h-24 sm:w-24 sm:h-28 bg-stone-100 shrink-0 overflow-hidden rounded-md border border-stone-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-col justify-center min-w-0 flex-1">
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-sm font-light text-stone-800 tracking-wide hover:text-amber-700 transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            {(item.size || item.color) && (
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-stone-500 font-light">
                                {item.size && <span>Size {item.size}</span>}
                                {item.color && <span>· {item.color}</span>}
                              </div>
                            )}
                            <p className="mt-2 text-sm text-stone-700 font-light">
                              {item.quantity} × ${item.price.toFixed(2)}
                              <span className="text-stone-500 ml-1">
                                = ${(item.quantity * item.price).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="border-t border-stone-100 bg-stone-50/50 px-5 sm:px-6 md:px-8 py-4 sm:py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100/80 border border-amber-200/60 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-amber-700" />
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium mb-0.5">
                            Shipping to
                          </span>
                          <p className="text-sm text-stone-700 font-light leading-relaxed break-words">
                            {order.shippingAddress.street},{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode},{" "}
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                      {(order.status === "shipped" ||
                        order.status === "delivered" ||
                        order.status === "cancelled") && (
                        <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-stone-100">
                          {order.status === "shipped" && (
                            <>
                              <Truck size={14} className={status.iconColor} />
                              <span className="text-xs font-light text-stone-600">
                                On its way
                              </span>
                            </>
                          )}
                          {order.status === "delivered" && (
                            <>
                              <CheckCircle2
                                size={14}
                                className={status.iconColor}
                              />
                              <span className="text-xs font-light text-stone-600">
                                Delivered
                              </span>
                            </>
                          )}
                          {order.status === "cancelled" && (
                            <>
                              <XCircle size={14} className={status.iconColor} />
                              <span className="text-xs font-light text-stone-600">
                                Cancelled
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
