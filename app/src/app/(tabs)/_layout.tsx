// The five tabs of the MVP: Home, Calendar, Map, Favourites, Profile.
// There is no shotgun tab: the shotgun button lives on the event detail page.
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { useT } from "@/i18n";
import { colors, fonts } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  // The tab bar always passes a colour string; the wider type comes from React Navigation.
  return function TabBarIcon({ color, size }: { color: ColorValue | null; size: number }) {
    return <Ionicons name={name} color={typeof color === "string" ? color : undefined} size={size} />;
  };
}

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabelStyle: { fontFamily: fonts.semiBold },
        headerTitleStyle: { fontFamily: fonts.extraBold, color: colors.navy },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.home, tabBarIcon: tabIcon("home-outline") }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t.tabs.calendar, tabBarIcon: tabIcon("calendar-outline") }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: t.tabs.map, tabBarIcon: tabIcon("map-outline") }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: t.tabs.favorites, tabBarIcon: tabIcon("star-outline") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t.tabs.profile, tabBarIcon: tabIcon("person-outline") }}
      />
    </Tabs>
  );
}
