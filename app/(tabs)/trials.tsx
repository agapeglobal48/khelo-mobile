import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";

const G = {
  bg: "#0A0A0A",
  surface: "#141414",
  surfaceAlt: "#1C1C1C",
  border: "#2A2A2A",
  primary: "#09C068",
  gold: "#F5C842",
  text: "#F5F5F5",
  muted: "#888888",
  dim: "#444444",
};

const FILTERS = ["All", "Upcoming", "Registered", "Completed"];

interface Trial {
  id: string;
  title: string;
  subtitle: string;
  sport: string;
  sportEmoji: string;
  date: string;
  day: string;
  month: string;
  time: string;
  venue: string;
  province: string;
  spots_total: number;
  spots_left: number;
  status: string;
  featured: boolean;
  prize: string;
  registered: boolean;
}

function spotsColor(left: number, total: number) {
  const p = left / total;
  if (p <= 0) return "#555";
  if (p <= 0.2) return G.gold;
  return G.primary;
}

function spotsLabel(left: number, total: number) {
  if (left === 0) return "Full";
  if (left / total <= 0.2) return `${left} left — Almost Full!`;
  return `${left} of ${total} spots`;
}

// ── Featured card ─────────────────────────────────────────────
function FeaturedCard({ trial, onRegister, registering }: any) {
  const sc = spotsColor(trial.spots_left, trial.spots_total);
  const pct = Math.round((1 - trial.spots_left / trial.spots_total) * 100);

  return (
    <View style={feat.card}>
      <View style={feat.accentBar} />
      <View style={feat.header}>
        <View style={feat.sportBadge}>
          <Text style={feat.sportEmoji}>{trial.sportEmoji}</Text>
          <Text style={feat.sportName}>{trial.sport}</Text>
        </View>
        <View style={feat.featuredBadge}>
          <Text style={feat.featuredText}>⭐ FEATURED</Text>
        </View>
      </View>
      <Text style={feat.title}>{trial.title}</Text>
      <Text style={feat.subtitle}>{trial.subtitle}</Text>
      <View style={feat.infoGrid}>
        {[
          ["📅", "DATE", trial.date],
          ["🕐", "TIME", trial.time],
          ["🏆", "PRIZE", trial.prize],
        ].map(([icon, label, val]) => (
          <View key={label as string} style={feat.infoBox}>
            <Text style={feat.infoIcon}>{icon}</Text>
            <Text style={feat.infoLabel}>{label}</Text>
            <Text style={feat.infoValue}>{val}</Text>
          </View>
        ))}
      </View>
      <View style={feat.venueRow}>
        <Text style={feat.venueIcon}>📍</Text>
        <Text style={feat.venueText}>{trial.venue}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: sc }}>
          {spotsLabel(trial.spots_left, trial.spots_total)}
        </Text>
        <Text style={{ color: G.dim, fontSize: 11 }}>{pct}% filled</Text>
      </View>
      <View
        style={{
          height: 4,
          backgroundColor: G.surfaceAlt,
          borderRadius: 2,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%` as any,
            height: 4,
            backgroundColor: sc,
            borderRadius: 2,
          }}
        />
      </View>
      <TouchableOpacity
        style={[feat.registerBtn, trial.registered && feat.registeredBtn]}
        onPress={() => onRegister(trial.id)}
        disabled={registering || trial.spots_left === 0}
        activeOpacity={0.85}
      >
        {registering ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text
            style={[
              feat.registerText,
              trial.registered && { color: G.primary },
            ]}
          >
            {trial.registered ? "✓ Registered" : "Register Now →"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const feat = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 20,
    overflow: "hidden",
    padding: 18,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: G.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 6,
  },
  sportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(9,192,104,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sportEmoji: { fontSize: 14 },
  sportName: { color: G.primary, fontSize: 12, fontWeight: "700" },
  featuredBadge: {
    backgroundColor: "rgba(245,200,66,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featuredText: {
    color: G.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    color: G.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: { color: G.muted, fontSize: 12, marginBottom: 16 },
  infoGrid: {
    flexDirection: "row",
    backgroundColor: G.bg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  infoBox: { flex: 1, alignItems: "center", gap: 4 },
  infoIcon: { fontSize: 16 },
  infoLabel: { color: G.dim, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  infoValue: {
    color: G.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  venueIcon: { fontSize: 13 },
  venueText: { color: G.muted, fontSize: 12, flex: 1 },
  registerBtn: {
    backgroundColor: G.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  registeredBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: G.primary,
  },
  registerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

// ── Regular trial card ────────────────────────────────────────
function TrialCard({ trial, onRegister, registering }: any) {
  const sc = spotsColor(trial.spots_left, trial.spots_total);
  const isFull = trial.spots_left === 0;
  const isDone = trial.status === "Completed";

  return (
    <View style={card.container}>
      <View style={card.dateCol}>
        <Text style={card.day}>{trial.day}</Text>
        <Text style={card.month}>{trial.month}</Text>
        <View style={[card.dot, { backgroundColor: isDone ? G.dim : sc }]} />
        <View style={card.line} />
      </View>
      <View style={card.content}>
        <View style={card.badgeRow}>
          <View style={card.sportPill}>
            <Text style={card.sportPillText}>
              {trial.sportEmoji} {trial.sport}
            </Text>
          </View>
          {trial.registered && (
            <View style={card.regPill}>
              <Text style={card.regPillText}>✓ Registered</Text>
            </View>
          )}
          {isDone && (
            <View style={card.donePill}>
              <Text style={card.donePillText}>Completed</Text>
            </View>
          )}
          {!isDone &&
            trial.spots_left / trial.spots_total <= 0.2 &&
            trial.spots_left > 0 && (
              <View style={card.hotPill}>
                <Text style={card.hotPillText}>🔥 Hot</Text>
              </View>
            )}
        </View>
        <Text style={card.title}>{trial.title}</Text>
        {[
          ["🕐", `${trial.time}  ·  ${trial.province}`],
          ["📍", trial.venue],
          ["🏆", trial.prize],
        ].map(([icon, val]) => (
          <View key={val as string} style={card.infoRow}>
            <Text style={card.infoIcon}>{icon}</Text>
            <Text style={card.infoText} numberOfLines={1}>
              {val}
            </Text>
          </View>
        ))}
        {!isDone && (
          <View style={card.footer}>
            <Text style={[card.spotsText, { color: sc }]}>
              {spotsLabel(trial.spots_left, trial.spots_total)}
            </Text>
            {!isFull && (
              <TouchableOpacity
                style={[
                  card.registerBtn,
                  trial.registered && card.unregisterBtn,
                ]}
                onPress={() => onRegister(trial.id)}
                disabled={registering}
                activeOpacity={0.8}
              >
                {registering ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={card.registerText}>
                    {trial.registered ? "Unregister" : "Register →"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  container: { flexDirection: "row", marginHorizontal: 20, marginBottom: 4 },
  dateCol: { width: 44, alignItems: "center", paddingTop: 4 },
  day: { color: G.text, fontSize: 18, fontWeight: "900", lineHeight: 20 },
  month: {
    color: G.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 4,
  },
  line: { flex: 1, width: 1, backgroundColor: G.border, marginBottom: -4 },
  content: {
    flex: 1,
    marginLeft: 14,
    marginBottom: 20,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 16,
    padding: 14,
  },
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 8 },
  sportPill: {
    backgroundColor: "rgba(9,192,104,0.1)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sportPillText: { color: G.primary, fontSize: 10, fontWeight: "700" },
  regPill: {
    backgroundColor: "rgba(9,192,104,0.1)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: G.primary,
  },
  regPillText: { color: G.primary, fontSize: 10, fontWeight: "700" },
  donePill: {
    backgroundColor: G.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  donePillText: { color: G.dim, fontSize: 10, fontWeight: "700" },
  hotPill: {
    backgroundColor: "rgba(245,200,66,0.1)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hotPillText: { color: G.gold, fontSize: 10, fontWeight: "700" },
  title: {
    color: G.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoIcon: { fontSize: 11, width: 16 },
  infoText: { color: G.muted, fontSize: 11, flex: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: G.border,
  },
  spotsText: { fontSize: 11, fontWeight: "700" },
  registerBtn: {
    backgroundColor: G.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: "center",
  },
  unregisterBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: G.border,
  },
  registerText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});

// ── Stats bar ─────────────────────────────────────────────────
function StatsBar({ trials }: { trials: Trial[] }) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: G.surface,
        borderWidth: 0.5,
        borderColor: G.border,
        borderRadius: 14,
        paddingVertical: 14,
      }}
    >
      {[
        { n: trials.length, l: "Total" },
        { n: trials.filter((t) => t.status === "Open").length, l: "Open" },
        { n: trials.filter((t) => t.registered).length, l: "Registered" },
      ].map((s, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: G.primary, fontSize: 22, fontWeight: "900" }}>
            {s.n}
          </Text>
          <Text style={{ color: G.muted, fontSize: 10, marginTop: 2 }}>
            {s.l}
          </Text>
          {i < 2 && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: "15%",
                bottom: "15%",
                width: 0.5,
                backgroundColor: G.border,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function TrialsScreen() {
  const insets = useSafeAreaInsets();
  const { athlete } = useAuth();

  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTrials = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        const url = athlete?.id
          ? `${API_BASE_URL}/api/trials?athlete_id=${athlete.id}`
          : `${API_BASE_URL}/api/trials`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) setTrials(data.data ?? []);
        else setError("Could not load trials.");
      } catch {
        setError("Cannot reach server.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [athlete?.id],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTrials();
    }, [fetchTrials]),
  );

  async function handleRegister(trialId: string) {
    if (!athlete?.id) return;
    setRegisteringId(trialId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/trials/${trialId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athlete_id: athlete.id }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setTrials((prev) =>
          prev.map((t) => {
            if (t.id !== trialId) return t;
            return {
              ...t,
              registered: data.registered,
              spots_left: data.registered ? t.spots_left - 1 : t.spots_left + 1,
            };
          }),
        );
      }
    } catch {
    } finally {
      setRegisteringId(null);
    }
  }

  const filtered = trials.filter((t) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Upcoming")
      return t.status === "Open" && !t.registered;
    if (activeFilter === "Registered") return t.registered;
    if (activeFilter === "Completed") return t.status === "Completed";
    return true;
  });

  const featured = filtered.filter((t) => t.featured);
  const regular = filtered.filter((t) => !t.featured);

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <StatusBar hidden={true} />
        <ActivityIndicator color={G.primary} size="large" />
        <Text style={{ color: G.muted, fontSize: 13, marginTop: 12 }}>
          Loading trials...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />
      <FlatList
        data={regular}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTrials(true)}
            tintColor={G.primary}
            colors={[G.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
              <View>
                <Text style={styles.heading}>TRIALS &</Text>
                <Text style={styles.headingAccent}>EVENTS</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.headerSub}>Khelo Punjab</Text>
                <Text style={styles.headerEmoji}>🏅</Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
                <TouchableOpacity
                  onPress={() => fetchTrials()}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <StatsBar trials={trials} />
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              style={{ marginBottom: 20 }}
            >
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterPill,
                    activeFilter === f && styles.filterPillActive,
                  ]}
                  onPress={() => setActiveFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === f && styles.filterTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {featured.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>⭐ FEATURED EVENT</Text>
                {featured.map((t) => (
                  <FeaturedCard
                    key={t.id}
                    trial={t}
                    onRegister={handleRegister}
                    registering={registeringId === t.id}
                  />
                ))}
              </>
            )}
            {regular.length > 0 && (
              <Text style={styles.sectionLabel}>📅 UPCOMING EVENTS</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TrialCard
            trial={item}
            onRegister={handleRegister}
            registering={registeringId === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🏟</Text>
            <Text style={styles.emptyTitle}>No trials found</Text>
            <Text style={styles.emptyText}>
              {activeFilter === "Registered"
                ? "You haven't registered for any trials yet."
                : "Check back soon for new events."}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 30 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: G.text,
    letterSpacing: 1,
    lineHeight: 32,
  },
  headingAccent: {
    fontSize: 30,
    fontWeight: "900",
    color: G.primary,
    letterSpacing: 1,
    lineHeight: 32,
  },
  headerRight: { alignItems: "flex-end", gap: 4 },
  headerSub: { color: G.muted, fontSize: 10, letterSpacing: 0.5 },
  headerEmoji: { fontSize: 28 },
  filterPill: {
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPillActive: { backgroundColor: G.primary, borderColor: G.primary },
  filterText: { color: G.muted, fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: G.muted,
    letterSpacing: 2,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 0.5,
    borderColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  errorText: { color: "#EF4444", fontSize: 13 },
  retryBtn: {
    backgroundColor: G.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { color: G.text, fontSize: 18, fontWeight: "800" },
  emptyText: {
    color: G.muted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
