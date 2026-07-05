import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const G = {
  bg: "#0A0A0A",
  surface: "#141414",
  border: "#2A2A2A",
  primary: "#09C068",
  gold: "#F5C842",
  text: "#F5F5F5",
  muted: "#888888",
  dim: "#444444",
};

const SPORTS = [
  "cricket",
  "football",
  "tennis",
  "table_tennis",
  "swimming",
  "athletics",
  "hockey",
  "volleyball",
  "badminton",
  "boxing",
  "wrestling",
  "weightlifting",
  "cycling",
  "squash",
  "other",
];
const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "Federal"];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { athlete, updateAthlete } = useAuth();

  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: athlete?.name ?? "",
    phone: athlete?.phone ?? "",
    sport: athlete?.sport ?? "",
    city: athlete?.city ?? "",
    bio: athlete?.bio ?? "",
    achievements: athlete?.achievements ?? "",
  });

  function set(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed");
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!r.canceled && r.assets[0]) setPhoto(r.assets[0]);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert("Name is required.");
      return;
    }
    setLoading(true);
    try {
      let newPhotoUrl = athlete?.photo_url ?? null;

      if (photo) {
        const photoForm = new FormData();
        const filename = photo.uri.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mime: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
        };
        photoForm.append("photo", {
          uri: photo.uri,
          name: filename,
          type: mime[ext] ?? "image/jpeg",
        } as any);
        photoForm.append("athlete_id", athlete?.id ?? "");
        const photoRes = await fetch(`${API_BASE_URL}/api/upload/photo`, {
          method: "POST",
          body: photoForm,
        });
        const photoData = await photoRes.json();
        if (photoRes.ok) newPhotoUrl = photoData.photo_url;
      }

      const body = new URLSearchParams();
      body.append("id", athlete?.id ?? "");
      body.append("name", form.name.trim());
      body.append("phone", form.phone.trim());
      body.append("sport", form.sport);
      body.append("city", form.city.trim());
      body.append("bio", form.bio.trim());
      body.append("achievements", form.achievements.trim());
      if (newPhotoUrl) body.append("photo_url", newPhotoUrl);

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();

      if (res.ok) {
        updateAthlete({ ...data.data, photo_url: newPhotoUrl });
        router.replace("/(tabs)/profile");
      } else {
        Alert.alert("Error", data.message || "Could not save changes.");
      }
    } catch {
      Alert.alert("Error", "Connection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16 },
          ]}
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
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EDIT PROFILE</Text>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>SAVE</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
              {photo ? (
                <Image source={{ uri: photo.uri }} style={styles.avatarImg} />
              ) : athlete?.photo_url ? (
                <Image
                  source={{ uri: athlete.photo_url }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {athlete?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Text style={styles.photoEditIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Tap to change photo</Text>
          </View>

          {/* Fields */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PERSONAL INFO</Text>

            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => set("name", v)}
              placeholder="Your name"
              placeholderTextColor={G.dim}
              autoCapitalize="words"
            />

            <Text style={styles.label}>PHONE</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => set("phone", v)}
              placeholder="03001234567"
              placeholderTextColor={G.dim}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>BIO</Text>
            <TextInput
              style={[
                styles.input,
                { minHeight: 80, textAlignVertical: "top" },
              ]}
              value={form.bio}
              onChangeText={(v) => set("bio", v)}
              placeholder="Tell us about yourself..."
              placeholderTextColor={G.dim}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>ACHIEVEMENTS</Text>
            <TextInput
              style={[
                styles.input,
                { minHeight: 80, textAlignVertical: "top" },
              ]}
              value={form.achievements}
              onChangeText={(v) => set("achievements", v)}
              placeholder="Your sports achievements..."
              placeholderTextColor={G.dim}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.cardTitle}>SPORT</Text>
            <View style={styles.chipRow}>
              {SPORTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, form.sport === s && styles.chipActive]}
                  onPress={() => set("sport", s)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.sport === s && { color: "#fff" },
                    ]}
                  >
                    {s
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: G.muted, fontSize: 20, marginTop: -2 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: G.text,
    letterSpacing: 2,
  },
  saveBtn: {
    backgroundColor: G.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },

  photoSection: { alignItems: "center", marginBottom: 24 },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: G.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: G.surface,
    borderWidth: 3,
    borderColor: G.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: G.primary, fontSize: 40, fontWeight: "900" },
  photoEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: G.bg,
  },
  photoEditIcon: { fontSize: 14 },
  photoHint: { color: G.muted, fontSize: 12, marginTop: 8 },

  card: {
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: G.primary,
    marginBottom: 16,
  },

  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: G.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: G.bg,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 10,
    color: G.text,
    fontSize: 14,
    padding: 12,
    marginBottom: 14,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: G.bg,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: G.primary, borderColor: G.primary },
  chipText: { color: G.muted, fontSize: 12, fontWeight: "600" },
});
