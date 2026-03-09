import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import PlaceCard from "./ui/PlaceCard";

import { Clock, IndianRupee, MapPinIcon, ExternalLink } from "lucide-react-native";

const kashiImg = require("../../assets/kashi-vishwanath.jpg");
const dashasImg = require("../../assets/dashashwamedh-ghat.jpg");
const ramnagarImg = require("../../assets/ramnagar-fort.jpg");

type Place = {
  name: string;
  category: string;
  image: any;
  description: string;
  hours: string;
  fee: string;
  mapUrl: string;
};

const places: Place[] = [
  {
    name: "Kashi Vishwanath Temple",
    category: "Temple",
    image: kashiImg,
    description:
      "One of the most famous Hindu temples dedicated to Lord Shiva.",
    hours: "3:00 AM – 11:00 PM",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Kashi+Vishwanath+Temple+Varanasi",
  },
  {
    name: "Dashashwamedh Ghat",
    category: "Ghat",
    image: dashasImg,
    description: "The main ghat in Varanasi known for the evening Ganga Aarti.",
    hours: "Open 24 hours",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Dashashwamedh+Ghat+Varanasi",
  },
  {
    name: "Ramnagar Fort",
    category: "Fort",
    image: ramnagarImg,
    description:
      "A magnificent 18th-century fort on the eastern bank of the Ganges.",
    hours: "10:00 AM – 5:00 PM",
    fee: "₹15",
    mapUrl: "https://maps.google.com/?q=Ramnagar+Fort+Varanasi",
  },
  {
    name: "Sankat Mochan Temple",
    category: "Temple",
    image: kashiImg,
    description:
      "A sacred temple dedicated to Lord Hanuman, believed to free devotees from all troubles. Famous for its laddoos offered as prasad.",
    hours: "4:00 AM – 9:30 PM",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Sankat+Mochan+Temple+Varanasi",
  },
  {
    name: "Assi Ghat",
    category: "Ghat",
    image: dashasImg,
    description:
      "A popular ghat at the confluence of the Assi and Ganges rivers. Known for morning yoga sessions and a vibrant cultural hub for artists and travelers.",
    hours: "Open 24 hours",
    fee: "Free",
    mapUrl: "https://maps.google.com/?q=Assi+Ghat+Varanasi",
  },
  {
    name: "Chunar Fort",
    category: "Fort",
    image: ramnagarImg,
    description:
      "An ancient sandstone fort overlooking the Ganges, with a history dating back to 56 BC. Offers panoramic views and rich historical significance.",
    hours: "9:00 AM – 5:00 PM",
    fee: "₹25",
    mapUrl: "https://maps.google.com/?q=Chunar+Fort+Varanasi",
  },
];

export default function PlacesSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Temple", "Ghat", "Fort"];

  const filtered = places.filter((p) => {
    const matchCategory = filter === "All" || p.category === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const renderPlace = ({ item, index }: { item: Place; index: number }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View entering={FadeInUp.delay(index * 120)}>
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

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInDown} style={styles.heading}>
        Tourist Places
      </Animated.Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
          width: "100%",
          backgroundColor: "#f3f3f3",
          padding: 3,
          borderRadius: 12,
          flex:1,
        }}
      >
        <MapPinIcon
          size={22}
          color="#6a7282"
        />
        <TextInput
          placeholder="Search places..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
      </View>

      <View style={styles.filterRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterButton, filter === cat && styles.activeFilter]}
            onPress={() => setFilter(cat)}
          >
            <Text style={styles.filterText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <PlaceCard item={item} index={index} />
        )}
        initialNumToRender={4}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#9f0712",
    textAlign: "center",
    textDecorationStyle: "double",
    textDecorationLine: "underline",
    textDecorationColor: "#ff8c00",
  },

  search: {
    padding: 10,
    width: "90%",
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
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  desc: {
    fontSize: 13,
    marginVertical: 8,
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
    backgroundColor: "#87ceeb",
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
