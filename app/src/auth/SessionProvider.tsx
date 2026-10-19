// Keeps track of who is logged in, for the whole app.
//
//   const { user, signIn, signOut } = useSession();
//
// The session token is stored in the phone's secure storage (expo-secure-store),
// so the user stays logged in after closing the app. signIn() takes a Session,
// whatever login method produced it (dev login today, ViaRézo OAuth later).
import * as SecureStore from "expo-secure-store";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, setAuthToken } from "@/api/client";
import { getMe, type Profile, type Session } from "@/api/endpoints";

const TOKEN_KEY = "session-token";

type SessionContextValue = {
  /** True while we check, at startup, whether a token is already stored. */
  isLoading: boolean;
  /** The logged-in user, or null when logged out. */
  user: Profile | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const value = use(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>");
  return value;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Profile | null>(null);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  const signIn = useCallback(async ({ token, user }: Session) => {
    setAuthToken(token);
    setUser(user);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }, []);

  // At startup: restore the stored session, if any.
  useEffect(() => {
    async function restore() {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;
      setAuthToken(token);
      try {
        setUser(await getMe());
      } catch (error) {
        // Expired or invalid token: forget it. Network errors keep the token for next time.
        if (error instanceof ApiError && error.status === 401) await signOut();
        else setAuthToken(null);
      }
    }
    restore().finally(() => setIsLoading(false));
  }, [signOut]);

  const value = useMemo(
    () => ({ isLoading, user, signIn, signOut }),
    [isLoading, user, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
