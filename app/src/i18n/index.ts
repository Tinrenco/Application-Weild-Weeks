// Minimal translation system: one typed object per language.
//
//   const t = useT();
//   <Text>{t.tabs.home}</Text>
//   <Text>{t.home.greeting(user.firstName)}</Text>
//
// Typos in keys are caught by TypeScript. To enable English later, make useT()
// return the language chosen by the user (stored in users.language on the API).
import { en } from "./en";
import { fr, type Translations } from "./fr";

export type Language = "fr" | "en";

const dictionaries: Record<Language, Translations> = { fr, en };

/** The MVP is French only. */
const CURRENT_LANGUAGE: Language = "fr";

export function useT(): Translations {
  return dictionaries[CURRENT_LANGUAGE];
}
