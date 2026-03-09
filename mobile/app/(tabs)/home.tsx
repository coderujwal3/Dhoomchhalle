import "react-native-gesture-handler";
import { FlatList, StyleSheet } from "react-native";
import HeroSection from "@/src/components/HeroSection";
import PlacesSection from "@/src/components/PlacesSection";
import { enableScreens } from "react-native-screens";

enableScreens(true);

export default function Home() {
  return (
    <FlatList
      style={styles.container}
      data={[1]} // dummy data
      keyExtractor={(item) => item.toString()}
      renderItem={() => <PlacesSection />}
      ListHeaderComponent={<HeroSection />}
      showsVerticalScrollIndicator={false}
    />
  );
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});