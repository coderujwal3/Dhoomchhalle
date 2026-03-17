import React, { use, useState } from "react";
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import { getDistance } from "geolib";

// Pages and styles import
import { transports, transportBased } from "../../DB/transportDB";
import AppStyles from "../ApplyStyles/ApplyStyles";

interface TransportCardProps {
  style?: StyleProp<ViewStyle>;
}

// Google Maps API key
// const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

export default function transportCard({ style }: TransportCardProps) {
  const [userLocation, setUserLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [peoples, setPeoples] = useState(0);

  const [distance, setDistance] = useState(0);

  const calculateDistance = (userLocation: any, destination: any) => {
    if (userLocation && destination) {
        setDistance(24.7);
        setUserLocation("");
        setDestination("");
    }
      return 10;
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter your location"
          keyboardType="default"
          onChangeText={setUserLocation}
          maxLength={50}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Destination"
          keyboardType="default"
          onChangeText={setDestination}
          maxLength={50}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter number of People"
          keyboardType="numeric"
          onChangeText={(text) => setPeoples(Number(text) || 0)}
          maxLength={3}
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={() => calculateDistance(userLocation, destination)}
        >
          <Text style={styles.buttonText}>Calculate Fare</Text>
        </TouchableOpacity>
        <Text>Total Distance: {distance} km</Text>
        <Text>
          Bus Fare: ₹
          {distance *
            peoples *
            (transportBased.find((t) => t.id === "bus")?.Fare || 0)}
        </Text>
        <Text>
          Auto Rikshaw Fare: ₹
          {distance *
            peoples *
            (transportBased.find((t) => t.id === "auto")?.Fare || 0)}
        </Text>
        <Text>
          E-Rikshaw Fare: ₹
          {distance *
            peoples *
            (transportBased.find((t) => t.id === "erickshaw")?.Fare || 0)}
        </Text>
        <Text>
          Taxi Fare: ₹
          {distance *
            peoples *
            (transportBased.find((t) => t.id === "taxi")?.Fare || 0)}
        </Text>
      </View>
      {transports?.map((transport: any) => (
        <Animated.View
          key={transport.id}
          entering={FadeInUp}
          style={[styles.card, style]}
        >
          <Text style={{ fontSize: 18 }}>{transport.name}</Text>
          <Text>Price: ₹{transport.baseFare}</Text>
          <Text>Type: {transport.type}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    flex: 1,
    backgroundColor: "#fff",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  name: {
    marginTop: 10,
    fontSize: AppStyles.fontSize.large,
    fontWeight: "bold",
    color: AppStyles.color.hotelName,
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
  button: {
    backgroundColor: "#ff8c00",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
