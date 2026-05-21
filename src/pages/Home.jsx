import { Herosection } from "../components/Herosection";
import { Navbar } from "../components/Navbar";
import { Categories } from "../components/Categories";
import { Products } from "../components/Products";
import { About } from "../components/About";
import { Features } from "../components/Features";
import { Testimonials } from "../components/Testimonials";
import { Instagram } from "../components/Instagram";
import { Footer } from "../components/Footer";

export function Home() {
  return (
    <div>
      <Navbar />
      <Herosection />
      <Categories />
      <Products />
      <About />
      <Features />
      <Testimonials />
      <Instagram />
      <Footer />
    </div>
  );
}
