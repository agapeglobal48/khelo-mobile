import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ReactNode, useState } from "react";
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

const { width } = Dimensions.get("window");

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

const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "Federal"];
const CITIES_BY_PROVINCE: Record<string, string[]> = {
  Punjab: [
    "Lahore",
    "Faisalabad",
    "Rawalpindi",
    "Gujranwala",
    "Multan",
    "Sialkot",
    "Sargodha",
    "Bahawalpur",
    "Sheikhupura",
    "Wah Cantt",
    "Kasur",
    "Okara",
    "Sahiwal",
    "Gujrat",
    "Jhang",
    "Rahim Yar Khan",
    "Hafizabad",
    "Chiniot",
    "Khanewal",
    "Mandi Bahauddin",
  ],
  Sindh: [
    "Karachi",
    "Hyderabad",
    "Sukkur",
    "Larkana",
    "Nawabshah",
    "Mirpur Khas",
    "Jacobabad",
    "Shikarpur",
    "Khairpur",
    "Dadu",
    "Thatta",
    "Badin",
    "Sanghar",
    "Umerkot",
    "Tando Adam",
  ],
  KPK: [
    "Peshawar",
    "Abbottabad",
    "Mardan",
    "Mingora",
    "Kohat",
    "Bannu",
    "Dera Ismail Khan",
    "Swabi",
    "Nowshera",
    "Haripur",
    "Charsadda",
    "Mansehra",
    "Chitral",
    "Karak",
    "Hangu",
  ],
  Balochistan: [
    "Quetta",
    "Turbat",
    "Khuzdar",
    "Hub",
    "Chaman",
    "Gwadar",
    "Dera Murad Jamali",
    "Sibi",
    "Zhob",
    "Loralai",
    "Nushki",
    "Kharan",
    "Panjgur",
    "Mastung",
    "Kalat",
  ],
  Federal: ["Islamabad"],
};
const SPORTS = [
  { key: "cricket", label: "Cricket" },
  { key: "football", label: "Football" },
  { key: "hockey", label: "Hockey" },
  { key: "boxing", label: "Boxing" },
  { key: "athletics", label: "Athletics" },
  { key: "swimming", label: "Swimming" },
  { key: "badminton", label: "Badminton" },
  { key: "volleyball", label: "Volleyball" },
  { key: "tennis", label: "Tennis" },
  { key: "table_tennis", label: "Table Tennis" },
  { key: "wrestling", label: "Wrestling" },
  { key: "weightlifting", label: "Weightlifting" },
  { key: "cycling", label: "Cycling" },
  { key: "squash", label: "Squash" },
  { key: "other", label: "Other" },
];

