// Profile tab: who I am, my sponsorship family, logout.
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/auth/SessionProvider";
import { Card, Screen, SectionTitle } from "@/components/Screen";
import { useT } from "@/i18n";
import { colors, fonts, spacing } from "@/theme";
import { router } from "expo-router";

export default function ProfileScreen() {
  const t = useT();
  const { user, signOut } = useSession();
  if (!user) return null; // cannot happen: this tab is only reachable when logged in

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.avatar}>{initials}</Text>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.muted}>{user.email}</Text>
        {user.promo !== null && <Text style={styles.muted}>{t.profile.promo(user.promo)}</Text>}
      </View>

      <SectionTitle>{t.profile.family}</SectionTitle>
      <Card>
        {user.family ? (
          <>
            <Text style={styles.familyName}>{user.family.name}</Text>
            {user.family.members.map((member) => (
              <View key={member.id} style={styles.member}>
                <Text style={styles.memberName}>
                  {member.firstName} {member.lastName}
                </Text>
                {member.isFamilyHead && <Text style={styles.tag}>{t.profile.familyHead}</Text>}
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.muted}>{t.profile.noFamily}</Text>
        )}
      </Card>
      {user.role === "ORGANIZER" && (
        <Pressable style={styles.organizer} onPress={() => router.push("/organizer")}>
          <Text style={styles.organizerText}>{t.organizer.title}</Text>
        </Pressable>
      )}
      <Pressable style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>{t.profile.logout}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: 2, marginVertical: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.navy,
    color: "#fff",
    fontFamily: fonts.extraBold,
    fontSize: 26,
    textAlign: "center",
    lineHeight: 72,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  name: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.navy },
  muted: { fontFamily: fonts.regular, color: colors.muted, fontSize: 13 },
  familyName: { fontFamily: fonts.bold, color: colors.orangeDark, fontSize: 16, marginBottom: 4 },
  member: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  memberName: { fontFamily: fonts.regular, color: colors.ink, fontSize: 13 },
  tag: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.orangeDark,
    backgroundColor: colors.sand,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  logout: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  organizer: { marginTop: spacing.lg, backgroundColor: colors.navy, borderRadius: 12, padding: 12 },
  organizerText: { fontFamily: fonts.bold, color: "#fff", textAlign: "center" },
  logoutText: { fontFamily: fonts.bold, color: colors.navy, textAlign: "center" },
});
