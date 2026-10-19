// Home tab. For now: a greeting and a check that the app can reach the API.
// The "now / next" events and announcements come in weeks S7-S8.
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/api/client";
import { getHealth, type Health } from "@/api/endpoints";
import { useSession } from "@/auth/SessionProvider";
import { Card, Screen, SectionTitle } from "@/components/Screen";
import { useT } from "@/i18n";
import { colors, fonts } from "@/theme";

type Status = "loading" | "ok" | "dbDown" | "down";

function toStatus(health: Health): Status {
  return health.database === "ok" ? "ok" : "dbDown";
}

export default function HomeScreen() {
  const t = useT();
  const { user } = useSession();
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0); // incremented by "Retry" to re-run the check

  useEffect(() => {
    let cancelled = false; // ignore the answer if the screen was left meanwhile
    getHealth().then(
      (health) => !cancelled && setStatus(toStatus(health)),
      // A 503 from /health means the API runs but the database does not.
      (error) =>
        !cancelled &&
        setStatus(error instanceof ApiError && error.status === 503 ? "dbDown" : "down"),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry() {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }

  const label = {
    loading: t.common.loading,
    ok: t.home.apiOk,
    dbDown: t.home.apiDbDown,
    down: t.home.apiDown,
  }[status];
  const dotColor = status === "ok" ? colors.ok : status === "loading" ? colors.muted : colors.danger;

  return (
    <Screen>
      <Text style={styles.greeting}>{t.home.greeting(user?.firstName ?? "")}</Text>

      <SectionTitle>{t.home.apiStatus}</SectionTitle>
      <Card>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={styles.status}>{label}</Text>
        </View>
        {status !== "ok" && status !== "loading" && (
          <Pressable onPress={retry}>
            <Text style={styles.link}>{t.common.retry}</Text>
          </Pressable>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.extraBold, fontSize: 24, color: colors.navy },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  status: { fontFamily: fonts.semiBold, color: colors.ink, flexShrink: 1 },
  link: { fontFamily: fonts.bold, color: colors.navy, textDecorationLine: "underline", marginTop: 4 },
});
