import { Link, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

export function Wishlist() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { wishlistItems, removeById, isLoggedIn } = useWishlist();
  const { addToCart } = useCart();

  if (!userId) {
    return <Navigate to="/login" state={{ from: "/wishlist" }} replace />;
  }

  const handleMoveToCart = async (item) => {
    const product = {
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category,
    };
    await addToCart(product, 1);
    await removeById(item._id);
    toast.success(`${item.product.name} moved to cart`);
  };

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      <section className="bg-stone-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Link to="/" className="text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-amber-400 text-xs tracking-[0.2em] uppercase">
              Wishlist
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white tracking-wide">
            Your <span className="text-amber-400 font-light">Wishlist</span>
          </h1>
          {wishlistItems.length > 0 && (
            <p className="text-white/60 font-light tracking-wide mt-3 text-sm">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 flex items-center justify-center mx-auto mb-6 border border-stone-200 rounded-full">
              <Heart className="w-9 h-9 sm:w-10 sm:h-10 text-stone-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-stone-800 tracking-wide mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-stone-500 font-light text-sm sm:text-base mb-8 max-w-sm mx-auto">
              Save items you love by clicking the heart on any product.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-amber-800 transition-colors"
            >
              Browse Collection
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-stone-200 overflow-hidden rounded-sm shadow-sm group"
              >
                <div className="relative aspect-[3/4] bg-stone-100">
                  <Link to={`/product/${item.product._id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                </div>
                <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                  <Link to={`/product/${item.product._id}`} className="block">
                    <h3 className="text-stone-800 font-light tracking-wide text-xs sm:text-sm hover:text-amber-800 transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-amber-700 font-medium text-sm">
                    ${item.product.price}
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="w-full min-h-[44px] sm:min-h-[48px] inline-flex items-center justify-center gap-2 py-3 bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-amber-700 active:scale-[0.98] transition-colors rounded-sm"
                    >
                      <ShoppingBag size={18} />
                      Move to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeById(item._id)}
                      className="w-full min-h-[44px] sm:min-h-[48px] py-3 border-2 border-stone-300 text-stone-700 text-sm font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm active:scale-[0.98]"
                      aria-label="Remove from wishlist"
                    >
                      Remove from wishlist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
