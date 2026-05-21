import { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";

export function ProductQuickView({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToCart } = useCart();

  // Product detail data (enriched from the base product)
  const productDetails = getProductDetails(product);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
      // Reset state when opening
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
      setActiveImageIndex(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || !product) return null;

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = productDetails.colors;
  const images = [product.image, product.image, product.image]; // Simulated multiple images

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Desktop Modal / Mobile Sidebar */}
      <div
        className={`
          fixed z-50 bg-[#faf9f7] overflow-y-auto
          inset-y-0 right-0 w-full max-w-[100vw] sm:w-[420px]
          lg:inset-auto lg:top-1/2 lg:left-1/2 lg:w-[900px] lg:max-w-[90vw] lg:max-h-[90vh]
          lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-sm
          transition-all duration-300 ease-out
          ${
            isAnimating
              ? "translate-x-0 lg:translate-x-[-50%] lg:translate-y-[-50%] opacity-100 lg:scale-100"
              : "translate-x-full lg:translate-x-[-50%] lg:translate-y-[-45%] lg:opacity-0 lg:scale-95"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all duration-300 group"
          aria-label="Close quick view"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content Layout */}
        <div className="lg:grid lg:grid-cols-2 min-h-full">
          {/* Left: Image Gallery */}
          <div className="relative bg-stone-100">
            {/* Main Image */}
            <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden">
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
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

              {/* Image Navigation Arrows */}
              <button
                onClick={() =>
                  setActiveImageIndex(
                    (prev) => (prev - 1 + images.length) % images.length,
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="Previous image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev + 1) % images.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="Next image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 border-2 overflow-hidden transition-all duration-300 ${
                    activeImageIndex === idx
                      ? "border-amber-600 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-amber-600"></span>
              <span className="text-amber-700 text-[10px] tracking-[0.3em] uppercase font-light">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h2 className="text-2xl sm:text-3xl font-extralight text-stone-800 tracking-wide mb-3">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-light text-amber-700 tracking-widest">
                ${product.price}
              </span>
              {productDetails.originalPrice && (
                <span className="text-sm text-stone-400 line-through tracking-wide">
                  ${productDetails.originalPrice}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-stone-200 mb-6"></div>

            {/* Description */}
            <p className="text-stone-600 font-light tracking-wide leading-relaxed text-sm mb-6">
              {productDetails.description}
            </p>

            {/* Color Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.2em] uppercase text-stone-700 font-light">
                  Color
                </span>
                {selectedColor && (
                  <span className="text-xs text-stone-500 font-light tracking-wide">
                    {selectedColor}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 relative ${
                      selectedColor === color.name
                        ? "border-amber-600 scale-110"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  >
                    {selectedColor === color.name && (
                      <svg
                        className="w-3.5 h-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        fill="none"
                        stroke={color.checkColor || "white"}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-[0.2em] uppercase text-stone-700 font-light">
                  Size
                </span>
                <button className="text-[10px] tracking-wide text-amber-700 underline underline-offset-2 hover:text-amber-800 transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-xs tracking-[0.1em] border transition-all duration-300 ${
                      selectedSize === size
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-transparent text-stone-600 border-stone-300 hover:border-stone-900 hover:text-stone-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-xs tracking-[0.2em] uppercase text-stone-700 font-light block mb-3">
                Quantity
              </span>
              <div className="flex items-center border border-stone-300 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm text-stone-800 border-x border-stone-300 tracking-wide">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={async () => {
                  await addToCart(
                    product,
                    quantity,
                    selectedSize,
                    selectedColor,
                  );
                  onClose();
                }}
                className="flex-1 py-3.5 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-stone-800 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Add to Cart
              </button>
              <button className="w-12 h-12 border border-stone-300 text-stone-600 hover:border-amber-600 hover:text-amber-700 flex items-center justify-center transition-all duration-300 shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-stone-200 mb-6"></div>

            {/* Product Meta Info */}
            <div className="space-y-4">
              {/* Material */}
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-amber-700 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 block mb-1">
                    Material
                  </span>
                  <span className="text-xs text-stone-700 font-light tracking-wide">
                    {productDetails.material}
                  </span>
                </div>
              </div>

              {/* Care */}
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-amber-700 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 block mb-1">
                    Care Instructions
                  </span>
                  <span className="text-xs text-stone-700 font-light tracking-wide">
                    {productDetails.care}
                  </span>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-amber-700 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 block mb-1">
                    Shipping
                  </span>
                  <span className="text-xs text-stone-700 font-light tracking-wide">
                    Free shipping on orders over $150. Delivery within 5-7
                    business days.
                  </span>
                </div>
              </div>
            </div>

            {/* Social Share */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 block mb-3">
                Share
              </span>
              <div className="flex gap-3">
                <button
                  className="w-8 h-8 border border-stone-200 text-stone-500 hover:text-amber-700 hover:border-amber-600 flex items-center justify-center transition-all duration-300"
                  aria-label="Share on Facebook"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  className="w-8 h-8 border border-stone-200 text-stone-500 hover:text-amber-700 hover:border-amber-600 flex items-center justify-center transition-all duration-300"
                  aria-label="Share on X"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  className="w-8 h-8 border border-stone-200 text-stone-500 hover:text-amber-700 hover:border-amber-600 flex items-center justify-center transition-all duration-300"
                  aria-label="Share on Pinterest"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </button>
                <button
                  className="w-8 h-8 border border-stone-200 text-stone-500 hover:text-amber-700 hover:border-amber-600 flex items-center justify-center transition-all duration-300"
                  aria-label="Copy link"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Generates enriched product details based on the base product data.
 */
function getProductDetails(product) {
  if (!product) {
    return {
      description: "",
      material: "",
      care: "",
      colors: [],
      originalPrice: null,
    };
  }

  const detailsMap = {
    dresses: {
      description:
        "A stunning piece that celebrates African artistry. This dress features hand-printed fabric with intricate traditional patterns, a flattering silhouette that drapes beautifully, and carefully placed seams for a perfect fit. Ideal for both special occasions and elevated everyday wear.",
      material: "100% Premium African Ankara Cotton with hand-dyed accents",
      care: "Hand wash cold. Hang to dry. Iron on medium heat. Do not bleach.",
      colors: [
        { name: "Earth Brown", hex: "#8B6F47", checkColor: "white" },
        { name: "Royal Blue", hex: "#2C3E7B", checkColor: "white" },
        { name: "Sunset Orange", hex: "#C2703E", checkColor: "white" },
        { name: "Natural Ivory", hex: "#F5F0E8", checkColor: "#44403c" },
      ],
    },
    tops: {
      description:
        "Expertly tailored top showcasing authentic African patterns. The relaxed yet refined cut pairs effortlessly with both traditional bottoms and contemporary pieces. Every stitch reflects the skilled hands of our artisan partners.",
      material: "Handwoven African cotton blend with traditional Kente motifs",
      care: "Machine wash gentle cycle. Lay flat to dry. Cool iron if needed.",
      colors: [
        { name: "Terracotta", hex: "#C75E3A", checkColor: "white" },
        { name: "Forest Green", hex: "#3D5C3A", checkColor: "white" },
        { name: "Charcoal", hex: "#44403c", checkColor: "white" },
        { name: "Cream", hex: "#FAF3E8", checkColor: "#44403c" },
      ],
    },
    sets: {
      description:
        "A coordinated two-piece set that makes a bold yet sophisticated statement. Crafted from matching African print fabric, the set features a structured top and flowing bottom that can be worn together or styled separately for versatile wardrobe options.",
      material: "Premium Ankara wax print on 100% organic cotton",
      care: "Dry clean recommended. Steam to remove wrinkles. Store on padded hangers.",
      colors: [
        { name: "Heritage Gold", hex: "#B8860B", checkColor: "white" },
        { name: "Deep Indigo", hex: "#2C2C54", checkColor: "white" },
        { name: "Rust", hex: "#A0522D", checkColor: "white" },
        { name: "Sand", hex: "#D2B48C", checkColor: "#44403c" },
      ],
    },
    accessories: {
      description:
        "A beautifully crafted accessory that adds the perfect African-inspired accent to any outfit. Made with traditional techniques passed down through generations, each piece is unique and tells a story of cultural heritage.",
      material: "Hand-crafted with traditional African beadwork and fabrics",
      care: "Wipe clean with soft cloth. Store in dust bag. Avoid moisture.",
      colors: [
        { name: "Gold", hex: "#D4A843", checkColor: "white" },
        { name: "Onyx", hex: "#1C1C1C", checkColor: "white" },
        { name: "Bronze", hex: "#CD7F32", checkColor: "white" },
      ],
    },
  };

  const details = detailsMap[product.category] || detailsMap.dresses;

  return {
    ...details,
    originalPrice: product.isBestseller
      ? Math.round(product.price * 1.25)
      : null,
  };
}
