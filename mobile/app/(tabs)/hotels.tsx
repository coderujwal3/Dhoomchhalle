import { ScrollView, StyleSheet } from "react-native"
import { enableScreens } from "react-native-screens";
import HotelCard from "@/src/components/HotelCard";

enableScreens(true);
export default function Hotels() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HotelCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});