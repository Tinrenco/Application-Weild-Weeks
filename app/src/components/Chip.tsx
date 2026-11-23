// A small rounded button that can be selected: event type filters in the Calendar,
// event type choice in the organizer form.
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";

export function Chip(props: { label: string; selected: boolean; onPress: () => void; dotColor?: string }) {
  return (
    <Pressable
      style={[styles.chip, props.selected && styles.chipSelected]}
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: props.selected }}
    >
      {props.dotColor && <View style={[styles.chipDot, { backgroundColor: props.dotColor }]} />}
      <Text style={[styles.chipText, props.selected && styles.chipTextSelected]}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipSelected: { borderColor: colors.navy, backgroundColor: colors.navy },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.muted },
  chipTextSelected: { color: "#fff" },
});