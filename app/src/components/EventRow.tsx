// One event in a list (Calendar, Favourites): coloured badge, title, time, place, star.
// Tapping the row opens the event detail page.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Event } from "@/api/endpoints";
import { formatTime } from "@/events/dates";
import { useEvents } from "@/events/EventsProvider";
import { useT } from "@/i18n";
import { colors, eventTypeColors, fonts, radius, spacing } from "@/theme";

/** Short text in the badge: the first organiser's slug ("BDE"), or "CS" for school events. */
export function eventBadge(event: Event): string {
  const slug = event.associations[0]?.slug;
  return slug ? slug.slice(0, 3).toUpperCase() : "CS";
}

export function EventBadge({ event, size = 44 }: { event: Event; size?: number }) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: eventTypeColors[event.type] },
      ]}
    >
      <Text style={styles.badgeText}>{eventBadge(event)}</Text>
    </View>
  );
}

/** Favourite star; `size` lets the detail page show a bigger one. */
export function FavoriteStar({ event, size = 22 }: { event: Event; size?: number }) {
  const t = useT();
  const { toggleFavorite } = useEvents();
  return (
    <Pressable
      onPress={() => void toggleFavorite(event.id)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityState={{ selected: event.isFavorite }}
      accessibilityLabel={event.isFavorite ? t.event.removeFavorite : t.event.addFavorite}
    >
      <Ionicons
        name={event.isFavorite ? "star" : "star-outline"}
        size={size}
        color={event.isFavorite ? colors.orange : colors.inactive}
      />
    </Pressable>
  );
}

export function EventRow({ event }: { event: Event }) {
  const t = useT();
  return (
    <View style={styles.row}>
      <EventBadge event={event} />
      <Pressable
        style={styles.main}
        onPress={() => router.push({ pathname: "/event/[id]", params: { id: String(event.id) } })}
      >
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            <Ionicons name="time-outline" size={12} /> {formatTime(t, event.startsAt)} -{" "}
            {formatTime(t, event.endsAt)}
          </Text>
          {event.place && (
            <Text style={styles.metaText}>
              <Ionicons name="location-outline" size={12} /> {event.place.name}
            </Text>
          )}
        </View>
      </Pressable>
      <FavoriteStar event={event} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
  },
  badge: { borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  badgeText: { fontFamily: fonts.extraBold, fontSize: 12, color: "#fff" },
  main: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.orangeDark },
  meta: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.sm },
  metaText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
