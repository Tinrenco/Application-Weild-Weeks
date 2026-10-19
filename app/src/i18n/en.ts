// English texts. Not shown yet: the MVP is in French only, but keeping this file
// complete means the English version is just a switch to turn on later.
import type { Translations } from "./fr";

export const en: Translations = {
  tabs: {
    home: "Home",
    calendar: "Calendar",
    map: "Map",
    favorites: "Favourites",
    profile: "Profile",
  },
  common: {
    comingSoon: "Coming soon",
    retry: "Retry",
    loading: "Loading…",
  },
  login: {
    welcome: "Welcome to the Weild Weeks app",
    viarezoButton: "Log in with ViaRézo",
    viarezoUnavailable: "ViaRézo login is not available yet.",
    devTitle: "Development login",
    devHint: "Pick a test user (fictional data).",
    apiUnreachable: "Cannot reach the API. Is it running?",
    organizer: "Orga",
    familyHead: "Head",
  },
  home: {
    greeting: (firstName: string) => `Hi ${firstName}!`,
    apiStatus: "API status",
    apiOk: "API and database reachable",
    apiDbDown: "API reachable, database unreachable",
    apiDown: "API unreachable",
  },
  profile: {
    family: "My family",
    noFamily: "You don't have a family yet.",
    familyHead: "Head",
    promo: (year: number) => `Class of ${year}`,
    logout: "Log out",
  },
};
