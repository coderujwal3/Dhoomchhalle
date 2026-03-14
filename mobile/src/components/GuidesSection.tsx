import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import { Phone, MessageCircle, Star, Globe } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert(
        "Missing Fields",
        "Please fill out all the fields before submitting.",
      );
      return;
    }
    Alert.alert(
      "Success!",
      "Thank you for your inquiry! A guide will contact you shortly.",
    );
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown}>
        <View style={styles.headerContainer}>
          <Text style={styles.subHeading}>CONNECT</Text>
          <Text style={styles.heading}>Verified Tourist Guides</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            Explore Varanasi with experienced, verified local guides who bring
            the city's stories to life.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.guidesList}>
        {guides.map((guide, i) => (
          <Animated.View
            key={guide.name}
            entering={FadeInUp.delay(i * 150)}
            style={styles.guideCard}
          >
            <View style={styles.ratingRow}>
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{guide.rating}</Text>
              <Text style={styles.experienceText}> · {guide.experience}</Text>
            </View>
            <Text style={styles.guideName}>{guide.name}</Text>
            <Text style={styles.guideSpecialty}>{guide.specialty}</Text>

            <View style={styles.languageRow}>
              <Globe size={14} color="#4b5563" />
              <Text style={styles.languageText}>
                {guide.languages.join(", ")}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${guide.phone}`)}
              >
                <Phone size={14} color="#fff" />
                <Text style={styles.buttonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.waButton}
                onPress={() =>
                  Linking.openURL(
                    `https://wa.me/${guide.phone.replace("+", "")}`,
                  )
                }
              >
                <MessageCircle size={14} color="#fff" />
                <Text style={styles.buttonText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInUp.delay(500)}
        style={styles.formContainer}
      >
        <Text style={styles.formTitle}>Book a Guide</Text>
        <Text style={styles.formSubtitle}>
          Send an inquiry and we'll match you with the perfect guide.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          maxLength={100}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          maxLength={255}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your travel plans..."
          maxLength={1000}
          multiline
          numberOfLines={4}
          value={formData.message}
          onChangeText={(text) => setFormData({ ...formData, message: text })}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Send Inquiry</Text>
        </TouchableOpacity>
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
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: "rgba(234, 88, 12, 0.6)",
    borderRadius: 2,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  guidesList: {
    gap: 16,
    marginBottom: 32,
  },
  guideCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fed7aa",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    color: "#333",
  },
  experienceText: {
    fontSize: 12,
    color: "#6b7280",
  },
  guideName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 4,
  },
  guideSpecialty: {
    fontSize: 14,
    color: "#b45309",
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  languageText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(249, 115, 22, 0.8)",
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  waButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#38bdf8",
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#fed7aa",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#991b1b",
    textAlign: "center",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(153, 27, 27, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#fb923c",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#9a3412",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GuidesSection;