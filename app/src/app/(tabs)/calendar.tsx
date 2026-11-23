// Calendar tab: the whole Weild Weeks programme.
// - a grid of days (full weeks, from the first to the last event); a dot marks days with events;
// - a search bar that looks through ALL events (title, organisers, place, type, description);
// - filter chips by type, and "favourites only";
// - the list of events of the selected day, or the search results grouped by day.
// Everything is filtered on the phone: the API sends the whole programme at once.
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Event, EventType } from "@/api/endpoints";
import { EventRow } from "@/components/EventRow";
import { Card, Screen, SectionTitle } from "@/components/Screen";
import { dateFromKey, dayKey, formatDayLong, fullWeeksBetween, groupByDay } from "@/events/dates";
import { useEvents } from "@/events/EventsProvider";
import { useT } from "@/i18n";
import type { Translations } from "@/i18n/fr";
import { colors, eventTypeColors, fonts, radius, spacing } from "@/theme";
import { Chip } from "@/components/Chip";

const EVENT_TYPES = Object.keys(eventTypeColors) as EventType[];

/** Lower case, no accents: "Goûter" and "gouter" match. */
function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchesSearch(event: Event, query: string, t: Translations): boolean {
  const fields = [
    event.title,
    event.description,
    event.place?.name ?? "",
    t.eventTypes[event.type],
    ...event.associations.map((a) => a.name),
  ];
  return fields.some((field) => normalize(field).includes(query));
}

export default function CalendarScreen() {
  const t = useT();
  const { events, failed, refreshing, reload } = useEvents();
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<Set<EventType>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Days shown in the grid, and which of them have events.
  const { days, daysWithEvents } = useMemo(() => {
    const keys = (events ?? []).map((e) => dayKey(new Date(e.startsAt)));
    const first = keys[0];
    const last = keys[keys.length - 1];
    return {
      days: first && last ? fullWeeksBetween(first, last) : [],
      daysWithEvents: new Set(keys),
    };
  }, [events]);

  const today = dayKey(new Date());
  // Until the user taps a day: today if it is in the grid, otherwise the first day with events.
  const day = selectedDay ?? (days.includes(today) ? today : ([...daysWithEvents][0] ?? today));

  const search = normalize(query.trim());
  const visible = (events ?? []).filter(
    (e) =>
      (search ? matchesSearch(e, search, t) : dayKey(new Date(e.startsAt)) === day) &&
      (types.size === 0 || types.has(e.type)) &&
      (!favoritesOnly || e.isFavorite),
  );

  function toggleType(type: EventType) {
    setTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  if (events === null) {
    return (
      <View style={styles.center}>
        {failed ? (
          <>
            <Text style={styles.muted}>{t.calendar.loadFailed}</Text>
            <Pressable onPress={() => void reload()}>
              <Text style={styles.link}>{t.common.retry}</Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator color={colors.navy} />
        )}
      </View>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void reload()}>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t.calendar.searchPlaceholder}
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query !== "" && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={8}
            accessibilityLabel={t.calendar.clearSearch}
          >
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {!search && (
        <DayGrid
          days={days}
          daysWithEvents={daysWithEvents}
          today={today}
          selected={day}
          onSelect={setSelectedDay}
        />
      )}

      <Text style={styles.filterLabel}>{t.calendar.filterBy}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip
          label={t.calendar.favoritesOnly}
          selected={favoritesOnly}
          onPress={() => setFavoritesOnly((v) => !v)}
        />
        {EVENT_TYPES.map((type) => (
          <Chip
            key={type}
            label={t.eventTypes[type]}
            dotColor={eventTypeColors[type]}
            selected={types.has(type)}
            onPress={() => toggleType(type)}
          />
        ))}
      </ScrollView>

      <Text style={styles.count}>
        {search
          ? t.calendar.countForSearch(visible.length, query.trim())
          : t.calendar.countOnDay(visible.length, formatDayLong(t, day))}
      </Text>

      {visible.length === 0 && (
        <Text style={[styles.muted, styles.centerText]}>
          {search ? t.calendar.noResults : t.calendar.noEventsWithFilters}
        </Text>
      )}

      {search
        ? groupByDay(visible).map(([key, dayEvents]) => (
            <View key={key} style={styles.group}>
              <SectionTitle>{formatDayLong(t, key)}</SectionTitle>
              {dayEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </View>
          ))
        : visible.map((e) => <EventRow key={e.id} event={e} />)}
    </Screen>
  );
}

function DayGrid(props: {
  days: string[];
  daysWithEvents: Set<string>;
  today: string;
  selected: string;
  onSelect: (day: string) => void;
}) {
  const t = useT();
  const first = props.days[0];
  const last = props.days[props.days.length - 1];

  return (
    <Card>
      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>{t.calendar.title}</Text>
        {first && last && (
          <Text style={styles.muted}>
            {dateFromKey(first).getDate()} {t.dates.months[dateFromKey(first).getMonth()]} ·{" "}
            {dateFromKey(last).getDate()} {t.dates.months[dateFromKey(last).getMonth()]}
          </Text>
        )}
      </View>
      <View style={styles.grid}>
        {t.dates.weekdaysShort.map((name) => (
          <Text key={name} style={[styles.cell, styles.weekday]}>
            {name}
          </Text>
        ))}
        {props.days.map((key) => {
          const isSelected = key === props.selected;
          return (
            <Pressable
              key={key}
              style={[styles.cell, styles.dayButton, isSelected && styles.daySelected]}
              onPress={() => props.onSelect(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={formatDayLong(t, key)}
            >
              <Text
                style={[
                  styles.dayText,
                  key === props.today && styles.dayToday,
                  !props.daysWithEvents.has(key) && styles.dayEmpty,
                  isSelected && styles.daySelectedText,
                ]}
              >
                {dateFromKey(key).getDate()}
              </Text>
              {props.daysWithEvents.has(key) && (
                <View style={[styles.dot, isSelected && { backgroundColor: "#fff" }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  centerText: { textAlign: "center" },
  muted: { fontFamily: fonts.regular, color: colors.muted, fontSize: 12 },
  link: { fontFamily: fonts.bold, color: colors.navy, textDecorationLine: "underline" },

  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 11,
  },

  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gridTitle: { fontFamily: fonts.bold, color: colors.navy, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, alignItems: "center" },
  weekday: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 2,
  },
  dayButton: { height: 36, justifyContent: "center", borderRadius: radius.sm },
  daySelected: { backgroundColor: colors.orange },
  dayText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ink },
  dayToday: { color: colors.orangeDark },
  dayEmpty: { color: "#C9C3B4" },
  daySelectedText: { color: "#fff" },
  dot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.sky,
  },

  filterLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.navy, marginTop: spacing.xs },
  chips: { gap: 6 },
  
  count: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.orangeDark,
    textAlign: "center",
    marginVertical: spacing.sm,
  },
  group: { gap: spacing.sm },
});
