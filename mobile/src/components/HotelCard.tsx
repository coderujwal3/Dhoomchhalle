import { Text, View } from "react-native";
import { hotels } from "../../DB/hotelDB";

export default function HotelCard() {
  return (
    <View>
      {hotels.map((hotel) => (
        <View key={hotel.id}>
          <Text>{hotel.name}</Text>
          <Text>{hotel.location}</Text>
          <Text>₹{hotel.pricePerNight}/night</Text>
          <Text>⭐ {hotel.rating}</Text>
        </View>
      ))}
    </View>
  );
}
