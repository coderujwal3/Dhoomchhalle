import { Car, Ship, Zap, IndianRupee, Shield } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const transports = [
  { name: "Auto-Rickshaw", icon: Car, fareRange: "₹20 – ₹150", description: "The most common mode for short-distance travel. Available everywhere, negotiate the fare before boarding.", tips: ["Negotiate fare beforehand", "Use shared autos for budget travel", "Available 6 AM – 10 PM mostly"] },
  { name: "E-Rickshaw", icon: Zap, fareRange: "₹10 – ₹50", description: "Eco-friendly battery-powered rickshaws ideal for navigating narrow lanes and short distances within the city.", tips: ["Best for old city lanes", "Fixed routes available", "Cheaper than auto-rickshaws"] },
  { name: "Taxi / Cab", icon: Car, fareRange: "₹100 – ₹500+", description: "Available via apps like Ola/Uber or local services. Best for longer distances and airport transfers.", tips: ["Use Ola/Uber for metered fares", "Pre-book for airport trips", "AC available in most cabs"] },
  { name: "Boat Ride", icon: Ship, fareRange: "₹100 – ₹500", description: "An iconic experience — enjoy sunrise or sunset boat rides on the Ganges. Private and shared options available at all major ghats.", tips: ["Best at sunrise (5–7 AM)", "Negotiate for private boats", "Include Manikarnika Ghat view"] },
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
    <section id="transport" className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute -top-20 left-1/2 w-96 h-96 rounded-full bg-accent/5 blur-3xl -translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="font-sans text-sm tracking-[0.2em] uppercase text-primary mb-2">Navigate</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">Getting Around Varanasi</h2>
            <div className="w-20 h-1 bg-accent rounded-full mx-auto mb-4" />
            <p className="font-sans text-muted-foreground max-w-xl mx-auto">
              From auto-rickshaws to serene boat rides — everything you need to know about transportation in the holy city.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {transports.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 10px 40px -10px hsl(25 95% 53% / 0.15)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-card rounded-lg p-6 shadow-card transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 rounded-full bg-primary/10 text-primary shrink-0"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <t.icon size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">{t.name}</h3>
                      <span className="flex items-center gap-1 text-sm font-sans font-semibold text-primary">
                        <IndianRupee size={14} />
                        {t.fareRange}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-muted-foreground mb-3">{t.description}</p>
                    <ul className="space-y-1">
                      {t.tips.map((tip) => (
                        <li key={tip} className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
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
          <motion.div
            whileHover={{ boxShadow: "0 10px 40px -10px hsl(25 95% 53% / 0.12)" }}
            className="bg-card rounded-lg p-6 md:p-8 shadow-card border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <Shield className="text-primary" size={24} />
              </motion.div>
              <h3 className="font-display text-xl font-semibold text-foreground">Safety Tips for Tourists</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safetyTips.map((tip, i) => (
                <motion.div
                  key={tip}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 text-sm font-sans text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
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
