import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { Cart } from "./pages/Cart";
import { ProductDetail } from "./pages/ProductDetail";
import { MyOrders } from "./pages/MyOrders";
import { Wishlist } from "./pages/Wishlist";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { NotFound } from "./pages/NotFound";

export function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const convexUser = useQuery(
    api.users.getCurrentUser,
    isLoaded && isSignedIn ? {} : "skip",
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      return;
    }

    localStorage.setItem("userId", user.id);

    const role =
      convexUser?.role ??
      (typeof user.publicMetadata?.role === "string"
        ? user.publicMetadata.role
        : undefined);
    if (typeof role === "string") {
      localStorage.setItem("userRole", role);
    } else {
      localStorage.removeItem("userRole");
    }
  }, [isLoaded, isSignedIn, user, convexUser]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/signup/*" element={<Signup />} />
        <Route path="/login/*" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
