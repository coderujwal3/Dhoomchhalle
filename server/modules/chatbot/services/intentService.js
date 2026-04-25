/**
 * Intent Detection Service
 * Detects user intent from chat messages
 */

function detectIntent(message) {
    const msg = message.toLowerCase();

    if (/\b(hotels?|stays?|rooms?|hostels?|guest houses?|accommodations?)\b/.test(msg)) return "hotel";
    if (/\b(fares?|overcharges?|prices?|costs?|quotes?|charges?)\b/.test(msg)) return "fare";
    if (/\b(timings?|schedules?|departures?|arrivals?|when|time table|timetable)\b/.test(msg)) return "timing";
    if (/\b(routes?|directions|paths?|ways?|traffic)\b/.test(msg)) return "route";
    if (/\b(buses?|trains?|autos?|rickshaws?|taxis|taxi|cabs?|transport|ropeway)\b/.test(msg)) return "transport";
    if (/\b(safe|safety|scams?|danger|emergency|police|alerts?)\b/.test(msg)) return "safety";
    if (/\b(restaurants?|food|eat|snacks?|breakfast|lunch|dinner|lassi|chaat)\b/.test(msg)) return "food";
    if (/\b(places?|sights?|visit|ghats?|temples?|fort|sarnath|aarti)\b/.test(msg)) return "place";

    return "general";
}

module.exports = { detectIntent };
