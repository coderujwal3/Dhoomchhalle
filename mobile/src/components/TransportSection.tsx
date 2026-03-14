import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Car, Ship, Zap, Shield } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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
    <View style={styles.container}>
      <Animated.View entering={FadeInDown}>
        <View style={styles.headerContainer}>
          <Text style={styles.subHeading}>NAVIGATE</Text>
          <Text style={styles.heading}>Getting Around Varanasi</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            From auto-rickshaws to serene boat rides — everything you need to
            know about transportation in the holy city.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.listContainer}>
        {transports.map((t, i) => (
          <Animated.View
            key={t.name}
            entering={FadeInUp.delay(i * 150)}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <View style={styles.iconContainer}>
                <t.icon size={24} color="#ea580c" />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{t.name}</Text>
                  <Text style={styles.fare}>{t.fareRange}</Text>
                </View>
                <Text style={styles.cardDesc}>{t.description}</Text>
                <View style={styles.tipsContainer}>
                  {t.tips.map((tip) => (
                    <View key={tip} style={styles.tipRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInUp.delay(600)} style={styles.safetyCard}>
        <View style={styles.safetyHeader}>
          <View style={styles.shieldContainer}>
            <Shield size={28} color="#ea580c" />
          </View>
          <Text style={styles.safetyTitle}>Safety Tips for Tourists</Text>
        </View>
        <View style={styles.safetyGrid}>
          {safetyTips.map((tip, i) => (
            <View key={tip} style={styles.safetyTipRow}>
              <View style={styles.safetyBullet} />
              <Text style={styles.safetyTipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fffaf0",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f59e0b",
    letterSpacing: 2,
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: "#f97316",
    borderRadius: 2,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  listContainer: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
    elevation: 2,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "#ffedd5",
    padding: 10,
    borderRadius: 50,
    alignSelf: "flex-start",
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#991b1b",
  },
  fare: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  cardDesc: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
    marginBottom: 10,
  },
  tipsContainer: {
    gap: 4,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    backgroundColor: "#fb923c",
    borderRadius: 3,
  },
  tipText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
  safetyCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fed7aa",
    elevation: 2,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  shieldContainer: {
    backgroundColor: "#ffedd5",
    padding: 8,
    borderRadius: 50,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#991b1b",
  },
  safetyGrid: {
    gap: 8,
  },
  safetyTipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  safetyBullet: {
    width: 6,
    height: 6,
    backgroundColor: "#f97316",
    borderRadius: 3,
    marginTop: 6,
  },
  safetyTipText: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    lineHeight: 20,
  },
});

export default TransportSection;