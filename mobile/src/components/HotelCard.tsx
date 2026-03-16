import {
  Text,
  View,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
} from "react-native";
import { hotels } from "../../DB/hotelDB";
import Animated, { FadeInUp } from "react-native-reanimated";

interface HotelCardProps {
  style?: StyleProp<ViewStyle>;
}

export default function HotelCard({ style }: HotelCardProps) {
  return (
    <>
      <View style={styles.container}>
        {hotels.map((hotel) => (
        <Animated.View
          key={hotel.id}
          style={[styles.card, style]}
          entering={FadeInUp}
        >
          <Image source={{ uri: hotel.images.cover }} style={styles.image} />
          <Text style={styles.name}>{hotel.name}</Text>
          <Text style={styles.text}>{hotel.location}</Text>
          <Text style={styles.text}>₹{hotel.pricePerNight}night</Text>
          <Text style={styles.rating}>⭐ {hotel.rating}</Text>
          {hotel.amenities.map((amenity, index) => (
            <Text key={index} style={styles.text}>
              {index+1}:{amenity}
            </Text>
          ))}
        </Animated.View>
      ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "auto",
    flex: 1,
    backgroundColor: "#fff",
    gap: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: 10,
    boxShadow: "-2px -2px 4px rgba(0, 0, 0, 0.4)",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "orange",
  },
  text: {
    color: "black",
  },
  rating: {
    color: "orange",
  },
});