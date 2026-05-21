import storyImg from "../assets/images/hero_section2.jpg";

export function About() {
  return (
    <section
      id="our-story"
      className="bg-[#faf9f7] py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-4/5 overflow-hidden">
              <img
                src={storyImg}
                alt="Our story - African fashion heritage"
                className="w-full h-full object-cover"
              />

              {/* Decorative Frame */}
              <div className="absolute inset-4 border border-amber-600/30 pointer-events-none"></div>
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-2 right-2 sm:-bottom-6 sm:-right-6 lg:-right-10 bg-stone-900 text-white p-4 sm:p-6 lg:p-8 max-w-[140px] sm:max-w-none">
              <div className="text-center">
                <span className="block text-2xl sm:text-4xl lg:text-5xl font-extralight text-amber-400 mb-1">
                  15+
                </span>
                <span className="text-xs tracking-[0.2em] uppercase font-light">
                  Years of
                  <br />
                  Craftsmanship
                </span>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="hidden lg:block absolute -top-8 -left-8 w-32 h-32 border border-amber-600/20"></div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            {/* Section Label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-amber-700 text-xs tracking-[0.4em] uppercase font-light">
                Our Story
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-stone-800 tracking-wide mb-6 leading-tight">
              Where Heritage
              <br />
              <span className="text-amber-700 font-light">Meets Modern</span>
              <br />
              Elegance
            </h2>

            {/* Description */}
            <div className="space-y-4 text-stone-600 font-light tracking-wide leading-relaxed mb-8">
              <p>
                Born from a deep love for African heritage and a vision to
                celebrate its timeless beauty, Vantia by M.O brings you
                authentic, handcrafted fashion that tells stories of tradition,
                culture, and artistry.
              </p>
              <p>
                Each piece in our collection is thoughtfully designed and
                meticulously crafted by skilled artisans who have inherited
                generations of expertise. We use authentic African prints,
                sustainable materials, and contemporary silhouettes to create
                garments that honor the past while embracing the future.
              </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-10">
              <div className="border-l-2 border-amber-600/30 pl-4">
                <span className="block text-2xl font-extralight text-stone-800 mb-1">
                  100%
                </span>
                <span className="text-sm text-stone-500 font-light tracking-wide">
                  Authentic Prints
                </span>
              </div>
              <div className="border-l-2 border-amber-600/30 pl-4">
                <span className="block text-2xl font-extralight text-stone-800 mb-1">
                  Handmade
                </span>
                <span className="text-sm text-stone-500 font-light tracking-wide">
                  With Love
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="#"
              className="group inline-flex items-center gap-4 px-8 py-4 border border-stone-900 text-stone-900 text-sm tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white transition-all duration-300"
            >
              Learn More About Us
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
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
