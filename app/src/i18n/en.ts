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
  dates: {
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    time: (hours: number, minutes: number) => `${hours}:${String(minutes).padStart(2, "0")}`,
  },
  eventTypes: {
    PARTY: "Party",
    SNACK: "Snack",
    ASSOCIATION: "Clubs",
    SPORT: "Sport",
    SCHOOL: "School",
  },
  calendar: {
    title: "Weild Weeks",
    searchPlaceholder: "Search an event, a club, a place",
    clearSearch: "Clear search",
    filterBy: "Filter by",
    favoritesOnly: "★ Favourites",
    countOnDay: (n: number, day: string) => `${n} event${n > 1 ? "s" : ""} on ${day}`,
    countForSearch: (n: number, query: string) => `${n} result${n > 1 ? "s" : ""} for “${query}”`,
    noResults: "No matching event. Try a club or place name.",
    noEventsWithFilters: "No event with these filters.",
    loadFailed: "Could not load the programme.",
  },
  event: {
    title: "Details",
    by: (organizers: string) => `by ${organizers}`,
    notFound: "This event no longer exists.",
    addFavorite: "Add to favourites",
    inFavorites: "In your favourites",
    removeFavorite: "Remove from favourites",
    shotgunButton: "Go to the shotgun",
    shotgunOpens: (date: string) => `The shotgun opens ${date}.`,
    shotgunForHeads: "Shotgun: your family head books for the whole family.",
  },
  favorites: {
    emptyTitle: "No favourites yet",
    emptyHint: "Tap the star of an event in the calendar to find it here.",
    openCalendar: "Open the calendar",
  },
};
