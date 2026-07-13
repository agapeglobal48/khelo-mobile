import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";

const { width, height } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;
const THUMB = (width - 52) / 3;

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

// ── Sport config with gradient colors ────────────────────────
const SPORTS = [
  {
    name: "Cricket",
    sport: "cricket",
    color1: "#1a3a1a",
    color2: "#0d1f0d",
    accent: "#09C068",
    label: "BAT & BALL",
  },
  {
    name: "Football",
    sport: "football",
    color1: "#1a1a3a",
    color2: "#0d0d1f",
    accent: "#4A7BF5",
    label: "THE BEAUTIFUL GAME",
  },
  {
    name: "Boxing",
    sport: "boxing",
    color1: "#3a1a1a",
    color2: "#1f0d0d",
    accent: "#EF4444",
    label: "COMBAT SPORT",
  },
  {
    name: "Athletics",
    sport: "athletics",
    color1: "#2a1a3a",
    color2: "#160d1f",
    accent: "#A855F7",
    label: "TRACK & FIELD",
  },
  {
    name: "Hockey",
    sport: "hockey",
    color1: "#1a2a3a",
    color2: "#0d161f",
    accent: "#06B6D4",
    label: "FIELD SPORT",
  },
  {
    name: "Swimming",
    sport: "swimming",
    color1: "#0d2a3a",
    color2: "#071620",
    accent: "#0EA5E9",
    label: "AQUATICS",
  },
  {
    name: "Badminton",
    sport: "badminton",
    color1: "#2a2a1a",
    color2: "#16160d",
    accent: "#EAB308",
    label: "RACKET SPORT",
  },
  {
    name: "Volleyball",
    sport: "volleyball",
    color1: "#3a2a1a",
    color2: "#1f160d",
    accent: "#F97316",
    label: "TEAM SPORT",
  },
  {
    name: "Wrestling",
    sport: "wrestling",
    color1: "#3a1a2a",
    color2: "#1f0d16",
    accent: "#EC4899",
    label: "COMBAT SPORT",
  },
  {
    name: "Weightlifting",
    sport: "weightlifting",
    color1: "#1a3a2a",
    color2: "#0d1f16",
    accent: "#10B981",
    label: "STRENGTH SPORT",
  },
  {
    name: "Tennis",
    sport: "tennis",
    color1: "#2a3a1a",
    color2: "#161f0d",
    accent: "#84CC16",
    label: "RACKET SPORT",
  },
  {
    name: "Squash",
    sport: "squash",
    color1: "#3a3a1a",
    color2: "#1f1f0d",
    accent: "#F59E0B",
    label: "RACKET SPORT",
  },
];

