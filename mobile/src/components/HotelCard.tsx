import {
  Text,
  View,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Linking,
  Platform
} from "react-native";
import { hotels } from "../../DB/hotelDB";
import Animated, { FadeInUp } from "react-native-reanimated";
import AppStyles from "../ApplyStyles/ApplyStyles";
import { PhoneCallIcon, MapPinIcon, StarIcon, CornerDownRightIcon } from "lucide-react-native";

interface HotelCardProps {
  style?: StyleProp<ViewStyle>;
}

const callNumber = (phone: string) => {
  const phoneNumber =
    Platform.OS === "android" ? `tel:${phone}` : `telprompt:${phone}`;
  Linking.openURL(phoneNumber).catch((err) => console.error("Error", err));
};

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

            <View style={styles.textSection}>
              <Text style={styles.ghatName}>{hotel.location}</Text>
              <View>
                <Text style={styles.text}>₹{hotel.pricePerNight}/night</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <StarIcon
                    size={AppStyles.fontSize.small + 2}
                    fill={"orange"}
                    stroke={"none"}
                  />
                  <Text style={styles.rating}>{hotel.rating}</Text>
                </View>
              </View>
            </View>

            {hotel.amenities.map((amenity) => (
              <View key={amenity} style={{ flexDirection: "row" }}>
                <CornerDownRightIcon size={16} />
                <Text style={styles.text}>{amenity}</Text>
              </View>
            ))}

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.buttonDirection}
                onPress={() => Linking.openURL(hotel.mapUrl)}
              >
                <MapPinIcon size={16} />
                <Text>Let's Go</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCall}
                onPress={() => callNumber(hotel.phone)}
              >
                <PhoneCallIcon size={16} />
                <Text>Contact</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </View>
    </>
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
    boxShadow: "-4px -4px 8px rgba(0, 0, 0, 0.4)",
  },
  name: {
    marginTop: 10,
    fontSize: AppStyles.fontSize.large,
    fontWeight: "bold",
    color: AppStyles.color.hotelName,
  },
  text: {
    fontSize: AppStyles.fontSize.verySmall,
    color: AppStyles.color.font,
  },
  ghatName: {
    fontSize: AppStyles.fontSize.medium,
    color: AppStyles.color.ghatNameColor,
    fontWeight: "bold",
    width: "50%",
  },
  rating: {
    color: "brown",
    fontWeight: "bold",
    fontSize: AppStyles.fontSize.verySmall,
  },
  textSection: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    padding: 3,
    gap: 2,
  },
  buttonSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    width: "100%",
    gap: 3,
  },
  buttonDirection: {
    width: "50%",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppStyles.color.background,
    color: AppStyles.color.ghatNameColor,
    textAlign: "center",
  },
  buttonCall: {
    width: "50%",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppStyles.color.buttonNotFill,
    color: AppStyles.color.font,
    borderWidth: 2,
    borderColor: AppStyles.color.background,
    textAlign: "center",
  },
});