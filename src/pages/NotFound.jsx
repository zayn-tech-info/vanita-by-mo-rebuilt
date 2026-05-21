import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Home, ShoppingBag } from "lucide-react";

export function NotFound() {
  return (
    <div className="bg-[#faf9f7] min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-stone-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-amber-400/80 text-sm tracking-[0.3em] uppercase font-light">
            Page not found
          </span>
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extralight text-white/90 tracking-tight mt-2">
            404
          </h1>
          <p className="text-white/60 font-light tracking-wide mt-4 max-w-md mx-auto text-sm sm:text-base">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-stone-500 font-light tracking-wide mb-8">
            Head back home or continue shopping.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors duration-300"
            >
              <Home size={18} />
              Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-stone-900 text-stone-900 text-xs tracking-[0.15em] uppercase hover:bg-stone-900 hover:text-white transition-colors duration-300"
            >
              <ShoppingBag size={18} />
              Shop
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
