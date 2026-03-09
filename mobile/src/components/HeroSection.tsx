import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, Utensils, Bus, Users } from "lucide-react-native";

const heroImage = require("../../assets/hero-varanasi.jpg");

export default function HeroSection() {
  return (
    <View style={styles.container}>
      <Image source={heroImage} style={styles.image} resizeMode="cover" />

      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.title}>
          Explore the Spiritual{"\n"}
          <Text style={styles.highlight}>Heart of India</Text>
        </Text>

        <Text style={styles.subtitle}>
          Discover Varanasi's ancient temples, sacred ghats, legendary food and
          timeless culture.
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button}>
            <MapPin size={18} color="#fff" />
            <Text style={styles.buttonText}>Explore Places</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Utensils size={18} color="#fff" />
            <Text style={styles.buttonText}>Famous Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Bus size={18} color="#fff" />
            <Text style={styles.buttonText}>Transport</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Users size={18} color="#fff" />
            <Text style={styles.buttonText}>Find Guides</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 700,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  highlight: {
    color: "#ff8c00",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
  },

  buttons: {
    display:"flex",
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
    flexWrap:"wrap",
    justifyContent: "center",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff8c00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});