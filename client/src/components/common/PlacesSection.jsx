import { Clock, IndianRupee, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { useState } from "react";

import kashiImg from "../../assets/kashi-vishwanath.jpg";
import dashasImg from "../../assets/dashashwamedh-ghat.jpg";
import ramnagarImg from "../../assets/ramnagar-fort.jpg";

const places = [
  {
    name: "Kashi Vishwanath Temple",
    category: "Temple",
    image: kashiImg,
    description:
      "One of the most famous Hindu temples dedicated to Lord Shiva. The temple has been a symbol of spirituality and philosophy for thousands of years.",
    hours: "3:00 AM – 11:00 PM",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Kashi+Vishwanath+Temple+Varanasi",
  },
  {
    name: "Dashashwamedh Ghat",
    category: "Ghat",
    image: dashasImg,
    description:
      "The main ghat in Varanasi, known for its spectacular evening Ganga Aarti ceremony.",
    hours: "Open 24 hours (Aarti: 6:45 PM)",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Dashashwamedh+Ghat+Varanasi",
  },
  {
    name: "Ramnagar Fort",
    category: "Fort",
    image: ramnagarImg,
    description:
      "A magnificent 18th-century fort built in Mughal style, located on the eastern bank of the Ganges.",
    hours: "10:00 AM – 5:00 PM",
    fee: "₹15 (Indians) / ₹150 (Foreigners)",
    mapUrl: "https://maps.google.com/?q=Ramnagar+Fort+Varanasi",
  },
  {
    name: "Sankat Mochan Temple",
    category: "Temple",
    image: kashiImg,
    description:
      "A sacred temple dedicated to Lord Hanuman, believed to free devotees from all troubles.",
    hours: "4:00 AM – 9:30 PM",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Sankat+Mochan+Temple+Varanasi",
  },
  {
    name: "Assi Ghat",
    category: "Ghat",
    image: dashasImg,
    description:
      "A popular ghat at the confluence of the Assi and Ganges rivers.",
    hours: "Open 24 hours",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Assi+Ghat+Varanasi",
  },
  {
    name: "Chunar Fort",
    category: "Fort",
    image: ramnagarImg,
    description:
      "An ancient sandstone fort overlooking the Ganges with rich historical significance.",
    hours: "9:00 AM – 5:00 PM",
    fee: "₹25",
    mapUrl:
          "https://www.google.com/maps/dir//4VFG%2B87X+Chunar+Fort,+Tammanpatti,+Uttar+Pradesh+231304/@25.1233673,82.8731595,17z/data=!4m16!1m7!3m6!1s0x398fca9ab966d9b7:0xe7373052fefe2f1d!2sChunar+Fort!8m2!3d25.1233625!4d82.8757344!16s%2Fm%2F0nd2yrt!4m7!1m0!1m5!1m1!1s0x398fca9ab966d9b7:0xe7373052fefe2f1d!2m2!1d82.8757344!2d25.1233625?entry=ttu&g_ep=EgoyMDI2MDMwMi4wIKXMDSoASAFQAw%3D%3D",
  },
];

const categoryColors = {
  Temple: "bg-orange-400 text-white",
  Ghat: "bg-sky-500 text-white",
  Fort: "bg-amber-400 text-black",
};

const PlacesSection = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", "Temple", "Ghat", "Fort"];

  const filtered = places.filter((p) => {
    const matchCategory = filter === "All" || p.category === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section
      id="places"
      className="py-20 md:py-28 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] uppercase text-orange-500 mb-2">
              Discover
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-amber-600 mb-4">
              Tourist Places
            </h2>

            <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-4" />

            <p className="text-muted-foreground max-w-xl mx-auto">
              From ancient temples to sacred ghats and historic forts — explore
              the timeless landmarks of Varanasi.
            </p>
          </div>
        </ScrollReveal>

        {/* Filter */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search places..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-full border border-border bg-card text-foreground text-sm"
              />

              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
            </div>

            <div className="flex gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === cat
                      ? "bg-amber-300 text-orange-600 hover:bg-primary-hover font-bold shadow-warm"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((place, i) => (
            <ScrollReveal key={place.name} delay={i * 0.08}>
              <motion.div
                layout
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group bg-card rounded-lg overflow-hidden shadow-card"
              >
                <div className="relative h-52 overflow-hidden">
                  <motion.img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />

                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${categoryColors[place.category]}`}
                  >
                    {place.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">{place.name}</h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {place.description}
                  </p>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-600" />
                      {place.hours}
                    </div>

                    <div className="flex items-center gap-2">
                      <IndianRupee size={14} className="text-orange-600" />
                      {place.fee}
                    </div>
                  </div>

                  <motion.a
                    href={place.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold bg-sky-500 text-white text-sm"
                  >
                    <ExternalLink size={14} />
                    Get Directions
                  </motion.a>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PlacesSection;