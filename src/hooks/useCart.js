import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "./useSessionId";
import { toast } from "react-toastify";

function getUserId() {
  if (typeof window === "undefined") return undefined;
  const id = localStorage.getItem("userId");
  return id || undefined;
}

export function useCart() {
  const sessionId = useSessionId();
  const userId = getUserId();
  const cartItems = useQuery(api.cart.getCart, { sessionId, userId }) ?? [];
  const cartCount = useQuery(api.cart.getCartCount, { sessionId, userId }) ?? 0;
  const addToCartMutation = useMutation(api.cart.addToCart);
  const updateQuantityMutation = useMutation(api.cart.updateQuantity);
  const removeFromCartMutation = useMutation(api.cart.removeFromCart);
  const clearCartMutation = useMutation(api.cart.clearCart);

  const addToCart = async (product, quantity = 1, size, color) => {
    const imageStr =
      typeof product.image === "string"
        ? product.image
        : product.image?.default || String(product.image);

    await addToCartMutation({
      sessionId,
      userId,
      productId: product._id || product.id,
      name: product.name,
      price: product.price,
      image: imageStr,
      category: product.category,
      quantity,
      size: size || undefined,
      color: color || undefined,
    });

    toast.success(`${product.name} added to cart!`);
  };

  const updateQuantity = async (id, quantity) => {
    await updateQuantityMutation({ id, quantity });
  };

  const removeItem = async (id) => {
    await removeFromCartMutation({ id });
  };

  const clearCart = async () => {
    await clearCartMutation({ sessionId, userId });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
