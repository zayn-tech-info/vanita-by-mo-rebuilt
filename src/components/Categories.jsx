
import { Link } from "react-router-dom";
import { productCategories } from "../data/products";

export function Categories() {


  return (
    <section className="bg-stone-100 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-amber-600"></span>
            <span className="text-amber-700 text-xs tracking-[0.4em] uppercase font-light">
              Explore
            </span>
            <span className="w-12 h-px bg-linear-to-l from-transparent to-amber-600"></span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-stone-800 tracking-wide mb-6">
            Shop by <span className="text-amber-700 font-light">Category</span>
          </h2>

          <p className="text-stone-600 font-light tracking-wide max-w-2xl mx-auto">
            Discover our carefully curated collections, each celebrating the
            rich tapestry of African craftsmanship
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productCategories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className="group relative aspect-3/4 overflow-hidden"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                <span className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-2 font-light">
                  {category.count} Items
                </span>
                <h3 className="text-2xl text-white font-light tracking-wide mb-1 group-hover:text-amber-300 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-white/70 text-sm font-light tracking-wide mb-4">
                  {category.description}
                </p>

                {/* Animated Arrow */}
                <div className="flex items-center gap-2 text-white/80 group-hover:text-amber-400 transition-colors duration-300">
                  <span className="text-xs tracking-[0.2em] uppercase">
                    Explore
                  </span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 transition-all duration-500"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
