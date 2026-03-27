import { Phone, MessageCircle, Star, Globe } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "../../components/common/ui/ScrollReveal";

const guides = [
  {
    name: "Rajesh Pandey",
    languages: ["Hindi", "English", "Japanese"],
    experience: "15+ years",
    phone: "+918528938966",
    rating: 4.9,
    specialty: "Temple tours & spiritual walks",
  },
  {
    name: "Amit Sharma",
    languages: ["Hindi", "English", "French"],
    experience: "10+ years",
    phone: "+918528938966",
    rating: 4.8,
    specialty: "Heritage & photography tours",
  },
  {
    name: "Priya Singh",
    languages: ["Hindi", "English", "German"],
    experience: "8+ years",
    phone: "+918528938966",
    rating: 4.7,
    specialty: "Food walks & cultural immersion",
  },
];

const GuidesSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your inquiry! A guide will contact you shortly.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section
      id="guides"
      className="py-20 md:py-28 bg-gradient-warm relative overflow-hidden"
    >
      <div className="absolute top-20 right-20 w-52 h-52 rounded-full bg-linear-to-r from-orange-500/50 to-orange-200/50 blur-[50px]" />
      <div className="absolute bottom-80 left-50 w-60 h-60 rounded-full bg-linear-to-r from-orange-200/50 to-orange-500/70 blur-[80px]" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="font-sans text-sm tracking-[0.2em] uppercase text-amber-500 mb-2">
              Connect
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
              Verified Tourist Guides
            </h2>
            <div className="w-20 h-1 bg-orange-600/60 rounded-full mx-auto mb-4" />
            <p className="font-sans text-gray-500 max-w-xl mx-auto">
              Explore Varanasi with experienced, verified local guides who bring
              the city's stories to life.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {guides.map((guide, i) => (
            <ScrollReveal key={guide.name} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-orange-200/20 rounded-lg p-6 shadow-[3px_3px_4px_rgba(150,100,100,0.6)] hover:shadow-[20px_20px_20px_gray,5px_5px_5px_gray_inset]/40 transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 text-gold mb-3">
                  <Star size={18} fill="orange" className="stroke-0" />
                  <span className="font-sans text-sm font-semibold text-foreground">
                    {guide.rating}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">
                    · {guide.experience}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-red-800 mb-1">
                  {guide.name}
                </h3>
                <p className="font-sans text-sm text-amber-700 mb-3">
                  {guide.specialty}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={14} className="text-gray-700" />
                  <span className="font-sans text-sm text-gray-600">
                    {guide.languages.join(", ")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`tel:${guide.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-orange-500/60 text-white text-sm font-sans font-medium transition-colors"
                  >
                    <Phone size={14} /> Call
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://wa.me/${guide.phone.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-sky-400 text-white text-sm font-sans font-medium transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </motion.a>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <motion.div
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto bg-orange-200/30 rounded-lg p-6 md:p-8 shadow-[5px_5px_8px_rgba(150,100,100,0.6)] hover:shadow-[20px_20px_20px_gray,5px_5px_5px_gray_inset]/40 transition-shadow duration-300"
          >
            <h3 className="font-display text-2xl font-semibold text-red-800 mb-2 text-center">
              Book a Guide
            </h3>
            <p className="font-sans text-sm text-gray-500 text-center mb-6">
              Send an inquiry and we'll match you with the perfect guide.
            </p>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <input
                type="text"
                placeholder="Your Name"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-red-800 text-black font-sans text-sm focus:outline-none focus:ring-2 focus:ring-red-800/30 transition-shadow shadow-lg"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                maxLength={255}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-red-800 text-black font-sans text-sm focus:outline-none focus:ring-2 focus:ring-red-800/30 transition-shadow shadow-lg"
              />
              <textarea
                placeholder="Tell us about your travel plans..."
                required
                maxLength={1000}
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-red-800 text-black font-sans text-sm focus:outline-none focus:ring-2 focus:ring-red-800/30 resize-none transition-shadow shadow-lg"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-full bg-orange-400 text-orange-800 font-sans font-bold text-md shadow-[0px_0px_4px_gray] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.6)_inset,-2px_-2px_6px_#dd571c_inset] transition-shadow duration-500"
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              >
                Send Inquiry
              </motion.button>
            </form>
          </motion.div>
        </ScrollReveal>
        {/* <div
          className="h-20 max-w-sm mx-auto mt-8 bg-linear-to-b from-gray-400/70 to-gray-800/50"
          style={{ clipPath: "ellipse(48% 48% at 50% 50%)" }}
        ></div> */}
      </div>
    </section>
  );
};

export default GuidesSection;
