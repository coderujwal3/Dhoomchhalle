import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Clock, IndianRupee, MapPinIcon, ExternalLink } from "lucide-react-native";

type Place = {
  name: string;
  category: string;
  image: any;
  description: string;
  hours: string;
  fee: string;
  mapUrl: string;
};

const PlaceCard = ({ item, index }: { item: Place; index: number }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 120)}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={item.image} style={styles.image} />

        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.name}</Text>

          <Text style={styles.desc}>{item.description}</Text>

          <View style={styles.row}>
            <Clock size={14} color="#ff8c00" />
            <Text style={styles.info}>{item.hours}</Text>
          </View>

          <View style={styles.row}>
            <IndianRupee size={14} color="#ff8c00" />
            <Text style={styles.info}>{item.fee}</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(item.mapUrl)}
            onPressIn={() => (scale.value = withSpring(0.95))}
            onPressOut={() => (scale.value = withSpring(1))}
          >
            <ExternalLink size={16} color="#fff" />
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  search: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 20,
  },

  activeFilter: {
    backgroundColor: "#ff8c00",
  },

  filterText: {
    fontSize: 12,
    color: "#333",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 180,
  },

  cardContent: {
    padding: 14,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  desc: {
    fontSize: 13,
    marginVertical: 8,
    backgroundColor: "transparent",
    color: "#666",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  info: {
    fontSize: 13,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "#00a6f4",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PlaceCard;
