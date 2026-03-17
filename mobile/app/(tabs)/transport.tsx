import { ScrollView, StyleSheet } from "react-native";
import { enableScreens } from "react-native-screens";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import TransportCard from "@/src/components/transportCard";

enableScreens(true);

export default function Home() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <LinearGradient colors={["#f97316", "#fab505"]}>
        <Animated.View entering={FadeInDown}>
          <TransportCard style={styles.hotelCard} />
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    
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
