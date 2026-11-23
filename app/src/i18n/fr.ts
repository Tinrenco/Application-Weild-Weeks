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
    viarezoHint: "Ton compte ViaRézo (CentraleSupélec) suffit.",
    viarezoDenied: "Connexion annulée : l'appli a besoin de ton accord pour lire ton profil ViaRézo.",
    viarezoNotConfigured: "Connexion ViaRézo pas encore configurée sur ce serveur.",
    viarezoFailed: "La connexion ViaRézo a échoué. Réessaie.",
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
  dates: {
    weekdays: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    weekdaysShort: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], // grid columns, Monday first
    months: [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ],
    /** 16:00 → "16h", 16:45 → "16h45". */
    time: (hours: number, minutes: number) =>
      minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, "0")}`,
  },
  eventTypes: {
    PARTY: "Soirée",
    SNACK: "Goûter",
    ASSOCIATION: "Assos",
    SPORT: "Sport",
    SCHOOL: "École",
  },
  calendar: {
    title: "Weild Weeks",
    searchPlaceholder: "Rechercher un événement, une asso, un lieu",
    clearSearch: "Effacer la recherche",
    filterBy: "Filtrer par",
    favoritesOnly: "★ Favoris",
    countOnDay: (n: number, day: string) => `${n} événement${n > 1 ? "s" : ""} le ${day}`,
    countForSearch: (n: number, query: string) =>
      `${n} résultat${n > 1 ? "s" : ""} pour « ${query} »`,
    noResults: "Aucun événement ne correspond. Essaie un nom d'asso ou de lieu.",
    noEventsWithFilters: "Aucun événement avec ces filtres.",
    loadFailed: "Impossible de charger le programme.",
  },
  event: {
    title: "Détails",
    by: (organizers: string) => `par ${organizers}`,
    notFound: "Cet événement n'existe plus.",
    addFavorite: "Ajouter aux favoris",
    inFavorites: "Dans tes favoris",
    removeFavorite: "Retirer des favoris",
    shotgunButton: "Aller au shotgun",
    shotgunOpens: (date: string) => `Le shotgun ouvre ${date}.`,
    shotgunForHeads: "Shotgun : ton chef de famille réserve pour toute ta famille.",
  },
  favorites: {
    emptyTitle: "Aucun favori pour l'instant",
    emptyHint: "Touche l'étoile d'un événement dans le calendrier pour le retrouver ici.",
    openCalendar: "Ouvrir le calendrier",
  },
  organizer: {
    title: "Espace Organisateur",
    newEvent: "Ajouter un évènement",
    titleLabel: "Titre",
    titlePlaceholder: "Ex. : Soirée d'ouverture",
    typeLabel: "Type",
    dateLabel: "Date (AAAA-MM-JJ)",
    startLabel: "Début (HH:MM)",
    endLabel: "Fin (HH:MM)",
    descriptionLabel: "Description",
    publish: "Publier",
    missingTitle: "Donne un titre à l'événement.",
    invalidDate: "Date ou heure invalide. Exemple : 2027-09-01 et 20:00.",
    publishFailed: "L'envoi a échoué. Vérifie ta connexion et réessaie.",
    deleteEvent: "Supprimer l'événement",
    confirmDelete: "Confirmer la suppression",
    deleteFailed: "La suppression a échoué. Réessaie.",
  },
};

export type Translations = typeof fr;
