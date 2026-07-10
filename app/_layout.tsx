import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { athlete, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthGroup = ["login", "register", "index"].includes(
      segments[0] as string,
    );
    const inStackScreen = ["edit-profile", "public-profile"].includes(
      segments[0] as string,
    );

    if (athlete && !inTabsGroup && !inStackScreen) {
      router.replace("/(tabs)");
    } else if (!athlete && !inAuthGroup) {
      router.replace("/login");
    }
  }, [athlete, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={splash.container}>
        <Image
          source={require("../assets/splash.png")}
          style={splash.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  return <>{children}</>;
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061A0F",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "80%", height: "80%" },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: false };
  }
  componentDidCatch(error: any) {
    console.log("[ErrorBoundary]", error);
  }
  render() {
    return this.props.children;
  }
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
            </Stack>
          </AuthGate>
          <StatusBar hidden={true} />
        </View>
      </AuthProvider>
    </ErrorBoundary>
  );
}
