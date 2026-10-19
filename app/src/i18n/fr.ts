// French texts (default language). Every text shown to the user goes here,
// never directly in a component. The English file must have the same keys:
// TypeScript reports an error in en.ts if one is missing.

export const fr = {
  tabs: {
    home: "Accueil",
    calendar: "Calendrier",
    map: "Carte",
    favorites: "Favoris",
    profile: "Profil",
  },
  common: {
    comingSoon: "Bientôt ici",
    retry: "Réessayer",
    loading: "Chargement…",
  },
  login: {
    welcome: "Bienvenue sur l'appli des Weild Weeks",
    viarezoButton: "Se connecter avec ViaRézo",
    viarezoUnavailable: "Connexion ViaRézo pas encore disponible.",
    devTitle: "Connexion de développement",
    devHint: "Choisis un utilisateur de test (données fictives).",
    apiUnreachable: "Impossible de joindre l'API. Elle est lancée ?",
    organizer: "Orga",
    familyHead: "Chef",
  },
  home: {
    greeting: (firstName: string) => `Salut ${firstName} !`,
    apiStatus: "État de l'API",
    apiOk: "API et base de données joignables",
    apiDbDown: "API joignable, base de données injoignable",
    apiDown: "API injoignable",
  },
  profile: {
    family: "Ma famille",
    noFamily: "Tu n'as pas encore de famille.",
    familyHead: "Chef",
    promo: (year: number) => `Promo ${year}`,
    logout: "Se déconnecter",
  },
};

export type Translations = typeof fr;
