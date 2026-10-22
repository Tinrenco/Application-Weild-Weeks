// Favourites tab: the events I starred, grouped by day.
// Reminders before each favourite (push notifications) come later.
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { EventRow } from "@/components/EventRow";
import { Card, Screen, SectionTitle } from "@/components/Screen";
import { formatDayLong, groupByDay } from "@/events/dates";
import { useEvents } from "@/events/EventsProvider";
import { useT } from "@/i18n";
import { colors, fonts, radius, spacing } from "@/theme";

export default function FavoritesScreen() {
  const t = useT();
  const { events, failed, refreshing, reload } = useEvents();
  const favorites = (events ?? []).filter((e) => e.isFavorite);

  return (
    <Screen refreshing={refreshing} onRefresh={() => void reload()}>
      {events === null && !failed && <ActivityIndicator color={colors.navy} />}
      {events === null && failed && <Text style={styles.muted}>{t.calendar.loadFailed}</Text>}

      {events !== null && favorites.length === 0 && (
        <Card>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t.favorites.emptyTitle}</Text>
            <Text style={styles.muted}>{t.favorites.emptyHint}</Text>
            <Pressable style={styles.button} onPress={() => router.navigate("/calendar")}>
              <Text style={styles.buttonText}>{t.favorites.openCalendar}</Text>
            </Pressable>
          </View>
        </Card>
      )}

      {groupByDay(favorites).map(([day, dayEvents]) => (
        <View key={day} style={styles.group}>
          <SectionTitle>{formatDayLong(t, day)}</SectionTitle>
          {dayEvents.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textAlign: "center" },
  empty: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.navy },
  button: {
    backgroundColor: colors.orange,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  buttonText: { fontFamily: fonts.bold, color: "#fff" },
  group: { gap: spacing.sm },
});
