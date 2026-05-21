import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
  };

  const shopLinks = [
    { name: "New Arrivals", href: "/shop?sort=newest" },
    { name: "Dresses", href: "/shop?category=dresses" },
    { name: "Tops & Blouses", href: "/shop?category=tops" },
    { name: "Sets", href: "/shop?category=sets" },
    { name: "Accessories", href: "/shop?category=accessories" },
    { name: "Sale", href: "/shop" },
  ];

  const customerLinks = [
    { name: "Contact Us", href: "#" },
    { name: "Shipping & Returns", href: "#" },
    { name: "Size Guide", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Track Order", href: "#" },
  ];

  const companyLinks = [
    { name: "Our Story", href: "/#our-story" },
    { name: "Sustainability", href: "#" },
    { name: "Craftsmanship", href: "/#our-craft" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ];

  return (
    <footer className="bg-stone-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-amber-500"></span>
                <span className="text-amber-400 text-xs tracking-[0.3em] uppercase font-light">
                  Stay Connected
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extralight tracking-wide mb-3">
                Join Our <span className="text-amber-400">Community</span>
              </h3>
              <p className="text-white/60 font-light tracking-wide">
                Subscribe for exclusive offers, new arrivals, and stories from
                our artisans.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-transparent border border-white/30 text-white placeholder:text-white/40 text-sm tracking-wide focus:outline-none focus:border-amber-500 transition-colors duration-300"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-amber-600 text-white text-sm tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="mb-6">
              <span className="w-12 h-px bg-linear-to-r from-transparent via-amber-600 to-transparent block mb-2"></span>
              <span className="text-2xl font-extralight tracking-[0.4em] text-white">
                VANTIA
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-4 h-[0.5px] bg-amber-600/60"></span>
                <span className="text-[9px] tracking-[0.5em] text-amber-500/80 font-light uppercase">
                  by M.O
                </span>
                <span className="w-4 h-[0.5px] bg-amber-600/60"></span>
              </div>
            </div>

            <p className="text-white/60 font-light tracking-wide leading-relaxed mb-8 max-w-sm">
              Celebrating African heritage through contemporary fashion.
              Handcrafted pieces that tell stories of tradition, culture, and
              timeless elegance.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://wa.link/8xiw63"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/70 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="https://www.instagram.com/vanitabymo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/70 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://web.facebook.com/people/Vanit%C3%A0-by-MO/100063574351459/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/70 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-white mb-6 font-light">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                    <Link
                      to={link.href}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-white/60 font-light tracking-wide hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-white/60 font-light tracking-wide hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-white mb-6 font-light">
              Help
            </h4>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                    <Link
                      to={link.href}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-white/60 font-light tracking-wide hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-white/60 font-light tracking-wide hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-white mb-6 font-light">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                    <Link
                      to={link.href}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-white/60 font-light tracking-wide hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-white/60 font-light tracking-wide hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <p className="text-white/40 text-xs sm:text-sm font-light tracking-wide text-center md:text-left order-1 md:order-none">
              © 2026 Vantia by M.O. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 order-2 md:order-none">
              <a
                href="#"
                className="text-white/40 text-sm font-light tracking-wide hover:text-white/70 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white/40 text-sm font-light tracking-wide hover:text-white/70 transition-colors duration-300"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-white/40 text-sm font-light tracking-wide hover:text-white/70 transition-colors duration-300"
              >
                Cookie Policy
              </a>
            </div>

            {/* Payment Icons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 order-3 md:order-none w-full md:w-auto">
              <span className="text-white/40 text-xs tracking-wide">
                We accept:
              </span>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white/60 text-[10px] font-medium">
                    VISA
                  </span>
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white/60 text-[10px] font-medium">
                    MC
                  </span>
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white/60 text-[10px] font-medium">
                    AMEX
                  </span>
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white/60 text-[10px] font-medium">
                    PP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
