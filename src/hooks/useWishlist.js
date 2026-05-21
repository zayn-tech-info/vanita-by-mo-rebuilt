import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "react-toastify";

function getUserId() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("userId") || undefined;
}

export function useWishlist() {
  const userId = getUserId();
  const wishlistItems = useQuery(
    api.wishlist.list,
    userId ? { userId } : "skip"
  ) ?? [];
  const addMutation = useMutation(api.wishlist.add);
  const removeMutation = useMutation(api.wishlist.remove);
  const removeByIdMutation = useMutation(api.wishlist.removeById);

  const add = async (productId) => {
    if (!userId) return;
    await addMutation({ userId, productId });
    toast.success("Added to wishlist");
  };

  const remove = async (productId) => {
    if (!userId) return;
    await removeMutation({ userId, productId });
  };

  const removeById = async (wishlistId) => {
    if (!userId) return;
    await removeByIdMutation({ userId, wishlistId });
  };

  const isInWishlist = (productId) => {
    if (!userId || !wishlistItems.length) return false;
    return wishlistItems.some((item) => item.productId === productId);
  };

  return {
    wishlistItems,
    add,
    remove,
    removeById,
    isInWishlist,
    isLoggedIn: !!userId,
  };
}
