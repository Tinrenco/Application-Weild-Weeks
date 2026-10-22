// Basic building blocks shared by screens.
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useT } from "@/i18n";
import { colors, fonts, radius, spacing } from "@/theme";

type ScreenProps = {
  children: ReactNode;
  /** Pass both to enable pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
};

/** Scrollable screen with the app background and standard padding. */
export function Screen({ children, refreshing, onRefresh }: ScreenProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh && (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.navy}
          />
        )
      }
    >
      {children}
    </ScrollView>
  );
}

/** White rounded box, as used for cards in the prototype. */
export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

/** Section heading in small navy capitals, like "DERNIÈRES ANNONCES" in the prototype. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/** Placeholder for tabs that are not built yet. */
export function ComingSoon({ icon }: { icon: ComponentProps<typeof Ionicons>["name"] }) {
  const t = useT();
  return (
    <View style={styles.comingSoon}>
      <Ionicons name={icon} size={48} color={colors.line} />
      <Text style={styles.muted}>{t.common.comingSoon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.navy,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.md,
  },
  comingSoon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  muted: { fontFamily: fonts.semiBold, color: colors.muted },
});