const STEPS = [
  { number: "01", label: "Personal Info" },
  { number: "02", label: "Location & Sport" },
  { number: "03", label: "Security" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    sport: "",
    province: "",
    city: "",
    achievements: "",
    password: "",
    confirmPassword: "",
  });

  function set(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  }

  function formatCnic(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return digits.slice(0, 5) + "-" + digits.slice(5);
    return (
      digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12)
    );
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!r.canceled && r.assets[0]) setPhoto(r.assets[0]);
  }

  function validateStep() {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim() || form.name.length < 2)
        e.name = "Full name required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
        e.email = "Valid email required";
      if (!/^\d{11}$/.test(form.phone.trim()))
        e.phone = "Enter an 11-digit phone number";
      if (!form.cnic.trim() || !/^\d{5}-\d{7}-\d$/.test(form.cnic))
        e.cnic = "Format: 12345-1234567-1";
    }
    if (step === 1) {
      if (!form.sport) e.sport = "Select a sport";
      if (!form.province) e.province = "Select province";
      if (!form.city) e.city = "Select city";
    }
    if (step === 2) {
      if (!form.password || form.password.length < 6)
        e.password = "Min 6 characters";
      if (form.password !== form.confirmPassword)
        e.confirmPassword = "Passwords don't match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep()) setStep((s) => s + 1);
  }
  function back() {
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (photo) {
        const filename = photo.uri.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mime: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
        };
        body.append("photo", {
          uri: photo.uri,
          name: filename,
          type: mime[ext] ?? "image/jpeg",
        } as any);
      }
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setErrors({ submit: data.message || "Registration failed." });
    } catch {
      setErrors({ submit: "Cannot reach server." });
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ────────────────────────────────────────
  if (success) {
    return (
      <View
        style={[
          styles.root,
          { alignItems: "center", justifyContent: "center", padding: 28 },
        ]}
      >
        <StatusBar hidden={true} />
        <LinearGradient
          colors={["#062510", "#0A1A0F", "#080E0A"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={48} color={G.primary} />
          </View>
          <Text style={styles.successTitle}>You're In!</Text>
          <Text style={styles.successMsg}>
            Welcome to Khelo Punjab — Pakistan's premier sports talent platform.
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => router.replace("/login")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#0FD97A", "#09C068", "#07A055"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.successBtnGrad,
                { flexDirection: "row", justifyContent: "center", gap: 8 },
              ]}
            >
              <Text style={styles.successBtnText}>GO TO LOGIN</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSuccess(false);
              setStep(0);
            }}
            style={{ marginTop: 14 }}
          >
            <Text style={{ color: G.muted, fontSize: 13 }}>
              Register another athlete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />

      {/* Background */}
      <LinearGradient
        colors={["#062510", "#0A1A0F", "#080E0A", "#080E0A"]}
        locations={[0, 0.3, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Diagonal pattern */}
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

      {/* Glow */}
      <View style={styles.glowTop} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => (step === 0 ? router.back() : back())}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={G.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.appName}>KHELO</Text>
              <Text style={styles.headerSub}>
                Join Pakistan's Sports Platform
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* ── Step indicator ── */}
          <View style={styles.stepsRow}>
            {STEPS.map((s, i) => (
              <View key={i} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    i < step && styles.stepDone,
                    i === step && styles.stepActive,
                  ]}
                >
                  {i < step ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={G.primary}
                    />
                  ) : (
                    <Text
                      style={[styles.stepNum, i === step && { color: "#fff" }]}
                    >
                      {s.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[styles.stepLabel, i === step && { color: G.primary }]}
                >
                  {s.label}
                </Text>
                {i < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      i < step && { backgroundColor: G.primary },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            <View style={styles.cardAccent} />

            {/* Photo upload — step 0 only */}
            {step === 0 && (
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={pickPhoto}
                activeOpacity={0.8}
              >
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.photoImg} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <View style={styles.photoCameraIcon}>
                      <Ionicons name="camera" size={22} color={G.primary} />
                    </View>
                    <Text style={styles.photoLabel}>Add Photo</Text>
                    <Text style={styles.photoSub}>Optional</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Submit error */}
            {errors.submit ? (
              <View
                style={[
                  styles.errorBox,
                  { flexDirection: "row", alignItems: "flex-start", gap: 8 },
                ]}
              >
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{errors.submit}</Text>
              </View>
            ) : null}

            <View style={styles.cardBody}>
              {/* ── Step 0: Personal Info ── */}
              {step === 0 && (
                <>
                  <Field label="FULL NAME" error={errors.name}>
                    <InputRow
                      icon={
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color={G.muted}
                          style={{ marginRight: 10, opacity: 0.6 }}
                        />
                      }
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Muhammad Ali"
                        placeholderTextColor={G.dim}
                        value={form.name}
                        onChangeText={(v) => set("name", v)}
                        autoCapitalize="words"
                      />
                    </InputRow>
                  </Field>
                  <Field label="EMAIL ADDRESS" error={errors.email}>
                    <InputRow
                      icon={
                        <Ionicons
                          name="mail-outline"
                          size={16}
                          color={G.muted}
                          style={{ marginRight: 10, opacity: 0.6 }}
                        />
                      }
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="you@email.com"
                        placeholderTextColor={G.dim}
                        value={form.email}
                        onChangeText={(v) => set("email", v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </InputRow>
                  </Field>
                  <Field label="PHONE NUMBER" error={errors.phone}>
                    <InputRow
                      icon={
                        <Ionicons
                          name="call-outline"
                          size={16}
                          color={G.muted}
                          style={{ marginRight: 10, opacity: 0.6 }}
                        />
                      }
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="03001234567"
                        placeholderTextColor={G.dim}
                        value={form.phone}
                        onChangeText={(v) => set("phone", v)}
                        keyboardType="phone-pad"
                      />
                    </InputRow>
                  </Field>
                  <Field label="CNIC NUMBER" error={errors.cnic}>
                    <InputRow
                      icon={
                        <Ionicons
                          name="card-outline"
                          size={16}
                          color={G.muted}
                          style={{ marginRight: 10, opacity: 0.6 }}
                        />
                      }
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="12345-1234567-1"
                        placeholderTextColor={G.dim}
                        value={form.cnic}
                        onChangeText={(v) => set("cnic", formatCnic(v))}
                        keyboardType="numeric"
                        maxLength={15}
                      />
                    </InputRow>
                  </Field>
                  <Field label="ACHIEVEMENTS (Optional)" error="">
                    <View
                      style={[styles.inputRow, { alignItems: "flex-start" }]}
                    >
                      <Ionicons
                        name="ribbon"
                        size={16}
                        color={G.muted}
                        style={{ marginRight: 10, opacity: 0.6, marginTop: 14 }}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            minHeight: 80,
                            textAlignVertical: "top",
                            paddingTop: 14,
                          },
                        ]}
                        placeholder="List your sports achievements..."
                        placeholderTextColor={G.dim}
                        value={form.achievements}
                        onChangeText={(v) => set("achievements", v)}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </Field>
                </>
              )}

              {/* ── Step 1: Location & Sport ── */}
              {step === 1 && (
                <>
                  {/* Sport — 3 col compact grid */}
                  <Field label="YOUR SPORT" error={errors.sport}>
                    <View style={styles.sportGrid}>
                      {SPORTS.map((s) => {
                        const active = form.sport === s.key;
                        return (
                          <TouchableOpacity
                            key={s.key}
                            style={[
                              styles.sportChip,
                              active && styles.sportChipActive,
                            ]}
                            onPress={() => set("sport", s.key)}
                            activeOpacity={0.8}
                          >
                            {active && <View style={styles.sportChipDot} />}
                            <Text
                              style={[
                                styles.sportChipText,
                                active && styles.sportChipTextActive,
                              ]}
                            >
                              {s.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </Field>

                  {/* Province — horizontal scroll */}
                  <Field label="PROVINCE" error={errors.province}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                    >
                      {PROVINCES.map((p) => {
                        const active = form.province === p;
                        return (
                          <TouchableOpacity
                            key={p}
                            style={[
                              styles.provinceChip,
                              active && styles.provinceChipActive,
                            ]}
                            onPress={() => {
                              set("province", p);
                              set("city", "");
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.provinceChipText,
                                active && styles.provinceChipTextActive,
                              ]}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </Field>

                  {/* City — horizontal scroll */}
                  {form.province ? (
                    <Field label="CITY" error={errors.city}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                      >
                        {(CITIES_BY_PROVINCE[form.province] || []).map((ci) => {
                          const active = form.city === ci;
                          return (
                            <TouchableOpacity
                              key={ci}
                              style={[
                                styles.cityChip,
                                active && styles.cityChipActive,
                              ]}
                              onPress={() => set("city", ci)}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.cityChipText,
                                  active && styles.cityChipTextActive,
                                ]}
                              >
                                {ci}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                      {form.city ? (
                        <View style={styles.citySelectedBar}>
                          <Text style={styles.citySelectedLabel}>
                            Selected city:
                          </Text>
                          <Text style={styles.citySelectedValue}>
                            {form.city}
                          </Text>
                        </View>
                      ) : null}
                    </Field>
                  ) : null}
                </>
              )}

              {/* ── Step 2: Security ── */}
              {step === 2 && (
                <>
                  <View style={styles.securityNote}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={G.primary}
                    />
                    <Text style={styles.securityText}>
                      Your password is encrypted with bcrypt and never stored in
                      plain text.
                    </Text>
                  </View>
                  <Field label="PASSWORD" error={errors.password}>
                    <InputRow
                      icon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={16}
                          color={G.muted}
                          style={{ marginRight: 10, opacity: 0.6 }}
                        />
                      }
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Min 6 characters"
                        placeholderTextColor={G.dim}
                        value={form.password}
                        onChangeText={(v) => set("password", v)}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </InputRow>
                  </Field>
                  <Field
                    label="CONFIRM PASSWORD"
                    error={errors.confirmPassword}
                  >
                    <InputRow
                      icon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={16}
                          color={G.muted}
                          style={{ marginRight: 10, opacity: 0.6 }}
                        />
                      }
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Re-enter password"
                        placeholderTextColor={G.dim}
                        value={form.confirmPassword}
                        onChangeText={(v) => set("confirmPassword", v)}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </InputRow>
                  </Field>
                </>
              )}

              {/* ── Action button ── */}
              <TouchableOpacity
                style={[styles.nextBtn, loading && { opacity: 0.7 }]}
                onPress={step < 2 ? next : handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#0FD97A", "#09C068", "#07A055"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextBtnGrad}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.nextBtnText}>
                        {step < 2 ? `CONTINUE` : "CREATE ACCOUNT"}
                      </Text>
                      {step < 2 ? (
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                      ) : (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Helper components ─────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string;
  children: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function InputRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: any;
}) {
  return (
    <View style={styles.inputRow}>
      {icon}
      {children}
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
    top: -60,
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: G.primary,
    opacity: 0.07,
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(9,192,104,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(9,192,104,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: G.primary, fontSize: 20, marginTop: -2 },
  appName: {
    fontSize: 22,
    fontWeight: "900",
    color: G.primary,
    letterSpacing: 5,
  },
  headerSub: { fontSize: 10, color: G.muted, letterSpacing: 1, marginTop: 2 },

  // Steps
  stepsRow: { flexDirection: "row", marginBottom: 24, paddingHorizontal: 8 },
  stepItem: { flex: 1, alignItems: "center", position: "relative" },
  stepConnector: {
    position: "absolute",
    top: 18,
    left: "60%",
    right: "-60%",
    height: 1.5,
    backgroundColor: "#2A2A2A",
    zIndex: 0,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    marginBottom: 6,
  },
  stepActive: {
    backgroundColor: G.primary,
    borderColor: G.primary,
    shadowColor: G.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  stepDone: { backgroundColor: "rgba(9,192,104,0.15)", borderColor: G.primary },
  stepCheck: { color: G.primary, fontSize: 14, fontWeight: "900" },
  stepNum: { color: G.dim, fontSize: 12, fontWeight: "800" },
  stepLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: G.dim,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: "rgba(20,20,20,0.95)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#252525",
    marginBottom: 20,
  },
  cardAccent: { height: 3, backgroundColor: G.primary },
  cardBody: { padding: 20 },

  // Photo
  photoBtn: { alignSelf: "center", marginVertical: 20 },
  photoImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: G.primary,
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0D0D0D",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  photoCameraIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(9,192,104,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: { color: G.muted, fontSize: 10, fontWeight: "700" },
  photoSub: { color: G.dim, fontSize: 9 },

  // Error
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  errorText: { color: "#EF4444", fontSize: 13 },

  // Fields
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: G.muted,
    marginBottom: 8,
  },
  fieldError: { color: "#EF4444", fontSize: 11, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
    borderWidth: 0.5,
    borderColor: "#282828",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 14, marginRight: 10, opacity: 0.6 },
  input: { flex: 1, color: G.text, fontSize: 15, paddingVertical: 13 },

  // Chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#0D0D0D",
    borderWidth: 0.5,
    borderColor: "#282828",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: "rgba(9,192,104,0.15)",
    borderColor: G.primary,
  },
  chipText: { color: G.muted, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: G.primary, fontWeight: "700" },

  // Security note
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(9,192,104,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(9,192,104,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  securityIcon: { fontSize: 20 },
  securityText: { flex: 1, color: G.muted, fontSize: 12, lineHeight: 18 },

  // Next button
  nextBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  nextBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
  nextBtnArrow: { color: "#fff", fontSize: 18 },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: G.dim, fontSize: 13 },
  footerLink: { color: G.primary, fontSize: 13, fontWeight: "700" },

  // Sport — 3 col compact grid
  sportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportChip: {
    width: (width - 40 - 40 - 16) / 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0D0D0D",
    borderWidth: 0.5,
    borderColor: "#282828",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  sportChipActive: {
    backgroundColor: "rgba(9,192,104,0.1)",
    borderColor: G.primary,
  },
  sportChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: G.primary,
  },
  sportChipText: { color: G.muted, fontSize: 11, fontWeight: "600", flex: 1 },
  sportChipTextActive: { color: G.text, fontWeight: "700" },

  // Province — horizontal scroll
  provinceChip: {
    backgroundColor: "#0D0D0D",
    borderWidth: 0.5,
    borderColor: "#282828",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  provinceChipActive: {
    backgroundColor: "rgba(9,192,104,0.1)",
    borderColor: G.primary,
  },
  provinceChipText: { color: G.muted, fontSize: 13, fontWeight: "600" },
  provinceChipTextActive: { color: G.text, fontWeight: "700" },

  // City — horizontal scroll
  cityChip: {
    backgroundColor: "#0D0D0D",
    borderWidth: 0.5,
    borderColor: "#282828",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cityChipActive: {
    backgroundColor: "rgba(9,192,104,0.1)",
    borderColor: G.primary,
  },
  cityChipText: { color: G.muted, fontSize: 12, fontWeight: "500" },
  cityChipTextActive: { color: G.text, fontWeight: "700" },
  citySelectedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  citySelectedLabel: { color: G.dim, fontSize: 11 },
  citySelectedValue: { color: G.primary, fontSize: 12, fontWeight: "700" },

  // Success
  successCard: {
    backgroundColor: "rgba(20,20,20,0.95)",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#252525",
    width: "100%",
    alignItems: "center",
  },
  successIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(9,192,104,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(9,192,104,0.3)",
    alignItems: "center",
    justifyContent: "center",
    margin: 28,
    marginBottom: 0,
  },
  successEmoji: { fontSize: 42 },
  successTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: G.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successMsg: {
    color: G.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  successBtn: { width: "100%", borderRadius: 0, overflow: "hidden" },
  successBtnGrad: { paddingVertical: 16, alignItems: "center" },
  successBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
