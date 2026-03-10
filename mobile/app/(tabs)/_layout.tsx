import { Tabs } from "expo-router";
import {
  HomeIcon,
  HotelIcon,
  BusIcon,
  MapIcon,
  Clock,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        animation: "fade",
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon(props) {
            return <HomeIcon {...props} />;
          },
        }}
      />

      <Tabs.Screen
        name="hotels"
        options={{
          title: "Hotels",
          tabBarIcon(props) {
            return <HotelIcon {...props} />;
          },
        }}
      />

      <Tabs.Screen
        name="transport"
        options={{
          title: "Transport",
          tabBarIcon(props) {
            return <BusIcon {...props} />;
          },
        }}
      />

      <Tabs.Screen
        name="routes"
        options={{
          title: "Routes",
          tabBarIcon(props) {
            return <MapIcon {...props} />;
          },
        }}
      />

      <Tabs.Screen
        name="timings"
        options={{
          title: "Timings",
          tabBarIcon(props) {
            return <Clock {...props} />;
          },
        }}
      />
    </Tabs>
  );
}
