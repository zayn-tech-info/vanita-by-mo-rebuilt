import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";

export function Dashboard() {
  const products = useQuery(api.products.list) || [];
  const orders = useQuery(api.orders.listAll) || [];

  // Compute stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "awaiting_payment")
    .reduce((sum, o) => sum + o.total, 0);
  const awaitingPaymentOrders = orders.filter((o) => o.status === "awaiting_payment").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing",
  ).length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Products",
      value: totalProducts,
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const recentOrders = orders.slice(0, 8);

  const statusConfig = {
    awaiting_payment: {
      label: "Awaiting payment",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      color: "text-orange-600 bg-orange-50",
    },
    processing: {
      label: "Processing",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    shipped: {
      label: "Shipped",
      icon: Truck,
      color: "text-purple-600 bg-purple-50",
    },
    delivered: {
      label: "Delivered",
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
    cancelled: {
      label: "Cancelled",
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
    },
  };

  const getStatusConfig = (status) =>
    statusConfig[status] ?? {
      label: status ?? "Unknown",
      icon: AlertCircle,
      color: "text-stone-600 bg-stone-50",
    };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-light text-stone-800 tracking-wide">
          Dashboard
        </h1>
        <p className="text-sm text-stone-500 font-light mt-1">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-300 min-w-0"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.15em] uppercase text-stone-500 font-light">
                  {stat.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-light text-stone-800 tracking-wide break-words">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-sm tracking-[0.15em] uppercase text-stone-700 font-medium mb-5">
            Order Status
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Awaiting payment",
                count: awaitingPaymentOrders,
                color: "bg-amber-500",
              },
              {
                label: "Pending",
                count: pendingOrders,
                color: "bg-orange-500",
              },
              {
                label: "Processing",
                count: processingOrders,
                color: "bg-blue-500",
              },
              {
                label: "Shipped",
                count: shippedOrders,
                color: "bg-purple-500",
              },
              {
                label: "Delivered",
                count: deliveredOrders,
                color: "bg-green-500",
              },
              {
                label: "Cancelled",
                count: cancelledOrders,
                color: "bg-red-500",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-stone-600 font-light">
                  {item.label}
                </span>
                <span className="text-sm text-stone-800 font-medium">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-sm tracking-[0.15em] uppercase text-stone-700 font-medium mb-5">
            Recent Orders
          </h2>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart size={36} className="mx-auto text-stone-300 mb-3" />
              <p className="text-sm text-stone-400 font-light">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-2.5 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                      Customer
                    </th>
                    <th className="text-left py-2.5 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                      Items
                    </th>
                    <th className="text-left py-2.5 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                      Total
                    </th>
                    <th className="text-left py-2.5 text-xs tracking-[0.1em] uppercase text-stone-500 font-light">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {recentOrders.map((order) => {
                    const config = getStatusConfig(order.status);
                    const StatusIcon = config.icon;
                    return (
                      <tr key={order._id} className="hover:bg-stone-50/50">
                        <td className="py-3">
                          <p className="text-stone-800 font-light">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-stone-400">
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="py-3 text-stone-600 font-light">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </td>
                        <td className="py-3 text-stone-800 font-light">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-light ${config.color}`}
                          >
                            <StatusIcon size={12} />
                            {config.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
