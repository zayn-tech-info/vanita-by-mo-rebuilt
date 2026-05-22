export function Features() {
  const features = [
    {
      id: 1,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      title: "Free Worldwide Shipping",
      description:
        "Complimentary shipping on orders over $150. Delivered with care to your doorstep.",
    },
    {
      id: 2,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
      title: "Handcrafted Excellence",
      description:
        "Each piece is meticulously crafted by skilled artisans using traditional techniques.",
    },
    {
      id: 3,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      title: "Easy Returns",
      description:
        "30-day hassle-free returns. Not in love? Send it back, no questions asked.",
    },
    {
      id: 4,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: "Thoughtful Service",
      description:
        "From browsing to delivery, we aim for a smooth, personal shopping experience.",
    },
  ];

  return (
    <section id="our-craft" className="bg-stone-900 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={feature.id} className="text-center group relative">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 text-amber-400 border border-amber-600/30 group-hover:border-amber-400 group-hover:bg-amber-400/10 transition-all duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-white font-light tracking-wide mb-3 text-lg">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-white/60 font-light text-sm tracking-wide leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Line */}
              {index < features.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
