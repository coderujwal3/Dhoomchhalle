import { ScrollView, StyleSheet } from "react-native";
import { enableScreens } from "react-native-screens";
import HotelCard from "@/src/components/HotelCard";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

enableScreens(true);
export default function Hotels() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <LinearGradient colors={["#F97316", "#fab505"]}>
        <Animated.View entering={FadeInDown}>
          <HotelCard style={styles.hotelCard} />
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  hotelCard: {
    width: "100%",
  },
});
