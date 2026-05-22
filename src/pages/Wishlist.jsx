import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import {
  Heart,
  ShoppingBag,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

export function Wishlist() {
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { wishlistItems, removeById, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = useState(null);

  if (!userId) {
    return <Navigate to="/login" state={{ from: "/wishlist" }} replace />;
  }

  const handleMoveToCart = async (item) => {
    if (movingId) return;
    setMovingId(item._id);
    const product = {
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category,
    };
    try {
      await addToCart(product, 1, undefined, undefined, { showToast: false });
      await removeById(item._id);
      toast.success(`${item.product.name} added to cart`);
    } catch {
      toast.error("Could not add item to cart. Please try again.");
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      {/* Page header — compact */}
      <section className="bg-stone-900 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Link
              to="/"
              className="text-white/60 text-[10px] sm:text-xs tracking-[0.2em] uppercase hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-amber-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase">
              Wishlist
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extralight text-white tracking-wide">
            Your <span className="text-amber-400 font-light">Wishlist</span>
          </h1>
          {!isLoading && wishlistItems.length > 0 && (
            <p className="text-white/60 font-light tracking-wide mt-2 text-xs sm:text-sm">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-amber-600" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16 max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 flex items-center justify-center mx-auto mb-5 border border-stone-200 rounded-full">
              <Heart className="w-8 h-8 text-stone-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-light text-stone-800 tracking-wide mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-stone-500 font-light text-sm mb-6">
              Save items you love by clicking the heart on any product.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors"
            >
              Browse Collection
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {/* Desktop column labels */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 pb-2 border-b border-stone-200">
              <span className="col-span-7 text-xs tracking-[0.2em] uppercase text-stone-500 font-light">
                Product
              </span>
              <span className="col-span-5 text-xs tracking-[0.2em] uppercase text-stone-500 font-light text-right">
                Actions
              </span>
            </div>

            {wishlistItems.map((item) => (
              <article
                key={item._id}
                className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Mobile & tablet: horizontal row */}
                <div className="p-3 sm:p-4 flex gap-3 sm:gap-4 md:hidden">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-stone-100 overflow-hidden rounded-sm"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="block min-w-0"
                    >
                      <h3 className="text-sm text-stone-800 font-light tracking-wide line-clamp-2 hover:text-amber-800 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-amber-700 font-medium text-sm mt-1">
                      ${item.product.price}
                    </p>
                    <div className="mt-auto pt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        disabled={movingId === item._id}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 text-white text-[10px] sm:text-xs tracking-[0.12em] uppercase hover:bg-amber-700 transition-colors rounded-sm disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {movingId === item._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShoppingBag size={14} />
                        )}
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => removeById(item._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-300 text-stone-600 text-[10px] sm:text-xs tracking-[0.12em] uppercase hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm"
                        aria-label={`Remove ${item.product.name} from wishlist`}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop: table-style row */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center p-4">
                  <div className="col-span-7 flex items-center gap-4 min-w-0">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="shrink-0 w-20 h-24 bg-stone-100 overflow-hidden rounded-sm"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={`/product/${item.product._id}`}
                        className="text-stone-800 font-light tracking-wide text-sm lg:text-base hover:text-amber-800 transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-amber-700 font-medium text-sm mt-1">
                        ${item.product.price}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      disabled={movingId === item._id}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-700 transition-colors rounded-sm whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {movingId === item._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShoppingBag size={16} />
                      )}
                      Move to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeById(item._id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-300 text-stone-600 text-xs tracking-[0.15em] uppercase hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm whitespace-nowrap"
                      aria-label={`Remove ${item.product.name} from wishlist`}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <div className="pt-4 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-sm text-stone-600 font-light hover:text-amber-800 transition-colors"
              >
                Continue shopping
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
