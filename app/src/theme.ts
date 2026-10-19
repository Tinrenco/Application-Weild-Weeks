// Colours and fonts of the app, taken from the clickable prototype
// (appli-wei-prototype.html). Use these instead of hard-coded values.

export const colors = {
  navy: "#24398F", // titles, primary buttons
  navyDark: "#1B2C70",
  orange: "#EE9A2E", // accents, active tab
  orangeDark: "#C9761A", // event titles
  sky: "#3BB4EA",
  sand: "#FBF0D8",
  background: "#FBF8F2", // screen background
  card: "#FFFFFF",
  line: "#E6DFD0", // borders
  ink: "#1E2547", // body text
  muted: "#6B6F86", // secondary text
  inactive: "#9AA0B5", // inactive tab
  ok: "#2E9E5B",
  danger: "#D64545",
} as const;

/** Event type colours (same as the calendar filters in the prototype). */
export const eventTypeColors = {
  PARTY: "#7A1F4E",
  SNACK: "#EE9A2E",
  ASSOCIATION: "#24398F",
  SPORT: "#2E9E5B",
  SCHOOL: "#1C95D3",
} as const;

/** Font family names, loaded in src/app/_layout.tsx. */
export const fonts = {
  regular: "Montserrat_400Regular",
  semiBold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
  extraBold: "Montserrat_800ExtraBold",
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 } as const;
export const radius = { sm: 10, md: 14, lg: 18 } as const;
