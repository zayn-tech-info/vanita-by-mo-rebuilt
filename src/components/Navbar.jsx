import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { Link, useNavigate } from "react-router-dom";
import { Search, LogOut, User } from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useAdminAccess } from "../hooks/useAdminAccess";

export function Navbar() {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const { isAdmin } = useAdminAccess();
  const isLoggedIn = isLoaded && isSignedIn;
  const displayName =
    user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Account";
  const email = user?.primaryEmailAddress?.emailAddress;
  const avatarUrl = user?.imageUrl;

  const handleLogout = async () => {
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    await signOut({ redirectUrl: "/" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const shopCategories = [
    { name: "Dresses", href: "/shop?category=dresses" },
    { name: "Tops & Blouses", href: "/shop?category=tops" },
    { name: "Sets & Co-ords", href: "/shop?category=sets" },
    { name: "Accessories", href: "/shop?category=accessories" },
  ];

  return (
    <header className="relative">
      <div className="bg-stone-900 text-white text-center py-2 text-xs tracking-widest uppercase">
        Free Shipping on Orders Over $150 | Handcrafted with Love
      </div>
      <nav className="bg-[#faf9f7] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-amber-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <a href="/" className="flex flex-col items-center group relative">
              <span className="w-12 h-px bg-linear-to-r from-transparent via-amber-600 to-transparent mb-2 group-hover:w-16 transition-all duration-500"></span>
              <span className="text-2xl sm:text-3xl font-extralight tracking-[0.4em] bg-linear-to-r from-stone-800 via-stone-600 to-stone-800 bg-clip-text text-transparent group-hover:from-amber-800 group-hover:via-amber-600 group-hover:to-amber-800 transition-all duration-500">
                VANTIA
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-4 h-[0.5px] bg-amber-600/60"></span>
                <span className="text-[9px] tracking-[0.5em] text-amber-700/80 font-light uppercase">
                  by M.O
                </span>
                <span className="w-4 h-[0.5px] bg-amber-600/60"></span>
              </div>

              <span className="w-8 h-1px bg-linear-to-r from-transparent via-stone-400 to-transparent mt-2 group-hover:w-12 transition-all duration-500"></span>
            </a>

            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/shop?sort=newest"
                className="text-sm tracking-widest text-stone-700 hover:text-amber-800 transition-colors duration-300 uppercase font-light relative group"
              >
                New Arrivals
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-800 group-hover:w-full transition-all duration-300"></span>
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setIsShopOpen(true)}
                onMouseLeave={() => setIsShopOpen(false)}
              >
                <Link
                  to="/shop"
                  className="flex items-center text-sm tracking-widest text-stone-700 hover:text-amber-800 transition-colors duration-300 uppercase font-light group"
                >
                  Shop All
                  <svg
                    className={`ml-1 w-3 h-3 transition-transform duration-300 ${isShopOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="absolute -bottom-1 left-0 w-0 h-1px bg-amber-800 group-hover:w-full transition-all duration-300"></span>
                </Link>

                {/* Dropdown menu */}
                <div
                  className={`absolute top-full left-0 mt-2 w-56 bg-white shadow-xl border border-stone-100 transition-all duration-300 z-50 ${
                    isShopOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="py-3">
                    {shopCategories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="block px-6 py-2.5 text-sm text-stone-600 hover:text-amber-800 hover:bg-stone-50 transition-colors tracking-wide"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href="/#our-craft"
                className="text-sm tracking-widest text-stone-700 hover:text-amber-800 transition-colors duration-300 uppercase font-light relative group"
              >
                Our Craft
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-800 group-hover:w-full transition-all duration-300"></span>
              </a>

              <a
                href="/#our-story"
                className="text-sm tracking-widest text-stone-700 hover:text-amber-800 transition-colors duration-300 uppercase font-light relative group"
              >
                Our Story
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-800 group-hover:w-full transition-all duration-300"></span>
              </a>

              <Link
                to="/blog"
                className="text-sm tracking-widest text-stone-700 hover:text-amber-800 transition-colors duration-300 uppercase font-light relative group"
              >
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-800 group-hover:w-full transition-all duration-300"></span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm tracking-widest text-amber-800 bg-amber-100/80 hover:bg-amber-200/90 px-3 py-1.5 rounded transition-colors duration-300 uppercase font-light"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-stone-700 hover:text-amber-800 transition-colors duration-300"
                aria-label="Search"
              >
                <Search size={21} />
              </button>

              {/* Account: dropdown when logged in, link to login when not */}
              {isLoggedIn ? (
                <div
                  className="hidden sm:block relative"
                  onMouseEnter={() => setIsAccountOpen(true)}
                  onMouseLeave={() => setIsAccountOpen(false)}
                >
                  <button
                    type="button"
                    className="p-2 text-stone-700 hover:text-amber-800 transition-colors duration-300"
                    aria-label="Account menu"
                    aria-expanded={isAccountOpen}
                  >
                    <User size={21} />
                  </button>
                  <div
                    className={`absolute right-0 top-full mt-1 w-48 bg-white shadow-xl border border-stone-100 rounded py-2 z-50 transition-all duration-200 ${
                      isAccountOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-stone-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-9 h-9 rounded-full object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-medium">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{displayName}</p>
                          {email && <p className="text-xs text-stone-500 truncate">{email}</p>}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <User size={16} className="text-stone-400" />
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-stone-100"
                    >
                      <LogOut size={16} className="text-stone-400" />
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:block p-2 text-stone-700 hover:text-amber-800 transition-colors duration-300"
                  aria-label="Log in"
                >
                  <User size={21} />
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-stone-700 hover:text-amber-800 transition-colors duration-300"
                aria-label="Cart"
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-amber-700 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        <div
          className={`absolute top-full left-0 right-0 bg-white shadow-lg border-t border-stone-100 transition-all duration-300 z-50 ${
            isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div className="max-w-2xl mx-auto px-4 py-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search our collection..."
                className="w-full px-4 py-3 border border-stone-200 focus:border-amber-700 focus:outline-none text-sm tracking-wide bg-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-800"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-stone-100 transition-all duration-300 z-40 ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/shop?sort=newest"
              className="block text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
            >
              New Arrivals
            </Link>
            <div className="space-y-2">
              <button
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="flex items-center justify-between w-full text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
              >
                Shop All
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${isShopOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isShopOpen && (
                <div className="pl-4 space-y-2 border-l-2 border-amber-200">
                  {shopCategories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="block text-sm text-stone-600 hover:text-amber-800 py-1.5 tracking-wide"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <a
              href="/#our-craft"
              className="block text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
            >
              Our Craft
            </a>
            <a
              href="/#our-story"
              className="block text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
            >
              Our Story
            </a>
            <Link
              to="/blog"
              className="block text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
            >
              Blog
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block text-sm tracking-widest text-amber-800 bg-amber-100/80 hover:bg-amber-200/90 px-3 py-2 rounded uppercase font-light"
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  to="/my-orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
                >
                  <User size={16} />
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); }}
                  className="flex w-full items-center gap-2 text-sm tracking-widest text-stone-600 hover:text-red-600 uppercase font-light py-2"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm tracking-widest text-stone-700 hover:text-amber-800 uppercase font-light py-2"
              >
                <User size={16} />
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
