// Organizer space: lets the WEI board add events to the programme.
// Only reachable by organizers (see the guard in _layout.tsx).
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, spacing, eventTypeColors } from "@/theme";
import { Card, Screen, SectionTitle } from "@/components/Screen";
import { useT } from "@/i18n";
import { Chip } from "@/components/Chip";
import { createEvent, type EventType } from "@/api/endpoints";
import { router } from "expo-router";
import { useEvents } from "@/events/EventsProvider";

const EVENT_TYPES = Object.keys(eventTypeColors) as EventType[];
/** "2027-09-01" + "20:00" → a Date in the phone's time zone, or null if the text is not valid. */
function toDate(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return null;
  const result = new Date(`${date}T${time}:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}

export default function OrganizerScreen() {
  const t = useT();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("PARTY");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const { reload } = useEvents();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    if (title.trim() === "") {
      setError(t.organizer.missingTitle);
      return;
    }
    const startsAt = toDate(date, startTime);
    let endsAt = toDate(date, endTime);
    if (!startsAt || !endsAt) {
      setError(t.organizer.invalidDate);
      return;
    }
    // A party from 22:00 to 02:00 ends the next day.
    if (endsAt <= startsAt)
      endsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);

    setSending(true);
    setError(null);
    try {
      await createEvent({
        title,
        description,
        type,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        placeId: null,
        associationIds: [],
        shotgunUrl: null,
        shotgunOpensAt: null,
      });
      await reload();

      if (router.canGoBack()) router.back();
      else router.replace("/profile");
      
    } catch {
      setError(t.organizer.publishFailed);
      setSending(false);
    }
  }

  return (
    <Screen>
      <SectionTitle>{t.organizer.newEvent}</SectionTitle>
      <Card>
        <Text style={styles.label}>{t.organizer.titleLabel}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t.organizer.titlePlaceholder}
          placeholderTextColor={colors.muted}
        />
        <Text style={styles.label}>{t.organizer.typeLabel}</Text>
        <View style={styles.chips}>
          {EVENT_TYPES.map((eventType) => (
            <Chip
              key={eventType}
              label={t.eventTypes[eventType]}
              dotColor={eventTypeColors[eventType]}
              selected={type === eventType}
              onPress={() => setType(eventType)}
            />
          ))}
        </View>
        <Text style={styles.label}>{t.organizer.dateLabel}</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2027-09-01"
          placeholderTextColor={colors.muted}
        />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>{t.organizer.startLabel}</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="20:00"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>{t.organizer.endLabel}</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="20:00"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>
        <Text style={styles.label}>{t.organizer.descriptionLabel}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        {error !== null && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={() => void publish()}
          disabled={sending}
        >
          <Text style={styles.buttonText}>{t.organizer.publish}</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bold,
    color: colors.navy,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.regular,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.md,
  },
  row: { flexDirection: "row", gap: spacing.sm },
  rowItem: { flex: 1 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
error: { fontFamily: fonts.semiBold, color: colors.danger, marginBottom: spacing.sm },
  button: { backgroundColor: colors.navy, borderRadius: 12, padding: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: fonts.bold, color: "#fff", textAlign: "center" },
});
