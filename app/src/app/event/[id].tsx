// Event detail page, opened from the Calendar or Favourites.
// The shotgun button is only shown to family heads (and organizers): the API sends
// the shotgun link to them only. Other users just see that a shotgun exists.
// "See on the map" comes with the Map tab (weeks S9-S10).
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EventBadge, FavoriteStar } from "@/components/EventRow";
import { Card, Screen } from "@/components/Screen";
import { dayKey, formatDayAndTime, formatDayLong, formatTime } from "@/events/dates";
import { useEvents } from "@/events/EventsProvider";
import { useT } from "@/i18n";
import { colors, fonts, radius, spacing } from "@/theme";

export default function EventScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events } = useEvents();
  const event = events?.find((e) => e.id === Number(id));

  if (!event) {
    return (
      <Screen>
        <Text style={styles.muted}>{events === null ? t.common.loading : t.event.notFound}</Text>
      </Screen>
    );
  }

  const organizers = event.associations.map((a) => a.name).join(", ");
  const shotgun = event.shotgun;
  const shotgunNotOpenYet = shotgun?.opensAt != null && new Date(shotgun.opensAt) > new Date();

  return (
    <Screen>
      <View style={styles.hero}>
        <EventBadge event={event} size={52} />
        <View style={styles.heroText}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.muted}>
            {[organizers && t.event.by(organizers), t.eventTypes[event.type]]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      </View>

      <Info icon="calendar-outline" text={formatDayLong(t, dayKey(new Date(event.startsAt)))} />
      <Info
        icon="time-outline"
        text={`${formatTime(t, event.startsAt)} - ${formatTime(t, event.endsAt)}`}
      />
      {event.place && <Info icon="location-outline" text={event.place.name} />}

      {event.description !== "" && <Text style={styles.description}>{event.description}</Text>}

      {shotgun && (
        <Card>
          {shotgun.opensAt && shotgunNotOpenYet && (
            <Text style={styles.shotgunText}>
              {t.event.shotgunOpens(formatDayAndTime(t, shotgun.opensAt))}
            </Text>
          )}
          {shotgun.url ? (
            <Pressable style={styles.button} onPress={() => void Linking.openURL(shotgun.url!)}>
              <Text style={styles.buttonText}>{t.event.shotgunButton}</Text>
            </Pressable>
          ) : (
            <Text style={styles.muted}>{t.event.shotgunForHeads}</Text>
          )}
        </Card>
      )}

      <View style={styles.favorite}>
        <Text style={styles.favoriteLabel}>
          {event.isFavorite ? t.event.inFavorites : t.event.addFavorite}
        </Text>
        <FavoriteStar event={event} size={34} />
      </View>
    </Screen>
  );
}

function Info({ icon, text }: { icon: ComponentProps<typeof Ionicons>["name"]; text: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={16} color={colors.orangeDark} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: spacing.sm },
  heroText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.orangeDark },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  info: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  infoText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.orangeDark },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
    marginVertical: spacing.sm,
  },
  shotgunText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ink },
  button: {
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    padding: 12,
    marginTop: spacing.xs,
  },
  buttonText: { fontFamily: fonts.bold, color: "#fff", textAlign: "center" },
  favorite: { alignItems: "center", gap: spacing.xs, marginTop: spacing.md },
  favoriteLabel: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.orangeDark },
});
