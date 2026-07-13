import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../config/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.message || "Something went wrong.");
    } catch {
      setError("Cannot reach server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar hidden={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#CCC" />
            </TouchableOpacity>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
            />
          </View>

          {!sent ? (
            <>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email and we will send you a link to reset
                your password.
              </Text>

              {error ? (
                <View
                  style={[
                    styles.errorBox,
                    { flexDirection: "row", alignItems: "flex-start", gap: 8 },
                  ]}
                >
                  <Ionicons name="alert-circle" size={14} color="#09C068" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#444"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleSend}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>SEND RESET LINK</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            /* Success state */
            <>
              <View style={styles.successIconWrap}>
                <Ionicons name="mail-open-outline" size={64} color="#09C068" />
              </View>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We have sent a password reset link to{"\n"}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <Text style={styles.hint}>
                Tap the link in the email to reset your password. It expires in
                30 minutes.
              </Text>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => router.replace("/login")}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>BACK TO LOGIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={() => {
                  setSent(false);
                  setEmail("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080E0A" },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F2415",
    borderWidth: 0.5,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: "#CCC", fontSize: 20, marginTop: -2 },
  logo: { width: 36, height: 36, resizeMode: "contain" },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F5F5F5",
    marginBottom: 10,
  },
  subtitle: { fontSize: 14, color: "#666", lineHeight: 22, marginBottom: 28 },
  emailHighlight: { color: "#F5F5F5", fontWeight: "700" },
  hint: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    marginBottom: 28,
    backgroundColor: "#0C1A10",
    borderRadius: 10,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#1A3A20",
  },

  errorBox: {
    backgroundColor: "rgba(9,192,104,0.1)",
    borderWidth: 0.5,
    borderColor: "#09C068",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: "#09C068", fontSize: 13 },

  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0C1A10",
    borderWidth: 0.5,
    borderColor: "#1A3A20",
    borderRadius: 12,
    color: "#F5F5F5",
    fontSize: 15,
    padding: 14,
    marginBottom: 20,
  },

  btn: {
    backgroundColor: "#09C068",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 1 },

  resendBtn: { alignItems: "center", padding: 10 },
  resendText: { color: "#666", fontSize: 13, textDecorationLine: "underline" },

  successIconWrap: { alignItems: "center", marginBottom: 24 },
  successEmoji: { fontSize: 64 },
});
