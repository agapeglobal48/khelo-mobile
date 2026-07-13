import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";

const SPORT_ICON_NAMES: Record<
  string,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  cricket: "cricket",
  football: "soccer",
  hockey: "hockey-sticks",
  boxing: "boxing-glove",
  athletics: "run",
  swimming: "swim",
  badminton: "badminton",
  volleyball: "volleyball",
  table_tennis: "table-tennis",
  wrestling: "arm-flex",
  weightlifting: "weight-lifter",
  cycling: "bike",
  tennis: "tennis",
  squash: "racquetball",
};

const DEFAULT_SPORT_ICON: keyof typeof MaterialCommunityIcons.glyphMap =
  "trophy-outline";

export function getSportIconName(
  sport?: string | null,
): keyof typeof MaterialCommunityIcons.glyphMap {
  if (!sport) return DEFAULT_SPORT_ICON;
  const key = sport.trim().toLowerCase().replace(/\s+/g, "_");
  return SPORT_ICON_NAMES[key] ?? DEFAULT_SPORT_ICON;
}

export function SportIcon({
  sport,
  size = 16,
  color = "#fff",
  style,
}: {
  sport?: string | null;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialCommunityIcons
      name={getSportIconName(sport)}
      size={size}
      color={color}
      style={style}
    />
  );
}
