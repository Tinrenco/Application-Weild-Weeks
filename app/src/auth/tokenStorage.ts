// Where the session token is kept between app launches.
// - On phones: the secure storage of the system (expo-secure-store: Keychain / Keystore).
// - On the web preview (`npx expo start --web`, development only): expo-secure-store
//   does not exist there, so we fall back to the browser's localStorage.
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export async function readToken(key: string): Promise<string | null> {
  return isWeb ? localStorage.getItem(key) : SecureStore.getItemAsync(key);
}

export async function saveToken(key: string, token: string): Promise<void> {
  if (isWeb) localStorage.setItem(key, token);
  else await SecureStore.setItemAsync(key, token);
}

export async function deleteToken(key: string): Promise<void> {
  if (isWeb) localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}
