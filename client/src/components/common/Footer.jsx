import { motion } from "framer-motion";

const Footer = () => (
  <footer className="bg-[#2E221E] text-white py-12 relative overflow-hidden flex flex-col justify-center">
    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-orange-500/40 to-transparent" />
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl font-extrabold text-gradient-saffron mb-3">
            Dhoomchalle
          </h3>
          <p className="font-sans text-sm text-gray-100/80">
            Your ultimate travel companion for exploring the spiritual heart of
            India - Varanasi.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h4 className="font-sans text-sm font-semibold text-white/90 mb-3 uppercase tracking-wider">
            Quick Links
          </h4>
          <div className="flex flex-col gap-2">
            {["Home", "Places", "Food", "Transport", "Guides"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="font-sans text-sm text-gray-100/80 hover:text-orange-400/70 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="font-sans text-sm font-semibold text-background mb-3 uppercase tracking-wider">
            Contact
          </h4>
          <p className="font-sans text-sm text-gray-100/80">
            Varanasi, Uttar Pradesh, India
          </p>
          <p className="font-sans text-sm text-gray-100/80">
            dhoomchalle@gmail.com
          </p>
        </motion.div>
      </div>
      <div className="border-t border-white/50 pt-6 text-center">
        <p className="font-sans text-base text-white/80">
          © 2026 Dhoomchalle. Made with ❤️ for travelers exploring Varanasi.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;