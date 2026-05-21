import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProductQuickView } from "../components/ProductQuickView";
import { ProductCardSkeletonGrid } from "../components/ProductCardSkeleton";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import heroImage from "../assets/images/hero_section3.jpg";
import { Search } from "lucide-react";

const categories = [
  { id: "all", label: "All" },
  { id: "dresses", label: "Dresses" },
  { id: "tops", label: "Tops" },
  { id: "sets", label: "Sets" },
  { id: "accessories", label: "Accessories" },
];

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

const colorOptions = [
  { name: "Earth Brown", hex: "#8B6F47" },
  { name: "Royal Blue", hex: "#2C3E7B" },
  { name: "Sunset Orange", hex: "#C2703E" },
  { name: "Natural Ivory", hex: "#F5F0E8" },
  { name: "Terracotta", hex: "#C75E3A" },
  { name: "Forest Green", hex: "#3D5C3A" },
  { name: "Charcoal", hex: "#44403c" },
  { name: "Cream", hex: "#FAF3E8" },
  { name: "Heritage Gold", hex: "#B8860B" },
  { name: "Deep Indigo", hex: "#2C2C54" },
  { name: "Rust", hex: "#A0522D" },
  { name: "Sand", hex: "#D2B48C" },
];

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "bestselling", label: "Best Selling" },
];

