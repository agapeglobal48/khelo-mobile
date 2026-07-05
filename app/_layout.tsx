import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { athlete, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup   = segments[0] === "(tabs)";
    const inAuthGroup   = ["login", "register", "index", "forgot-password"].includes(segments[0] as string);
    const inStackScreen = ["edit-profile", "public-profile"].includes(segments[0] as string);

    if (athlete && !inTabsGroup && !inStackScreen) {
      router.replace("/(tabs)");
    } else if (!athlete && !inAuthGroup) {
      router.replace("/login");
    }
  }, [athlete, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#061A0F", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#09C068", alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#061A0F", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#09C068" }} />
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: false }; }
  componentDidCatch(error: any) { console.log("[ErrorBoundary]", error); }
  render() { return this.props.children; }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: "#061A0F" }}>
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "#061A0F" },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="register" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="edit-profile" />
              <Stack.Screen name="public-profile" />
              <Stack.Screen name="forgot-password" />
            </Stack>
          </AuthGate>
          <StatusBar hidden={true} />
        </View>
      </AuthProvider>
    </ErrorBoundary>
  );
}
