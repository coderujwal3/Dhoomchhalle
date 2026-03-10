import { Car, Ship, Zap, Shield } from "lucide-react";
import { easeInOut, motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const transports = [
  {
    name: "Auto-Rickshaw",
    icon: Car,
    fareRange: "₹20 – ₹150",
    description:
      "The most common mode for short-distance travel. Available everywhere, negotiate the fare before boarding.",
    tips: [
      "Negotiate fare beforehand",
      "Use shared autos for budget travel",
      "Available 6 AM – 10 PM mostly",
    ],
  },
  {
    name: "E-Rickshaw",
    icon: Zap,
    fareRange: "₹10 – ₹50",
    description:
      "Eco-friendly battery-powered rickshaws ideal for navigating narrow lanes and short distances within the city.",
    tips: [
      "Best for old city lanes",
      "Fixed routes available",
      "Cheaper than auto-rickshaws",
    ],
  },
  {
    name: "Taxi / Cab",
    icon: Car,
    fareRange: "₹100 – ₹500+",
    description:
      "Available via apps like Ola/Uber or local services. Best for longer distances and airport transfers.",
    tips: [
      "Use Ola/Uber for metered fares",
      "Pre-book for airport trips",
      "AC available in most cabs",
    ],
  },
  {
    name: "Boat Ride",
    icon: Ship,
    fareRange: "₹100 – ₹500",
    description:
      "An iconic experience — enjoy sunrise or sunset boat rides on the Ganges. Private and shared options available at all major ghats.",
    tips: [
      "Best at sunrise (5–7 AM)",
      "Negotiate for private boats",
      "Include Manikarnika Ghat view",
    ],
  },
];

const safetyTips = [
  "Always carry small denominations for auto-rickshaws",
  "Avoid isolated ghats after dark",
  "Keep your belongings secure in crowded areas",
  "Use registered boat operators at ghats",
  "Stay hydrated — carry a water bottle",
  "Download offline maps for narrow lanes",
];

const TransportSection = () => {
  return (
    <section
      id="transport"
      className="py-20 md:py-28 bg-orange-100/30 relative overflow-hidden"
    >
      <div className="absolute top-20 left-[50%] translate-x-[-50%] w-82 h-32 rounded-full bg-linear-to-r from-orange-500/50 to-orange-200/50 blur-[60px]" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="font-sans text-sm tracking-[0.2em] uppercase text-amber-500 mb-2">
              Navigate
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Getting Around Varanasi
            </h2>
            <div className="w-20 h-1 bg-orange-500/80 rounded-full mx-auto mb-4" />
            <p className="font-sans text-muted-foreground max-w-xl mx-auto">
              From auto-rickshaws to serene boat rides — everything you need to
              know about transportation in the holy city.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {transports.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <motion.div
                whileHover={{
                  y: -4,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-amber-50/50 border-3 border-red-800 shadow-amber-500/30 shadow-[0px_2px_8px_amber] rounded-lg p-6 hover:shadow-orange-600/50 hover:shadow-lg hover:border-2 transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 rounded-full bg-orange-400/10 text-orange-600 shrink-0"
                    whileHover={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        ease: easeInOut,
                      },
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <t.icon size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-semibold text-red-800">
                        {t.name}
                      </h3>
                      <span className="flex items-center gap-1 text-sm font-sans font-semibold text-red-500 hover:scale-[1.15] transition-transform duration-300">
                        {t.fareRange}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-gray-700 mb-3">
                      {t.description}
                    </p>
                    <ul className="space-y-1">
                      {t.tips.map((tip) => (
                        <li
                          key={tip}
                          className="flex items-center gap-2 text-sm font-sans text-gray-800"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <motion.div className="bg-amber-50/50 border-3 border-red-800 shadow-amber-500/30 shadow-[0px_2px_8px_amber] hover:shadow-lg hover:shadow-orange-600/50 hover:border-2 transition-shadow duration-300 rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Shield
                  className="text-orange-500 bg-orange-300/40 p-2 rounded-full"
                  size={44}
                />
              </motion.div>
              <h3 className="font-sans text-xl font-semibold text-red-800">
                Safety Tips for Tourists
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safetyTips.map((tip, i) => (
                <motion.div
                  key={tip}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 text-sm font-sans text-gray-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80 mt-1.5 shrink-0" />
                  {tip}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TransportSection;
