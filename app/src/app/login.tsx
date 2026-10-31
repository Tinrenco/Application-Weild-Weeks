// Login screen: "Log in with ViaRézo" (see src/auth/viarezoLogin.ts). In development
// builds only, a list of fictional test users also lets you log in as any of them.
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { devLogin, getDevUsers, type DevUser } from "@/api/endpoints";
import { useSession } from "@/auth/SessionProvider";
import { loginWithViarezo, ViarezoLoginError } from "@/auth/viarezoLogin";
import { useT } from "@/i18n";
import { colors, fonts, radius, spacing } from "@/theme";

export default function LoginScreen() {
  const t = useT();

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>WEI</Text>
        <Text style={styles.welcome}>{t.login.welcome}</Text>

        <ViarezoLogin />

        {__DEV__ && <DevLogin />}
      </ScrollView>
    </SafeAreaView>
  );
}

function ViarezoLogin() {
  const t = useT();
  const { signIn } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setBusy(true);
    setError(null);
    try {
      const session = await loginWithViarezo();
      if (session) await signIn(session); // null: the user closed the browser
    } catch (e) {
      const reason = e instanceof ViarezoLoginError ? e.reason : "network";
      setError(
        reason === "access_denied"
          ? t.login.viarezoDenied
          : reason === "viarezo_not_configured"
            ? t.login.viarezoNotConfigured
            : t.login.viarezoFailed,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        disabled={busy}
        onPress={() => void login()}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t.login.viarezoButton}</Text>
        )}
      </Pressable>
      <Text style={error ? styles.loginError : styles.hint}>{error ?? t.login.viarezoHint}</Text>
    </>
  );
}

function DevLogin() {
  const t = useT();
  const { signIn } = useSession();
  const [users, setUsers] = useState<DevUser[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0); // incremented by "Retry" to reload the list

  useEffect(() => {
    let cancelled = false; // ignore the answer if the screen was left meanwhile
    getDevUsers().then(
      (list) => !cancelled && setUsers(list),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry() {
    setFailed(false);
    setAttempt((n) => n + 1);
  }

  return (
    <View style={styles.devBox}>
      <Text style={styles.devTitle}>{t.login.devTitle}</Text>
      <Text style={styles.devHint}>{t.login.devHint}</Text>

      {failed && (
        <>
          <Text style={styles.error}>{t.login.apiUnreachable}</Text>
          <Pressable onPress={retry}>
            <Text style={styles.link}>{t.common.retry}</Text>
          </Pressable>
        </>
      )}
      {!failed && users === null && <ActivityIndicator color={colors.navy} />}

      {users?.map((user) => (
        <Pressable
          key={user.id}
          style={styles.userRow}
          onPress={async () => signIn(await devLogin(user.id))}
        >
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userMeta}>
            {[
              user.role === "ORGANIZER" ? t.login.organizer : null,
              user.isFamilyHead ? t.login.familyHead : null,
              user.family?.name,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.navy },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  logo: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.sky,
    color: "#fff",
    fontFamily: fonts.extraBold,
    fontSize: 28,
    textAlign: "center",
    lineHeight: 120,
    overflow: "hidden",
  },
  welcome: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.orange, textAlign: "center" },
  button: { backgroundColor: colors.orange, borderRadius: 12, padding: 14 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: fonts.bold, color: "#fff", textAlign: "center", fontSize: 15 },
  hint: { fontFamily: fonts.regular, color: "#fff", opacity: 0.75, textAlign: "center", fontSize: 12 },
  loginError: { fontFamily: fonts.semiBold, color: colors.orange, textAlign: "center", fontSize: 13 },
  devBox: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  devTitle: { fontFamily: fonts.bold, color: colors.navy, fontSize: 15 },
  devHint: { fontFamily: fonts.regular, color: colors.muted, fontSize: 12 },
  error: { fontFamily: fonts.semiBold, color: colors.danger },
  link: { fontFamily: fonts.bold, color: colors.navy, textDecorationLine: "underline" },
  userRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: spacing.sm },
  userName: { fontFamily: fonts.semiBold, color: colors.ink, fontSize: 14 },
  userMeta: { fontFamily: fonts.regular, color: colors.muted, fontSize: 12 },
});
