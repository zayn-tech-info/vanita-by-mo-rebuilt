import { useState } from "react";

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Amara Johnson",
      location: "New York, USA",
      rating: 5,
      text: "The quality of craftsmanship is absolutely stunning. Every time I wear my Vantia dress, I receive countless compliments. It's not just clothing—it's wearable art that connects me to my heritage.",
      product: "Ankara Elegance Dress",
    },
    {
      id: 2,
      name: "Chioma Okonkwo",
      location: "London, UK",
      rating: 5,
      text: "I've been searching for authentic African fashion that doesn't compromise on modern style. Vantia delivered exactly that and more. The attention to detail in every stitch is remarkable.",
      product: "Kente Wrap Set",
    },
    {
      id: 3,
      name: "Fatou Diallo",
      location: "Paris, France",
      rating: 5,
      text: "From the moment I unboxed my order, I knew this was special. The fabrics are luxurious, the prints are vibrant, and the fit is perfect. Vantia has become my go-to for elegant occasions.",
      product: "Heritage Maxi Dress",
    },
    {
      id: 4,
      name: "Zainab Mohammed",
      location: "Dubai, UAE",
      rating: 5,
      text: "What I love most about Vantia is how they honor traditional African aesthetics while creating pieces that feel contemporary. I wear mine to the office and receive compliments every time.",
      product: "Tribal Fusion Blouse",
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section className="bg-[#faf9f7] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-amber-600"></span>
            <span className="text-amber-700 text-xs tracking-[0.4em] uppercase font-light">
              Testimonials
            </span>
            <span className="w-12 h-px bg-linear-to-l from-transparent to-amber-600"></span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-stone-800 tracking-wide">
            What Our <span className="text-amber-700 font-light">Clients</span>{" "}
            Say
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-200">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Testimonial Content */}
          <div className="bg-white p-6 sm:p-8 md:p-12 lg:p-16 shadow-sm border border-stone-100 mx-2 sm:mx-0">
            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mb-8">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-center mb-8">
              <p className="text-lg sm:text-xl lg:text-2xl text-stone-700 font-light leading-relaxed tracking-wide italic">
                "{testimonials[activeIndex].text}"
              </p>
            </blockquote>

            {/* Product Purchased */}
            <div className="text-center mb-8">
              <span className="text-xs tracking-[0.2em] uppercase text-amber-700 font-light">
                Purchased: {testimonials[activeIndex].product}
              </span>
            </div>

            {/* Author */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-stone-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-light text-stone-600">
                  {testimonials[activeIndex].name.charAt(0)}
                </span>
              </div>
              <h4 className="text-stone-800 font-light tracking-wide text-lg">
                {testimonials[activeIndex].name}
              </h4>
              <p className="text-stone-500 text-sm font-light tracking-wide">
                {testimonials[activeIndex].location}
              </p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 lg:-translate-x-16 w-10 h-10 sm:w-12 sm:h-12 border border-stone-300 bg-white text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 flex items-center justify-center group z-10"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
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
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 lg:translate-x-16 w-10 h-10 sm:w-12 sm:h-12 border border-stone-300 bg-white text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 flex items-center justify-center group z-10"
            aria-label="Next testimonial"
          >
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
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

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 h-2 bg-amber-600"
                  : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
