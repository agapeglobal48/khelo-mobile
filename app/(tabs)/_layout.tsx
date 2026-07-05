import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

// ── Tab icons as SVG for crisp rendering ─────────────────────
function HomeIcon({ focused }: { focused: boolean }) {
  const c = focused ? "#09C068" : "#555";
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12L12 4L21 12V21H15V15H9V21H3V12Z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={focused ? "rgba(9,192,104,0.15)" : "none"}
      />
    </Svg>
  );
}

function DiscoverIcon({ focused }: { focused: boolean }) {
  const c = focused ? "#09C068" : "#555";
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.8} />
      <Path
        d="M16.5 7.5L14 12L12 14L7.5 16.5L10 12L12 10L16.5 7.5Z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={focused ? "rgba(9,192,104,0.15)" : "none"}
      />
    </Svg>
  );
}

function EventsIcon({ focused }: { focused: boolean }) {
  const c = focused ? "#09C068" : "#555";
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6H21V20H3V6Z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={focused ? "rgba(9,192,104,0.1)" : "none"}
      />
      <Path
        d="M16 2V6M8 2V6"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path d="M3 10H21" stroke={c} strokeWidth={1.8} />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const c = focused ? "#09C068" : "#555";
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={c}
        strokeWidth={1.8}
        fill={focused ? "rgba(9,192,104,0.15)" : "none"}
      />
      <Path
        d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Custom tab bar ────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { key: "index", label: "Home", Icon: HomeIcon, isCreate: false },
    { key: "discover", label: "Discover", Icon: DiscoverIcon, isCreate: false },
    { key: "create", label: "", Icon: null, isCreate: true },
    { key: "trials", label: "Events", Icon: EventsIcon, isCreate: false },
    { key: "profile", label: "Profile", Icon: ProfileIcon, isCreate: false },
  ];

  return (
    <View
      style={[
        styles.barOuter,
        {
          paddingBottom: Math.max(
            insets.bottom,
            Platform.OS === "android" ? 8 : 4,
          ),
        },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route: any, i: number) => {
          const tab = tabs[i];
          const focused = state.index === i;

          if (tab.isCreate) {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.createWrap}
                activeOpacity={0.9}
                onPress={() => navigation.navigate(route.name)}
              >
                <View style={styles.createBtn}>
                  <Text style={styles.createIcon}>+</Text>
                </View>
              </TouchableOpacity>
            );
          }

          const Icon = tab.Icon!;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented)
                  navigation.navigate(route.name);
              }}
            >
              <Icon focused={focused} />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {focused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="trials" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barOuter: {
    backgroundColor: "#0A0A0A",
    borderTopWidth: 0.5,
    borderTopColor: "#1A1A1A",
  },
  bar: {
    flexDirection: "row",
    height: 58,
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 6,
    position: "relative",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555",
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: "#09C068",
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#09C068",
  },
  createWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#09C068",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#09C068",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#0A0A0A",
  },
  createIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
    marginTop: -2,
  },
});
