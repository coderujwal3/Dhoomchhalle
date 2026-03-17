import "react-native-gesture-handler";
import { ScrollView, StyleSheet } from "react-native";
import { enableScreens } from "react-native-screens";
import HeroSection from "@/src/components/HeroSection";
import PlacesSection from "@/src/components/PlacesSection";
import FoodSection from "@/src/components/FoodSection";
import TransportSection from "@/src/components/TransportSection";
import GuidesSection from "@/src/components/GuidesSection";

enableScreens(true);

export default function Home() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HeroSection />
      <PlacesSection />
      <FoodSection />
      <TransportSection />
      <GuidesSection />
    </ScrollView>
  );
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});