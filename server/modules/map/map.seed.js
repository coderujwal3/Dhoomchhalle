const Place = require("./place.model");
const Transport = require("./transport.model");
const { DEFAULT_TRANSPORTS } = require("./map.constants");

const DEFAULT_PLACES = [
  {
    name: "Dashashwamedh Ghat View Hotel",
    location: { type: "Point", coordinates: [82.9739, 25.3067] },
    price: 2800,
    type: "hotel",
    details: "River-facing stay near evening Ganga Aarti.",
  },
  {
    name: "Assi Ghat Riverside Hostel",
    location: { type: "Point", coordinates: [82.9991, 25.2877] },
    price: 850,
    type: "hotel",
    details: "Budget-friendly rooms close to cafes and ghats.",
  },
  {
    name: "Godowlia Heritage Inn",
    location: { type: "Point", coordinates: [82.9732, 25.3101] },
    price: 1900,
    type: "hotel",
    details: "Central location for old-city exploration.",
  },
  {
    name: "Lanka Comfort Stay",
    location: { type: "Point", coordinates: [83.0012, 25.2818] },
    price: 1200,
    type: "hotel",
    details: "Popular with students and short-stay travellers.",
  },
  {
    name: "Kashi Vishwanath Corridor Gate",
    location: { type: "Point", coordinates: [82.9736, 25.3108] },
    price: 0,
    type: "attraction",
    details: "Main access point to the temple corridor.",
  },
  {
    name: "Ramnagar Fort Entrance",
    location: { type: "Point", coordinates: [83.0245, 25.2921] },
    price: 50,
    type: "attraction",
    details: "Historic fort and museum across the river.",
  },
  {
    name: "Sarnath Archaeological Park",
    location: { type: "Point", coordinates: [83.0127, 25.3811] },
    price: 40,
    type: "attraction",
    details: "Buddhist heritage complex with museum nearby.",
  },
  {
    name: "Tulsi Manas Temple",
    location: { type: "Point", coordinates: [82.9985, 25.2946] },
    price: 0,
    type: "attraction",
    details: "White-marble temple dedicated to Lord Rama.",
  },
  {
    name: "Banarasi Paan Junction",
    location: { type: "Point", coordinates: [82.9718, 25.3083] },
    price: 90,
    type: "restaurant",
    details: "Classic sweet and meetha paan stop.",
  },
  {
    name: "Kachori Sabzi Point",
    location: { type: "Point", coordinates: [82.9707, 25.3134] },
    price: 120,
    type: "restaurant",
    details: "Morning-special kachori and jalebi spot.",
  },
  {
    name: "Malaiyyo Winter House",
    location: { type: "Point", coordinates: [82.9725, 25.3152] },
    price: 140,
    type: "restaurant",
    details: "Seasonal Banarasi dessert stop.",
  },
  {
    name: "Varanasi Junction Railway Station",
    location: { type: "Point", coordinates: [82.9732, 25.3158] },
    price: 0,
    type: "transport",
    details: "Major rail gateway for intercity travel.",
  },
  {
    name: "Lal Bahadur Shastri Airport",
    location: { type: "Point", coordinates: [82.8593, 25.4524] },
    price: 0,
    type: "transport",
    details: "Varanasi international airport terminal.",
  },
  {
    name: "Cantt Bus Stand",
    location: { type: "Point", coordinates: [82.9794, 25.3221] },
    price: 0,
    type: "transport",
    details: "Intercity and local buses to nearby districts.",
  },
  {
    name: "Sankat Mochan Temple",
    location: { type: "Point", coordinates: [82.9994, 25.2872] },
    price: 0,
    type: "attraction",
    details: "Famous Hanuman temple with regular aarti.",
  },
  {
    name: "BHU Main Gate",
    location: { type: "Point", coordinates: [82.9911, 25.2677] },
    price: 0,
    type: "attraction",
    details: "Entry point to Banaras Hindu University.",
  },
  {
    name: "Rajghat Bridge Viewpoint",
    location: { type: "Point", coordinates: [82.9821, 25.3384] },
    price: 0,
    type: "attraction",
    details: "Panoramic view of river and city skyline.",
  },
  {
    name: "Manikarnika Ghat Entry",
    location: { type: "Point", coordinates: [82.9679, 25.3118] },
    price: 0,
    type: "attraction",
    details: "One of the oldest sacred ghats.",
  },
  {
    name: "Harishchandra Ghat",
    location: { type: "Point", coordinates: [82.9811, 25.2997] },
    price: 0,
    type: "attraction",
    details: "Important ghat with strong cultural significance.",
  },
  {
    name: "Namo Ghat",
    location: { type: "Point", coordinates: [82.9948, 25.3477] },
    price: 0,
    type: "attraction",
    details: "Modern riverside ghat with activity zones.",
  },
];

async function seedMapDataIfEmpty() {
  const [transportCount, placeCount] = await Promise.all([
    Transport.countDocuments(),
    Place.countDocuments(),
  ]);

  if (transportCount === 0) {
    await Transport.insertMany(DEFAULT_TRANSPORTS);
    console.log("Seeded default transport pricing data");
  }

  if (placeCount === 0) {
    await Place.insertMany(DEFAULT_PLACES);
    console.log("Seeded default map places data");
  }
}

module.exports = {
  seedMapDataIfEmpty,
};
