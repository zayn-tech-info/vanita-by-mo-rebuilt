import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProductDetailSkeleton } from "../components/ProductDetailSkeleton";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export function ProductDetail() {
  const { id } = useParams();
  const product = useQuery(api.products.getById, id ? { id } : "skip");
  const { addToCart } = useCart();
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Loading state
  if (product === undefined) {
    return (
      <div className="bg-[#faf9f7] min-h-screen">
        <Navbar />
        <ProductDetailSkeleton />
        <Footer />
      </div>
    );
  }

  // Not found
  if (product === null) {
    return (
      <div className="bg-[#faf9f7] min-h-screen">
        <Navbar />
        <section className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
            <ShoppingBag size={28} className="text-stone-400" />
          </div>
          <h2 className="text-2xl font-extralight text-stone-800 tracking-wide mb-3">
            Product not found
          </h2>
          <p className="text-stone-500 font-light tracking-wide text-sm mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-3 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300"
          >
            Browse Collection
            <ChevronRight size={14} />
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const tabs = [
    { id: "description", label: "Description" },
    { id: "material", label: "Material" },
    { id: "care", label: "Care" },
  ];

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-2 text-xs tracking-wide">
          <Link
            to="/"
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            Home
          </Link>
          <ChevronRight size={12} className="text-stone-300" />
          <Link
            to="/shop"
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            Shop
          </Link>
          <ChevronRight size={12} className="text-stone-300" />
          <Link
            to={`/shop?category=${product.category}`}
            className="text-stone-400 hover:text-stone-700 transition-colors capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight size={12} className="text-stone-300" />
          <span className="text-stone-700 font-light">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="lg:flex lg:gap-12 xl:gap-16">
          {/* Product Image */}
          <div className="lg:flex-1 mb-8 lg:mb-0 min-w-0">
            <div className="aspect-3/4 overflow-hidden bg-stone-100 sticky top-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-[10px] tracking-[0.15em] uppercase">
                    New
                  </span>
                )}
                {product.isBestseller && (
                  <span className="px-3 py-1 bg-stone-900 text-white text-[10px] tracking-[0.15em] uppercase">
                    Bestseller
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-[480px] xl:w-[520px] min-w-0">
            {/* Category */}
            <span className="text-xs tracking-[0.2em] uppercase text-amber-700 font-light">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-stone-800 tracking-wide mt-2 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl text-amber-700 font-light tracking-wide mb-6">
              ${product.price.toFixed(2)}
            </p>

            {/* Wishlist - when logged in */}
            {typeof window !== "undefined" && localStorage.getItem("userId") && (
              <button
                type="button"
                onClick={() => {
                  if (isInWishlist(product._id)) removeFromWishlist(product._id);
                  else addToWishlist(product._id);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 border text-sm tracking-wide mb-6 transition-colors ${
                  isInWishlist(product._id)
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-300 text-stone-700 hover:border-stone-900"
                }`}
              >
                <svg className="w-4 h-4" fill={isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isInWishlist(product._id) ? "Saved" : "Save to wishlist"}
              </button>
            )}

            {/* Divider */}
            <div className="h-px bg-stone-200 mb-6" />

            {/* Description excerpt */}
            {product.description && (
              <p className="text-sm text-stone-600 font-light tracking-wide leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-700 font-medium">
                    Size
                  </span>
                  {selectedSize && (
                    <span className="text-xs text-stone-500 font-light">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(size === selectedSize ? null : size)
                      }
                      className={`min-w-[48px] px-4 py-2.5 text-xs tracking-widest uppercase border transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-transparent text-stone-700 border-stone-300 hover:border-stone-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-700 font-medium">
                    Color
                  </span>
                  {selectedColor && (
                    <span className="text-xs text-stone-500 font-light">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setSelectedColor(color === selectedColor ? null : color)
                      }
                      className={`px-4 py-2.5 text-xs tracking-wide border transition-all duration-200 ${
                        selectedColor === color
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-transparent text-stone-700 border-stone-300 hover:border-stone-900"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-stretch gap-3 mb-6">
              {/* Quantity Selector */}
              <div className="flex items-center border border-stone-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-12 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 h-12 flex items-center justify-center text-sm text-stone-800 tracking-wide border-x border-stone-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-12 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
              {[
                { icon: Truck, label: "Free Shipping\nOver $200" },
                { icon: RotateCcw, label: "Easy\nReturns" },
                { icon: ShieldCheck, label: "Secure\nCheckout" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 py-2 sm:py-3 bg-stone-50 border border-stone-100 rounded min-w-0"
                >
                  <Icon size={16} className="text-amber-600 shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span className="text-[9px] sm:text-[10px] text-stone-500 font-light tracking-wide text-center whitespace-pre-line leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Product Details Tabs */}
            <div className="border-t border-stone-200 pt-6">
              <div className="flex gap-6 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-xs tracking-[0.15em] uppercase pb-2 border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "text-stone-800 border-amber-600 font-medium"
                        : "text-stone-400 border-transparent hover:text-stone-600 font-light"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-sm text-stone-600 font-light tracking-wide leading-relaxed min-h-[80px]">
                {activeTab === "description" && (
                  <p>{product.description || "No description available."}</p>
                )}
                {activeTab === "material" && (
                  <p>
                    {product.material || "Material information not available."}
                  </p>
                )}
                {activeTab === "care" && (
                  <p>{product.care || "Care instructions not available."}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