// ── Sport card ────────────────────────────────────────────────
function SportCard({
  item,
  onPress,
}: {
  item: (typeof SPORTS)[0];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[sc.card, { backgroundColor: item.color1 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top accent line */}
      <View style={[sc.accentLine, { backgroundColor: item.accent }]} />

      {/* Sport initial large background letter */}
      <Text style={[sc.bgLetter, { color: item.color2 }]}>
        {item.name.charAt(0)}
      </Text>

      {/* Content */}
      <View style={sc.content}>
        <View style={[sc.dot, { backgroundColor: item.accent }]} />
        <Text style={sc.sublabel}>{item.label}</Text>
        <Text style={sc.name}>{item.name.toUpperCase()}</Text>
        <View
          style={[
            sc.pill,
            {
              backgroundColor: item.accent + "22",
              borderColor: item.accent + "44",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={[sc.pillText, { color: item.accent }]}>EXPLORE</Text>
            <Ionicons name="arrow-forward" size={9} color={item.accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#2A2A2A",
    minHeight: 130,
    position: "relative",
  },
  accentLine: { height: 3, width: "100%" },
  bgLetter: {
    position: "absolute",
    bottom: -10,
    right: -8,
    fontSize: 90,
    fontWeight: "900",
    opacity: 0.4,
    letterSpacing: -5,
  },
  content: { padding: 14, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  sublabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  name: {
    color: "#F5F5F5",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  pillText: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
});

// ── Athlete card ──────────────────────────────────────────────
function AthleteCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={ac.card}
      onPress={() =>
        router.push({
          pathname: "/public-profile",
          params: { athleteId: item.id },
        })
      }
      activeOpacity={0.85}
    >
      <View style={ac.left}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={ac.avatar} />
        ) : (
          <View style={ac.avatarPlaceholder}>
            <Text style={ac.avatarText}>
              {item.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.status === "approved" && (
          <View style={ac.verifiedBadge}>
            <Ionicons name="checkmark" size={9} color={G.bg} />
          </View>
        )}
      </View>
      <View style={ac.info}>
        <Text style={ac.name}>{item.name}</Text>
        <View style={ac.tags}>
          {item.sport && (
            <View style={ac.tagGreen}>
              <Text style={ac.tagGreenText}>
                {item.sport
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </Text>
            </View>
          )}
          {item.city && (
            <View style={ac.tagDark}>
              <Text style={ac.tagDarkText}>{item.city}</Text>
            </View>
          )}
        </View>
        {item.achievements && (
          <Text style={ac.bio} numberOfLines={1}>
            {item.achievements}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={22} color={G.dim} style={{ marginRight: 4 }} />
    </TouchableOpacity>
  );
}

const ac = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  left: { position: "relative" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: G.primary,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1C1C1C",
    borderWidth: 1.5,
    borderColor: G.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: G.primary, fontSize: 20, fontWeight: "900" },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: G.bg,
  },
  verifiedCheck: { color: G.bg, fontSize: 9, fontWeight: "900" },
  info: { flex: 1, gap: 5 },
  name: { color: G.text, fontSize: 15, fontWeight: "700" },
  tags: { flexDirection: "row", gap: 6 },
  tagGreen: {
    backgroundColor: "rgba(9,192,104,0.12)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: "rgba(9,192,104,0.3)",
  },
  tagGreenText: { color: G.primary, fontSize: 10, fontWeight: "700" },
  tagDark: {
    backgroundColor: "#1C1C1C",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagDarkText: { color: G.muted, fontSize: 10 },
  bio: { color: G.dim, fontSize: 11 },
  arrow: { color: G.dim, fontSize: 22, marginRight: 4 },
});

// ── Video thumbnail ───────────────────────────────────────────
function VideoThumbCard({ item, onPress }: { item: any; onPress: () => void }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    VideoThumbnails.getThumbnailAsync(item.url, { time: 0 })
      .then(({ uri }) => {
        if (!cancelled) setThumb(uri);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.url]);

  function fmt(n: number) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  return (
    <TouchableOpacity
      style={{ width: THUMB, marginBottom: 6 }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={{
          width: THUMB,
          height: THUMB * 1.5,
          backgroundColor: G.surface,
          borderRadius: 10,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color={G.primary} size="small" />
        ) : thumb ? (
          <Image
            source={{ uri: thumb }}
            style={{ width: THUMB, height: THUMB * 1.5, resizeMode: "cover" }}
          />
        ) : (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="film-outline" size={24} color={G.dim} />
          </View>
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "rgba(0,0,0,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play" size={11} color="#fff" style={{ marginLeft: 2 }} />
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 5,
            left: 5,
            backgroundColor: "rgba(0,0,0,0.65)",
            borderRadius: 6,
            paddingHorizontal: 5,
            paddingVertical: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Ionicons name="eye" size={10} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
              {fmt(item.views ?? 0)}
            </Text>
          </View>
        </View>
      </View>
      {item.caption ? (
        <Text
          style={{
            color: G.muted,
            fontSize: 10,
            paddingHorizontal: 2,
            paddingTop: 4,
          }}
          numberOfLines={1}
        >
          {item.caption}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ── Discover feed modal ───────────────────────────────────────
function DiscoverFeedCard({ video, isActive, athlete, onCommentPress }: any) {
  const player = useVideoPlayer(video.url, (p) => {
    p.loop = true;
    p.muted = false;
    p.showNowPlayingNotification = false;
  });
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes ?? 0);
  const [views, setViews] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!athlete?.id) return;
    fetch(
      `${API_BASE_URL}/api/videos/${video.id}/like?athlete_id=${athlete.id}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") {
          setLiked(d.liked);
          setLikes(d.likes);
        }
      })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/videos/${video.id}/views`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setViews(d.views);
      })
      .catch(() => {});
  }, [video.id, athlete?.id]);

  useEffect(() => {
    if (isActive) {
      player.play();
      if (!viewTracked.current && athlete?.id) {
        viewTracked.current = true;
        fetch(`${API_BASE_URL}/api/videos/${video.id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athlete_id: athlete.id }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.status === "success") setViews(d.views);
          })
          .catch(() => {});
      }
    } else {
      player.pause();
    }
  }, [isActive, athlete?.id, player, video.id]);

  async function handleLike() {
    if (!athlete?.id || likeLoading) return;
    setLikeLoading(true);
    const was = liked;
    setLiked(!was);
    setLikes((p: number) => (was ? Math.max(0, p - 1) : p + 1));
    try {
      const res = await fetch(`${API_BASE_URL}/api/videos/${video.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athlete_id: athlete.id }),
      });
      const d = await res.json();
      if (res.ok) {
        setLiked(d.liked);
        setLikes(d.likes);
      } else {
        setLiked(was);
        setLikes((p: number) => (was ? p + 1 : Math.max(0, p - 1)));
      }
    } catch {
      setLiked(was);
      setLikes((p: number) => (was ? p + 1 : Math.max(0, p - 1)));
    } finally {
      setLikeLoading(false);
    }
  }

  function fmt(n: number) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <View
        style={{
          position: "absolute",
          right: 12,
          bottom: 100,
          alignItems: "center",
          gap: 16,
        }}
      >
        <TouchableOpacity
          style={{ alignItems: "center", gap: 4 }}
          onPress={handleLike}
          disabled={likeLoading}
        >
          <View
            style={[
              dfc.iconWrap,
              liked && {
                backgroundColor: "rgba(9,192,104,0.25)",
                borderColor: G.primary,
              },
            ]}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? G.primary : "#fff"}
            />
          </View>
          <Text style={dfc.count}>{fmt(likes)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center", gap: 4 }}
          onPress={() => onCommentPress(video.id)}
        >
          <View style={dfc.iconWrap}>
            <Image
              source={require("../../assets/icons/chat.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </View>
          <Text style={dfc.count}>{fmt(video.comments ?? 0)}</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center", gap: 4 }}>
          <View style={dfc.iconWrap}>
            <Image
              source={require("../../assets/icons/eye.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </View>
          <Text style={dfc.count}>{fmt(views)}</Text>
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 60,
          padding: 14,
          paddingBottom: 70,
        }}
      >
        {video.caption ? (
          <Text
            style={{
              color: "#fff",
              fontSize: 13,
              lineHeight: 18,
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {video.caption}
          </Text>
        ) : null}
        {video.sport ? (
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: G.primary,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
              {video.sport
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const dfc = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  count: { fontSize: 10, color: "#fff", fontWeight: "700" },
});

function DiscoverFeedModal({
  visible,
  videos,
  startIndex,
  onClose,
  athlete,
}: any) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setActiveIndex(startIndex);
      setTimeout(
        () =>
          flatRef.current?.scrollToIndex({
            index: startIndex,
            animated: false,
          }),
        50,
      );
    }
  }, [visible, startIndex]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar hidden={true} />
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 20,
            left: 16,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(0,0,0,0.7)",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View
          style={{
            position: "absolute",
            top: 24,
            left: 60,
            right: 60,
            zIndex: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "rgba(9,192,104,0.8)",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {activeIndex + 1} / {videos.length}
          </Text>
        </View>
        <FlatList
          ref={flatRef}
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <DiscoverFeedCard
              video={item}
              isActive={index === activeIndex}
              athlete={athlete}
              onCommentPress={() => {}}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          removeClippedSubviews
          maxToRenderPerBatch={3}
          windowSize={5}
          initialScrollIndex={startIndex}
        />
      </View>
    </Modal>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const { athlete } = useAuth();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"athletes" | "videos">("athletes");
  const [athleteResults, setAthleteResults] = useState<any[]>([]);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedStart, setFeedStart] = useState(0);
  const debounceRef = useRef<any>(null);

  const doSearch = useCallback(
    async (q: string, currentTab: "athletes" | "videos") => {
      if (!q.trim()) {
        setAthleteResults([]);
        setVideoResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        if (currentTab === "athletes") {
          const res = await fetch(
            `${API_BASE_URL}/api/search/athletes?q=${encodeURIComponent(q)}`,
          );
          const d = await res.json();
          if (res.ok) setAthleteResults(d.data ?? []);
        } else {
          const res = await fetch(
            `${API_BASE_URL}/api/search/videos?q=${encodeURIComponent(q)}`,
          );
          const d = await res.json();
          if (res.ok) setVideoResults(d.data ?? []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  function handleQueryChange(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text, tab), 400);
  }

  function handleTabSwitch(newTab: "athletes" | "videos", queryOverride?: string) {
    setTab(newTab);
    const q = queryOverride ?? query;
    if (q.trim()) doSearch(q, newTab);
  }

  const isSearching = query.trim().length > 0;

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.heading}>DISCOVER</Text>
          <Text style={styles.headingSub}>
            Find athletes & videos across Punjab
          </Text>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={16}
            color={G.muted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search athletes, sports, cities..."
            placeholderTextColor={G.dim}
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                setQuery("");
                setAthleteResults([]);
                setVideoResults([]);
                setSearched(false);
              }}
              style={styles.clearBtn}
            >
              <Ionicons name="close" size={14} color={G.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Toggle tabs when searching ── */}
      {isSearching && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              tab === "athletes" && styles.toggleActive,
            ]}
            onPress={() => handleTabSwitch("athletes")}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons
                name="person-outline"
                size={14}
                color={tab === "athletes" ? "#fff" : G.muted}
              />
              <Text
                style={[
                  styles.toggleText,
                  tab === "athletes" && styles.toggleTextActive,
                ]}
              >
                Athletes
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, tab === "videos" && styles.toggleActive]}
            onPress={() => handleTabSwitch("videos")}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons
                name="film-outline"
                size={14}
                color={tab === "videos" ? "#fff" : G.muted}
              />
              <Text
                style={[
                  styles.toggleText,
                  tab === "videos" && styles.toggleTextActive,
                ]}
              >
                Videos
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={G.primary} size="large" />
          <Text style={{ color: G.muted, fontSize: 14, marginTop: 12 }}>
            Searching...
          </Text>
        </View>
      ) : isSearching ? (
        tab === "athletes" ? (
          athleteResults.length === 0 && searched ? (
            <View style={styles.centered}>
              <Ionicons
                name="search-outline"
                size={48}
                color={G.dim}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyTitle}>No athletes found</Text>
              <Text style={{ color: G.muted, fontSize: 13 }}>
                Try a different name or sport
              </Text>
            </View>
          ) : (
            <FlatList
              key="athletes"
              data={athleteResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <AthleteCard item={item} />}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )
        ) : videoResults.length === 0 && searched ? (
          <View style={styles.centered}>
            <Ionicons
              name="film-outline"
              size={48}
              color={G.dim}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.emptyTitle}>No videos found</Text>
          </View>
        ) : (
          <FlatList
            key="videos"
            data={videoResults}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item, index }) => (
              <VideoThumbCard
                item={item}
                onPress={() => {
                  setFeedStart(index);
                  setFeedOpen(true);
                }}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 8,
            }}
            columnWrapperStyle={{ gap: 6, justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )
      ) : (
        /* ── Sport grid ── */
        <FlatList
          key="sports"
          data={SPORTS}
          keyExtractor={(item) => item.sport}
          numColumns={2}
          renderItem={({ item }) => (
            <SportCard
              item={item}
              onPress={() => {
                setQuery(item.name);
                handleTabSwitch("athletes", item.name);
              }}
            />
          )}
          columnWrapperStyle={{
            gap: 10,
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.browseHeader}>
              <View style={styles.browseLine} />
              <Text style={styles.browseLabel}>SELECT A SPORT</Text>
              <View style={styles.browseLine} />
            </View>
          }
        />
      )}

      <DiscoverFeedModal
        visible={feedOpen}
        videos={videoResults}
        startIndex={feedStart}
        onClose={() => setFeedOpen(false)}
        athlete={athlete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },

  header: { paddingHorizontal: 20, paddingBottom: 16 },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: G.primary,
    letterSpacing: 2,
  },
  headingSub: { fontSize: 12, color: G.muted, marginTop: 3 },

  searchWrap: { paddingHorizontal: 20, marginBottom: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  searchIconText: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: G.text, fontSize: 14, paddingVertical: 13 },
  clearBtn: { padding: 6 },

  toggleRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: G.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 0.5,
    borderColor: G.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: G.primary },
  toggleText: { color: G.muted, fontSize: 13, fontWeight: "700" },
  toggleTextActive: { color: "#fff" },

  browseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 4,
  },
  browseLine: { flex: 1, height: 0.5, backgroundColor: G.border },
  browseLabel: {
    color: G.dim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyTitle: { color: G.text, fontSize: 18, fontWeight: "800" },
});
