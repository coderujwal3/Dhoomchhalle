import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Star, MapPin } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const kachoriImg = require("../../assets/kachori-sabzi.jpg");
const paanImg = require("../../assets/banarasi-paan.jpg");
const malaiyyoImg = require("../../assets/malaiyyo.jpg");

const foods = [
  {
    name: "Kachori Sabzi",
    image: kachoriImg,
    description:
      "Crispy deep-fried kachori served with spicy potato curry and tangy chutney. The ultimate Banarasi breakfast staple loved by locals and tourists alike.",
    bestAt: "Kachori Gali, Vishwanath Lane",
    rating: 4.8,
  },
  {
    name: "Banarasi Paan",
    image: paanImg,
    description:
      "A legendary betel leaf preparation filled with gulkand, fennel seeds, and special ingredients. A refreshing post-meal tradition of Varanasi.",
    bestAt: "Keshav Tambul Bhandar, Godowlia",
    rating: 4.9,
  },
  {
    name: "Malaiyyo",
    image: malaiyyoImg,
    description:
      "A winter-only delicacy — light, frothy milk foam topped with saffron, pistachios, and cardamom. Collected at dawn and sold before sunrise disappears.",
    bestAt: "Chowk area, early morning vendors",
    rating: 4.7,
  },
];

const FoodSection = () => {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown}>
        <View style={styles.headerContainer}>
          <Text style={styles.subHeading}>TASTE</Text>
          <Text style={styles.heading}>Famous Varanasi Food</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            No trip is complete without savoring the iconic flavors of Banaras —
            from street-side kachoris to the legendary paan.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.listContainer}>
        {foods.map((food, i) => (
          <Animated.View
            key={food.name}
            entering={FadeInUp.delay(i * 150)}
            style={styles.card}
          >
            <Image source={food.image} style={styles.image} />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{food.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#ff8c00" fill="#ff8c00" />
                  <Text style={styles.ratingText}>{food.rating}</Text>
                </View>
              </View>

              <Text style={styles.cardDesc}>{food.description}</Text>

              <View style={styles.locationContainer}>
                <MapPin size={14} color="#9f0712" />
                <Text style={styles.locationText}>{food.bestAt}</Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
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
    color: "#9f0712",
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
    backgroundColor: "#ff8c00",
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
    gap: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  cardDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9f0712",
  },
});

export default FoodSection;
