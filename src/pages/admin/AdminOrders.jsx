import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Clock,
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
  X,
} from "lucide-react";
import { getConvexErrorMessage } from "../../lib/convexError";
import { toast } from "react-toastify";

const statusConfig = {
  awaiting_payment: {
    label: "Awaiting payment",
    icon: Clock,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  processing: {
    label: "Processing",
    icon: TrendingUp,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-red-600 bg-red-50 border-red-200",
  },
};

const statusOptions = [
  "awaiting_payment",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const getStatusConfig = (status) =>
  statusConfig[status] ?? {
    label: status ?? "Unknown",
    icon: AlertCircle,
    color: "text-stone-600 bg-stone-50 border-stone-200",
  };

export function AdminOrders() {
  const orders = useQuery(api.orders.listAll) || [];
  const updateStatus = useMutation(api.orders.updateStatus);

  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const userId = localStorage.getItem("userId");

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!userId) return;
    setUpdatingId(orderId);
    try {
      await updateStatus({ userId, orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(getConvexErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  // Status counts for filter tabs
  const counts = {
    all: orders.length,
    awaiting_payment: orders.filter((o) => o.status === "awaiting_payment").length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-stone-800 tracking-wide">
          Orders
        </h1>
        <p className="text-sm text-stone-500 font-light mt-1">
          {orders.length} total orders
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", ...statusOptions].map((status) => {
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase rounded-lg border transition-all ${
                isActive
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {status === "all" ? "All" : statusConfig[status]?.label || status}
              <span
                className={`ml-1.5 ${isActive ? "text-white/60" : "text-stone-400"}`}
              >
                ({counts[status]})
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={40} className="mx-auto text-stone-300 mb-3" />
            <p className="text-sm text-stone-400 font-light">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left py-3 px-4 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                    Items
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((order) => {
                  const config = getStatusConfig(order.status);
                  const StatusIcon = config.icon;
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="text-stone-800 font-light">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-stone-400">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-light">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </td>
                      <td className="py-3 px-4 text-stone-800 font-light">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            disabled={updatingId === order._id}
                            className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-light border cursor-pointer focus:outline-none ${config.color} ${updatingId === order._id ? "opacity-50" : ""}`}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {statusConfig[s].label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => {
                              setCurrentItemIndex(0);
                              setViewingOrder(order);
                            }}
                            className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Order Detail Modal ─── */}
      {viewingOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setViewingOrder(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-[100vw] sm:w-[480px] bg-[#faf9f7] z-50 overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#faf9f7] border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-light text-stone-800 tracking-wide">
                Order Details
              </h2>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <h3 className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light mb-2">
                  Customer
                </h3>
                <p className="text-stone-800 font-light">
                  {viewingOrder.customerName}
                </p>
                <p className="text-sm text-stone-500 font-light">
                  {viewingOrder.customerEmail}
                </p>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light mb-2">
                  Shipping Address
                </h3>
                <div className="text-sm text-stone-700 font-light space-y-0.5">
                  <p>{viewingOrder.shippingAddress.street}</p>
                  <p>
                    {viewingOrder.shippingAddress.city},{" "}
                    {viewingOrder.shippingAddress.state}{" "}
                    {viewingOrder.shippingAddress.zipCode}
                  </p>
                  <p>{viewingOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Items Carousel */}
              <div>
                <h3 className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light mb-3">
                  Items ({viewingOrder.items.length})
                </h3>

                {(() => {
                  const item = viewingOrder.items[currentItemIndex];
                  const totalItems = viewingOrder.items.length;
                  return (
                    <div className="bg-white rounded-lg border border-stone-100 overflow-hidden">
                      {/* Image with prev/next buttons */}
                      {item.image && (
                        <div className="relative w-full h-[50vh] bg-stone-50 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />

                          {/* Prev / Next Buttons */}
                          {totalItems > 1 && (
                            <>
                              <button
                                onClick={() =>
                                  setCurrentItemIndex((prev) =>
                                    prev === 0 ? totalItems - 1 : prev - 1,
                                  )
                                }
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  setCurrentItemIndex((prev) =>
                                    prev === totalItems - 1 ? 0 : prev + 1,
                                  )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all"
                              >
                                <ChevronRight size={20} />
                              </button>

                              {/* Counter badge */}
                              <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 text-white text-xs rounded-full">
                                {currentItemIndex + 1} / {totalItems}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-stone-800 font-light">
                            {item.name}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-stone-400 mt-1">
                            {item.size && (
                              <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-stone-800">
                            ${item.price}
                          </p>
                          <p className="text-xs font-medium text-stone-400">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>
                      {totalItems > 1 && (
                        <div className="flex items-center justify-center gap-2 pb-4">
                          {viewingOrder.items.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentItemIndex(i)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                i === currentItemIndex
                                  ? "bg-amber-600 w-4"
                                  : "bg-stone-300 hover:bg-stone-400"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white p-4 rounded-lg border border-stone-100 space-y-2">
                <div className="flex justify-between text-sm text-stone-600 font-light">
                  <span>Subtotal</span>
                  <span>${viewingOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600 font-light">
                  <span>Shipping</span>
                  <span>
                    {viewingOrder.shippingCost === 0
                      ? "Free"
                      : `$${viewingOrder.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-stone-800 font-medium pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>${viewingOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light mb-2">
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => {
                    const config = statusConfig[status];
                    const isCurrentStatus = viewingOrder.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          handleStatusChange(viewingOrder._id, status);
                          setViewingOrder({ ...viewingOrder, status });
                        }}
                        className={`px-3 py-1.5 text-xs tracking-wide border rounded-lg transition-all ${
                          isCurrentStatus
                            ? config.color + " font-medium"
                            : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