export function Shop() {
  const [searchParams] = useSearchParams();
  const allProductsQuery = useQuery(api.products.list);
  const isLoading = allProductsQuery === undefined;
  const allProducts = allProductsQuery ?? [];

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const { addToCart } = useCart();
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory("all");
    }

    const sort = searchParams.get("sort");
    if (sort) {
      setSortBy(sort);
    } else {
      setSortBy("featured");
    }

    const q = searchParams.get("q");
    setSearchQuery(q || "");

    setCurrentPage(1);
  }, [searchParams]);

  // Handle page change with smooth scroll
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const element = document.getElementById("shop-content");
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Toggle size
  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
    setCurrentPage(1);
  };

  // Toggle color
  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCategory("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 500]);
    setSortBy("featured");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Count active filters
  const activeFilterCount =
    (activeCategory !== "all" ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter — matches name, category, and description
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQ) ||
          p.category.toLowerCase().includes(lowerQ) ||
          (p.description && p.description.toLowerCase().includes(lowerQ)) ||
          (p.material && p.material.toLowerCase().includes(lowerQ)),
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s)),
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c)),
      );
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    // Sort
    switch (sortBy) {
      case "newest":
        result = result
          .filter((p) => p.isNew)
          .concat(result.filter((p) => !p.isNew));
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "bestselling":
        result = result
          .filter((p) => p.isBestseller)
          .concat(result.filter((p) => !p.isBestseller));
        break;
      default:
        break;
    }

    return result;
  }, [
    allProducts,
    searchQuery,
    activeCategory,
    selectedSizes,
    selectedColors,
    priceRange,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  // Sidebar filter content (shared between desktop & mobile)
  const FilterContent = () => (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-stone-800 font-medium mb-4">
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`block w-full text-left py-1.5 text-sm tracking-wide transition-colors duration-200 ${
                activeCategory === cat.id
                  ? "text-amber-700 font-medium"
                  : "text-stone-600 hover:text-stone-900 font-light"
              }`}
            >
              {cat.label}
              <span className="text-stone-400 text-xs ml-2">
                (
                {cat.id === "all"
                  ? allProducts.length
                  : allProducts.filter((p) => p.category === cat.id).length}
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-stone-200"></div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-stone-800 font-medium mb-4">
          Price Range
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => {
              setPriceRange([priceRange[0], parseInt(e.target.value)]);
              setCurrentPage(1);
            }}
            className="w-full accent-amber-700 cursor-pointer"
          />
          <div className="flex items-center justify-between text-sm text-stone-600 font-light">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-stone-200"></div>

      {/* Size Filter */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-stone-800 font-medium mb-4">
          Size
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 text-xs tracking-widest border transition-all duration-200 ${
                selectedSizes.includes(size)
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-transparent text-stone-600 border-stone-300 hover:border-stone-900"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-stone-200"></div>

      {/* Color Filter */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-stone-800 font-medium mb-4">
          Color
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-7 h-7 rounded-full border-2 transition-all duration-200 relative ${
                selectedColors.includes(color.name)
                  ? "border-amber-600 scale-110"
                  : "border-stone-200 hover:border-stone-400"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Filter by ${color.name}`}
            >
              {selectedColors.includes(color.name) && (
                <svg
                  className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  fill="none"
                  stroke={
                    ["Natural Ivory", "Cream", "Sand"].includes(color.name)
                      ? "#44403c"
                      : "white"
                  }
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

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <>
          <div className="h-px bg-stone-200"></div>
          <button
            onClick={clearFilters}
            className="w-full py-2.5 text-xs tracking-[0.15em] uppercase text-stone-600 border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
          >
            Clear All Filters ({activeFilterCount})
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      <Navbar />

      {/* Shop Banner */}
      <section className="relative h-[280px] sm:h-[340px] overflow-hidden bg-stone-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <a
              href="/"
              className="text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors"
            >
              Home
            </a>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-amber-400 text-xs tracking-[0.2em] uppercase">
              Shop
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white tracking-wide mb-4">
            Our <span className="text-amber-400 font-light">Collection</span>
          </h1>
          <p className="text-white/70 font-light tracking-wide max-w-xl text-sm sm:text-base">
            Discover handcrafted African-inspired fashion, where tradition meets
            modern elegance
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section
        id="shop-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
      >
        {/* Search Results Banner */}
        {searchQuery && (
          <div className="mb-8 p-6 bg-stone-50 border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500 font-light tracking-wide mb-1">
                Search Results
              </p>
              <h2 className="text-2xl text-stone-800 font-light tracking-wide">
                Showing results for "
                <span className="font-medium">{searchQuery}</span>"
              </h2>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-2 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase hover:border-stone-900 hover:text-stone-900 transition-all duration-300"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Top Bar - Results count, Sort, Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 mb-8 pb-6 border-b border-stone-200">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 text-xs tracking-[0.15em] uppercase hover:border-stone-900 transition-colors"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-amber-700 text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <p className="text-stone-600 text-sm font-light tracking-wide">
              <span className="text-stone-800 font-medium">
                {filteredProducts.length}
              </span>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full sm:w-auto">
            <span className="hidden sm:inline text-xs tracking-[0.15em] uppercase text-stone-500 font-light shrink-0">
              Sort by
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 px-3 sm:px-4 py-2 border border-stone-300 bg-transparent text-stone-700 text-sm tracking-wide focus:outline-none focus:border-amber-700 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] bg-no-repeat bg-position-[right_0.5rem_center]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-stone-500 tracking-wide font-light mr-1">
              Active:
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-xs tracking-wide border border-stone-200 hover:border-stone-400 transition-colors"
              >
                Search: {searchQuery}
                <Search size={15} />
              </button>
            )}
            {activeCategory !== "all" && (
              <button
                onClick={() => setActiveCategory("all")}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-xs tracking-wide border border-stone-200 hover:border-stone-400 transition-colors"
              >
                {categories.find((c) => c.id === activeCategory)?.label}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {selectedSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-xs tracking-wide border border-stone-200 hover:border-stone-400 transition-colors"
              >
                Size: {size}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
            {selectedColors.map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-xs tracking-wide border border-stone-200 hover:border-stone-400 transition-colors"
              >
                {color}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-amber-700 underline underline-offset-2 hover:text-amber-800 tracking-wide ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8">
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <ProductCardSkeletonGrid count={9} />
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="group relative"
                      onMouseEnter={() => setHoveredProduct(product._id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Product Image */}
                      <div className="relative aspect-3/4 overflow-hidden bg-stone-100 mb-3 sm:mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Hover overlay - desktop only */}
                        <div
                          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 hidden lg:block ${
                            hoveredProduct === product._id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        ></div>

                        {/* Badges */}
                        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
                          {product.isNew && (
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-600 text-white text-[8px] sm:text-[10px] tracking-[0.15em] uppercase">
                              New
                            </span>
                          )}
                          {product.isBestseller && (
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-stone-900 text-white text-[8px] sm:text-[10px] tracking-[0.15em] uppercase">
                              Bestseller
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div
                          className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex gap-1 sm:gap-2 transition-all duration-300 ${
                            hoveredProduct === product._id
                              ? "opacity-100 translate-y-0"
                              : "lg:opacity-0 lg:translate-y-4"
                          }`}
                        >
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 py-2 sm:py-3 bg-white text-stone-900 text-[9px] sm:text-xs tracking-widest sm:tracking-[0.15em] uppercase hover:bg-stone-900 hover:text-white transition-colors duration-300"
                          >
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (isInWishlist(product._id)) removeFromWishlist(product._id);
                              else addToWishlist(product._id);
                            }}
                            className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                              isInWishlist(product._id)
                                ? "bg-stone-900 text-white"
                                : "bg-white text-stone-900 hover:bg-stone-900 hover:text-white"
                            }`}
                            aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <svg
                              className="w-3.5 h-3.5 sm:w-5 sm:h-5"
                              fill={isInWishlist(product._id) ? "currentColor" : "none"}
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

                        {/* Quick View */}
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 bg-white/90 text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-300 flex items-center justify-center ${
                            hoveredProduct === product._id
                              ? "opacity-100 scale-100"
                              : "lg:opacity-0 lg:scale-90"
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Product Info */}
                      <Link
                        to={`/product/${product._id}`}
                        className="block text-center"
                      >
                        <h3 className="text-stone-800 font-light tracking-wide mb-1 sm:mb-2 text-xs sm:text-base group-hover:text-amber-800 transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-amber-700 font-light tracking-widest text-xs sm:text-base">
                          ${product.price}
                        </p>
                      </Link>
                      <Link
                        to={`/product/${product._id}`}
                        className="block mx-auto mt-2 sm:mt-3 px-4 sm:px-6 py-1.5 sm:py-2 border border-stone-300 text-[9px] sm:text-xs tracking-[0.15em] uppercase text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-12">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="w-10 h-10 border border-stone-300 flex items-center justify-center text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous page"
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

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 text-sm tracking-wide transition-all duration-200 ${
                            currentPage === page
                              ? "bg-stone-900 text-white"
                              : "border border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 border border-stone-300 flex items-center justify-center text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next page"
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
                )}
              </>
            ) : (
              /* Empty State */
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center border font-light border-stone-100 bg-stone-50/50">
                <svg
                  className="w-12 h-12 text-stone-300 mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery ? (
                  <>
                    <h3 className="text-xl text-stone-800 tracking-wide mb-3">
                      No results for "{searchQuery}"
                    </h3>
                    <p className="text-stone-500 tracking-wide text-sm mb-8 max-w-sm mx-auto">
                      We couldn't find any products matching your search. Try
                      checking for typos or searching with different keywords.
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-8 py-3.5 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl text-stone-800 tracking-wide mb-3">
                      No products found
                    </h3>
                    <p className="text-stone-500 tracking-wide text-sm mb-8 max-w-sm mx-auto">
                      Try adjusting your filters or category to find what you're
                      looking for.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-8 py-3.5 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300"
                    >
                      Clear All Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Sidebar */}
      {isMobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-[#faf9f7] z-50 overflow-y-auto shadow-xl">
            {/* Mobile Filter Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-sm tracking-[0.2em] uppercase text-stone-800 font-medium">
                Filters
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                aria-label="Close filters"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Filter Content */}
            <div className="p-6">
              <FilterContent />
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 p-6 bg-[#faf9f7] border-t border-stone-200">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-stone-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-stone-800 transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}
