// Root of the app (Expo Router). Loads fonts, provides the session, and decides
// which screens are reachable: the tabs when logged in, the login screen otherwise.
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "@/auth/SessionProvider";
import { EventsProvider } from "@/events/EventsProvider";
import { useT } from "@/i18n";
import { colors, fonts } from "@/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const t = useT();
  const { isLoading, user } = useSession();
  if (isLoading) return null;

  // EventsProvider shares the programme between the Calendar, Favourites and event pages.
  return (
    <EventsProvider userId={user?.id ?? null}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={user !== null}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="event/[id]"
            options={{
              headerShown: true,
              title: t.event.title,
              headerTintColor: colors.navy,
              headerTitleStyle: { fontFamily: fonts.extraBold, color: colors.navy },
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={user === null}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </EventsProvider>
  );
}
