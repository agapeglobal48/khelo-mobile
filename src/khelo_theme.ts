// ── Khelo Punjab Design Tokens ────────────────────────────────
export const COLORS = {
  // Backgrounds
  bg:          "#061A0F",   // deep dark green
  surface:     "#0C2A18",   // card background
  surfaceAlt:  "#0F3320",   // elevated surface
  border:      "#1A4728",   // border color

  // Brand
  primary:     "#09C068",   // primary green
  primaryDark: "#062520",   // deep green
  primaryLight:"#5DDE9A",   // light green
  gold:        "#F5C842",   // gold accent
  goldDark:    "#D4A017",   // dark gold

  // Text
  text:        "#F0FFF4",   // near white with green tint
  textMuted:   "#6B9E7A",   // muted green-grey
  textDim:     "#3A6B4A",   // dim text

  // Status
  success:     "#22C55E",
  warning:     "#F59E0B",
  error:       "#EF4444",

  // Overlay
  overlay:     "rgba(0,0,0,0.6)",
};

export const FONTS = {
  black:   "900" as const,
  bold:    "700" as const,
  semi:    "600" as const,
  regular: "400" as const,
};
