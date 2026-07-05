import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

const G = {
  bg: "#080E0A",
  surface: "#111811",
  card: "#141414",
  border: "#1E2E22",
  primary: "#09C068",
  gold: "#F5C842",
  text: "#F5F5F5",
  muted: "#7A8C80",
  dim: "#3A4A3E",
};

export default function LoginScreen() {
  const router = useRouter();
  const { setAthlete } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append("email", email.trim().toLowerCase());
      body.append("password", password);
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();
      if (res.ok) {
        setAthlete(data.data);
        router.replace("/(tabs)");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Cannot reach server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />

      {/* ── Full screen background ── */}
      <LinearGradient
        colors={["#062510", "#0A1A0F", "#080E0A", "#080E0A"]}
        locations={[0, 0.35, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Diagonal lines pattern ── */}
      <View style={styles.patternWrap} pointerEvents="none">
        {Array.from({ length: 24 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternLine,
              {
                top: i * 30 - 80,
                transform: [{ rotate: "-35deg" }],
                opacity: 0.05,
              },
            ]}
          />
        ))}
      </View>

      {/* ── Green glow top ── */}
      <View style={styles.glowTop} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* ── Logo area ── */}
          <View style={styles.logoArea}>
            <View style={styles.logoRing}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.appName}>KHELO</Text>

            <View style={styles.taglineRow}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>AI-POWERED TALENT DISCOVERY</Text>
              <View style={styles.taglineLine} />
            </View>
            <Text style={styles.taglineSub}>PUNJAB, PAKISTAN</Text>
          </View>

          {/* ── Login card ── */}
          <View style={styles.card}>
            {/* Card top accent */}
            <View style={styles.cardAccent} />

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSub}>
                Sign in to continue your journey
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={G.dim}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter password"
                  placeholderTextColor={G.dim}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showBtn}
                >
                  <Text style={styles.showBtnText}>
                    {showPassword ? "HIDE" : "SHOW"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#0FD97A", "#09C068", "#07A055"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>SIGN IN</Text>
                    <Text style={styles.loginBtnArrow}>→</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create account */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push("/register")}
              activeOpacity={0.8}
            >
              <Text style={styles.registerBtnText}>CREATE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Khelo? </Text>
            <TouchableOpacity
              onPress={() => router.push("/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Register here</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },

  patternWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  patternLine: {
    position: "absolute",
    left: -width,
    right: -width,
    height: 1,
    backgroundColor: "#09C068",
  },

  glowTop: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: G.primary,
    opacity: 0.08,
  },

  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 32 },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: "rgba(9,192,104,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: G.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImg: { width: 105, height: 105 },
  appName: {
    fontSize: 52,
    fontWeight: "900",
    color: G.primary,
    letterSpacing: 8,
    marginBottom: 10,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  taglineLine: { flex: 1, height: 0.5, backgroundColor: G.gold, opacity: 0.5 },
  tagline: {
    color: G.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  taglineSub: { color: G.muted, fontSize: 11, letterSpacing: 2 },

  // Card
  card: {
    backgroundColor: "rgba(20,20,20,0.95)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#252525",
  },
  cardAccent: { height: 3, backgroundColor: G.primary },
  cardHeader: { padding: 24, paddingBottom: 20 },
  cardTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: G.text,
    marginBottom: 4,
  },
  cardSub: { fontSize: 13, color: G.muted },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: 12,
  },
  errorIcon: { color: "#EF4444", fontSize: 14 },
  errorText: { flex: 1, color: "#EF4444", fontSize: 13, lineHeight: 18 },

  // Fields
  fieldWrap: { paddingHorizontal: 24, marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: G.muted,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
    borderWidth: 0.5,
    borderColor: "#282828",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 14, marginRight: 10, opacity: 0.5 },
  input: { flex: 1, color: G.text, fontSize: 15, paddingVertical: 14 },
  showBtn: { paddingLeft: 10, paddingVertical: 14 },
  showBtnText: {
    color: G.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Login button
  loginBtn: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 14,
    overflow: "hidden",
  },
  loginBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  loginBtnArrow: { color: "#fff", fontSize: 18, fontWeight: "300" },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: "#222" },
  dividerText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },

  // Register button
  registerBtn: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: "#2A2A2A",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  registerBtnText: {
    color: G.muted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: { color: G.dim, fontSize: 13 },
  footerLink: { color: G.primary, fontSize: 13, fontWeight: "700" },
});
