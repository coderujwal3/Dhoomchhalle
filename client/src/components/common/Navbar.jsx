import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLenis } from "./SmoothScroll";

const navLinks = [
  { label: "Home", id: "home" },
  { label: "Places", id: "places" },
  { label: "Food", id: "food" },
  { label: "Transport", id: "transport" },
  { label: "Guides", id: "guides" },
];

const scrollToSection = (id) => {
  const lenis = getLenis();
  const el = document.getElementById(id);
  lenis.scrollTo(el, {
    offset: -80,
    duration: 1.5,
    easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
  });
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-gray-800/40 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <a
          href="#home"
          className="font-display text-2xl md:text-4xl font-extrabold bg-linear-20 from-amber-900 to-amber-700 bg-clip-text text-transparent"
        >
          Dhoomchalle
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.8, duration: 0.6 }}
              className={`font-sans text-lg font-medium transition-colors cursor-pointer relative group ${
                scrolled ? "text-shadow-white" : "text-white/80"
              }`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.id);
              }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.75 bg-red-700 transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-md ${scrolled ? "text-black" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
            className="md:hidden bg-background/98 backdrop-blur-md border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.id}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.id);
                    setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="font-sans text-base font-medium text-white py-2 hover:text-orange-600/60 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;