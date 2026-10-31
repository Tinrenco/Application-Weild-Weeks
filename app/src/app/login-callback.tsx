// Where the browser lands after a ViaRézo login (see src/auth/viarezoLogin.ts).
// - On the web preview, this page is opened in the login popup: maybeCompleteAuthSession()
//   hands the URL back to the main window and closes the popup.
// - On phones, the in-app browser already caught the URL; if the system still opens
//   this route (Android deep link), we just go back to the start.
import { Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function LoginCallbackScreen() {
  return <Redirect href="/" />;
}
