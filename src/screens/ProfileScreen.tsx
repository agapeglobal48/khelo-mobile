import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");
const THUMB = (width - 52) / 3;

const G = {
  bg: "#080E0A",
  surface: "#111811",
  card: "#141414",
  border: "#1E2E22",
  primary: "#09C068",
  gold: "#F5C842",
  red: "#E53935",
  text: "#F5F5F5",
  muted: "#7A8C80",
  dim: "#3A4A3E",
};

const SPORTS_DISPLAY: Record<string, string> = {
  cricket: "Cricket",
  football: "Football",
  tennis: "Tennis",
  table_tennis: "Table Tennis",
  swimming: "Swimming",
  athletics: "Athletics",
  hockey: "Hockey",
  volleyball: "Volleyball",
  badminton: "Badminton",
  boxing: "Boxing",
  wrestling: "Wrestling",
  weightlifting: "Weightlifting",
  cycling: "Cycling",
  squash: "Squash",
  other: "Other",
};

// ── Video card for fullscreen ─────────────────────────────────
function VideoCard({
  video,
  isActive,
  viewer,
}: any): React.ReactElement | null {
  const player = useVideoPlayer(video.url, (p) => {
    p.loop = true;
    p.muted = false;
    p.showNowPlayingNotification = false;
  });
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState(video.comments ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!viewer?.id) return;
    fetch(`${API_BASE_URL}/api/videos/${video.id}/like?athlete_id=${viewer.id}`)
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
  }, [video.id, viewer?.id]);

  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive, player]);

  async function handleLike() {
    if (!viewer?.id || likeLoading) return;
    setLikeLoading(true);
    const was = liked;
    setLiked(!was);
    setLikes((p: number) => (was ? Math.max(0, p - 1) : p + 1));
    try {
      const res = await fetch(`${API_BASE_URL}/api/videos/${video.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athlete_id: viewer.id }),
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
    return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
  }

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Right action bar — matches home feed */}
      <View style={vc.actionBar}>
        {/* Avatar */}
        <View style={vc.avatarWrap}>
          {viewer?.photo_url ? (
            <Image source={{ uri: viewer.photo_url }} style={vc.avatar} />
          ) : (
            <View style={vc.avatarFallback}>
              <Text style={vc.avatarText}>
                {viewer?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
        </View>

        {/* Like */}
        <TouchableOpacity
          style={vc.actionBtn}
          onPress={handleLike}
          disabled={likeLoading}
        >
          <View style={[vc.iconWrap, liked && vc.iconWrapLiked]}>
            <Text style={[vc.icon, liked && { color: G.primary }]}>
              {liked ? "♥" : "♡"}
            </Text>
          </View>
          <Text style={vc.count}>{fmt(likes)}</Text>
        </TouchableOpacity>

        {/* Comments */}
        <View style={vc.actionBtn}>
          <View style={vc.iconWrap}>
            <Image
              source={require("../../assets/icons/chat.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </View>
          <Text style={vc.count}>{fmt(comments)}</Text>
        </View>

        {/* Views */}
        <View style={vc.actionBtn}>
          <View style={vc.iconWrap}>
            <Image
              source={require("../../assets/icons/eye.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </View>
          <Text style={vc.count}>{fmt(views)}</Text>
        </View>
      </View>

      {/* Bottom info — matches home feed */}
      <View style={vc.bottomInfo}>
        <View style={vc.userRow}>
          {viewer?.photo_url ? (
            <Image source={{ uri: viewer.photo_url }} style={vc.smallAvatar} />
          ) : (
            <View style={vc.smallAvatarFallback}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>
                {viewer?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <Text style={vc.username}>
            @{viewer?.name?.toLowerCase().replace(/\s+/g, "_") ?? "you"}
          </Text>
        </View>
        {video.caption ? (
          <Text style={vc.caption} numberOfLines={2}>
            {video.caption}
          </Text>
        ) : null}
        {video.sport ? (
          <View style={vc.sportTag}>
            <Text style={vc.sportTagText}>
              {SPORTS_DISPLAY[video.sport] || video.sport}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const vc = StyleSheet.create({
  actionBar: {
    position: "absolute",
    right: 12,
    bottom: 120,
    alignItems: "center",
    gap: 20,
  },
  actionBtn: { alignItems: "center", gap: 5 },
  avatarWrap: { marginBottom: 4 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: G.primary,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: G.primary,
    borderWidth: 2,
    borderColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapLiked: {
    backgroundColor: "rgba(9,192,104,0.25)",
    borderColor: G.primary,
  },
  icon: { fontSize: 20, color: "#fff" },
  count: { fontSize: 11, color: "#fff", fontWeight: "700" },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 70,
    padding: 16,
    paddingBottom: 80,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: G.gold,
  },
  smallAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: G.primary,
    borderWidth: 2,
    borderColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  username: { color: "#fff", fontSize: 15, fontWeight: "700" },
  caption: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  sportTag: {
    alignSelf: "flex-start",
    backgroundColor: G.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sportTagText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});

// ── Feed modal ────────────────────────────────────────────────
function VideoFeedModal({ visible, videos, startIndex, onClose, viewer }: any) {
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
        >
          <Text style={{ color: "#fff", fontSize: 20, marginTop: -2 }}>←</Text>
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
          <Text style={{ color: G.primary, fontSize: 12, fontWeight: "700" }}>
            MY VIDEOS • {activeIndex + 1} / {videos.length}
          </Text>
        </View>
        <FlatList
          ref={flatRef}
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <VideoCard
              video={item}
              isActive={index === activeIndex}
              viewer={viewer}
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

// ── Thumbnail ─────────────────────────────────────────────────
function VideoThumb({ item, onPress }: any) {
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
    return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
  }

  return (
    <TouchableOpacity
      style={styles.thumbCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.thumbBg}>
        {loading ? (
          <ActivityIndicator color={G.primary} size="small" />
        ) : thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumbImg} />
        ) : (
          <Text style={{ fontSize: 24 }}>🎬</Text>
        )}
        <View style={styles.thumbOverlay}>
          <View style={styles.thumbPlay}>
            <Text style={{ color: "#fff", fontSize: 12, marginLeft: 2 }}>
              ▶
            </Text>
          </View>
        </View>
        <View style={styles.thumbViews}>
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
            👁 {fmt(item.views ?? 0)}
          </Text>
        </View>
      </View>
      {item.caption ? (
        <Text style={styles.thumbCaption} numberOfLines={1}>
          {item.caption}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ── Stat item ─────────────────────────────────────────────────
function StatItem({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, accent && { color: G.gold }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { athlete, logout } = useAuth();

  const [stats, setStats] = useState({ followers: 0, following: 0, videos: 0 });
  const [videos, setVideos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedStart, setFeedStart] = useState(0);
  const [showLogout, setShowLogout] = useState(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!athlete?.id) return;
      if (isRefresh) setRefreshing(true);
      try {
        const [sRes, vRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/athletes/${athlete.id}/stats`),
          fetch(`${API_BASE_URL}/api/videos/mine?athlete_id=${athlete.id}`),
        ]);
        const [sData, vData] = await Promise.all([sRes.json(), vRes.json()]);
        if (sRes.ok)
          setStats({
            followers: sData.followers,
            following: sData.following,
            videos: sData.videos,
          });
        if (vRes.ok) {
          const list = vData.data ?? [];
          const withViews = await Promise.all(
            list.map(async (v: any) => {
              try {
                const vr = await fetch(
                  `${API_BASE_URL}/api/videos/${v.id}/views`,
                );
                const vd = await vr.json();
                return {
                  ...v,
                  views: vd.status === "success" ? vd.views : (v.views ?? 0),
                };
              } catch {
                return v;
              }
            }),
          );
          setVideos(withViews);
        }
      } catch {
      } finally {
        if (isRefresh) setRefreshing(false);
      }
    },
    [athlete],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  function handleLogout() {
    setShowLogout(false);
    logout();
  }

  function fmt(n: number) {
    return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
  }

  if (!athlete) return null;

  const sport = SPORTS_DISPLAY[athlete.sport ?? ""] || athlete.sport || "";

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor={G.primary}
            colors={[G.primary]}
          />
        }
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Background gradient */}
          <LinearGradient
            colors={["#062510", "#0A1A0F", "#080E0A"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Diagonal lines pattern */}
          <View style={styles.patternWrap} pointerEvents="none">
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.patternLine,
                  {
                    top: i * 28 - 60,
                    transform: [{ rotate: "-35deg" }],
                    opacity: 0.06,
                  },
                ]}
              />
            ))}
          </View>

          {/* Green glow blob */}
          <View style={[styles.glowBlob, { top: insets.top + 40 }]} />

          {/* Top actions */}
          <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
            <View />
            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={() => router.push("/edit-profile")}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 15 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signOutCircle}
                onPress={() => setShowLogout(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutText}>↩</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar with glow ring */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarOuterRing}>
              <View style={styles.avatarInnerRing}>
                {athlete.photo_url ? (
                  <Image
                    source={{ uri: athlete.photo_url }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>
                      {athlete.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {athlete.status === "approved" && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.name}>{athlete.name.toUpperCase()}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {sport ? (
              <View style={styles.tagGreen}>
                <Text style={styles.tagGreenText}>🏏 {sport}</Text>
              </View>
            ) : null}
            {athlete.city ? (
              <View style={styles.tagRed}>
                <Text style={styles.tagRedText}>📍 {athlete.city}</Text>
              </View>
            ) : null}
          </View>

          <View style={{ height: 28 }} />
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsCard}>
          <StatItem value={fmt(stats.followers)} label="Followers" />
          <View style={styles.statsDivider} />
          <StatItem value={fmt(stats.following)} label="Following" />
          <View style={styles.statsDivider} />
          <StatItem value={fmt(stats.videos)} label="Videos" />
        </View>

        {/* ── Bio ── */}
        {athlete.bio || athlete.achievements ? (
          <View style={styles.bioCard}>
            <View style={styles.bioHeader}>
              <View style={styles.bioAccent} />
              <Text style={styles.bioLabel}>ABOUT</Text>
            </View>
            <Text style={styles.bioText}>
              {athlete.bio || athlete.achievements}
            </Text>
          </View>
        ) : null}

        {/* ── Videos section ── */}
        <View style={styles.videosHeader}>
          <View style={styles.videosTitleRow}>
            <Text style={styles.videosTitle}>MY VIDEOS</Text>
            <View style={styles.videosBadge}>
              <Text style={styles.videosBadgeText}>{videos.length}</Text>
            </View>
          </View>
          {videos.length > 0 && (
            <Text style={styles.videosSubtitle}>
              {stats.followers} people follow your journey
            </Text>
          )}
        </View>

        {videos.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Text style={{ fontSize: 32 }}>🎬</Text>
            </View>
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptySubtitle}>
              Share your sports journey with Punjab scouts
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/(tabs)/create")}
              activeOpacity={0.85}
            >
              <Text style={styles.createBtnText}>+ CREATE NOW</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.videoGrid}>
            {videos.map((video, index) => (
              <VideoThumb
                key={video.id}
                item={video}
                onPress={() => {
                  setFeedStart(index);
                  setFeedOpen(true);
                }}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Sign out dialog ── */}
      <Modal
        visible={showLogout}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLogout(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setShowLogout(false)}
        >
          <View style={styles.menuSheet}>
            <View style={styles.logoutIconWrap}>
              <Text style={styles.logoutIconText}>↩</Text>
            </View>
            <Text style={styles.logoutTitle}>Sign Out</Text>
            <Text style={styles.logoutSubtitle}>
              Are you sure you want to sign out of your Khelo account?
            </Text>
            <TouchableOpacity
              style={styles.logoutConfirmBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutConfirmText}>YES, SIGN OUT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutCancelBtn}
              onPress={() => setShowLogout(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <VideoFeedModal
        visible={feedOpen}
        videos={videos}
        startIndex={feedStart}
        onClose={() => setFeedOpen(false)}
        viewer={athlete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },

  // Hero
  hero: { position: "relative", overflow: "hidden", paddingBottom: 8 },

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

  glowBlob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: G.primary,
    opacity: 0.07,
    alignSelf: "center",
    shadowColor: G.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  topActions: { flexDirection: "row", gap: 10 },
  signOutCircle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  signOutText: { color: "#EF4444", fontSize: 16, fontWeight: "700" },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: 18,
    position: "relative",
  },
  avatarOuterRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1.5,
    borderColor: "rgba(9,192,104,0.4)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: G.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  avatarInnerRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2,
    borderColor: G.primary,
    overflow: "hidden",
    backgroundColor: G.surface,
  },
  avatarImg: { width: 106, height: 106, resizeMode: "cover" },
  avatarFallback: {
    width: 106,
    height: 106,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: G.primary, fontSize: 44, fontWeight: "900" },
  verifiedBadge: {
    position: "absolute",
    bottom: 2,
    right: "35%",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: G.bg,
  },
  verifiedText: { color: G.bg, fontSize: 12, fontWeight: "900" },

  name: {
    fontSize: 26,
    fontWeight: "900",
    color: G.text,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  tagsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  tagGreen: {
    backgroundColor: G.primary,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagGreenText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  tagRed: {
    backgroundColor: G.red,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagRedText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Stats
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: G.card,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#222",
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNumber: { color: G.primary, fontSize: 26, fontWeight: "900" },
  statLabel: { color: G.muted, fontSize: 11, letterSpacing: 0.3 },
  statsDivider: { width: 0.5, backgroundColor: "#222", marginVertical: 6 },

  // Bio
  bioCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: G.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#222",
    padding: 16,
    overflow: "hidden",
  },
  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  bioAccent: {
    width: 3,
    height: 16,
    backgroundColor: G.primary,
    borderRadius: 2,
  },
  bioLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: G.primary,
  },
  bioText: { color: G.text, fontSize: 14, lineHeight: 22 },

  // Videos
  videosHeader: { paddingHorizontal: 16, marginBottom: 12 },
  videosTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  videosTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: G.muted,
    letterSpacing: 2,
  },
  videosBadge: {
    backgroundColor: G.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  videosBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  videosSubtitle: { color: G.dim, fontSize: 12 },

  videoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 6,
  },
  thumbCard: { width: THUMB },
  thumbBg: {
    width: THUMB,
    height: THUMB * 1.5,
    backgroundColor: G.card,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImg: { width: THUMB, height: THUMB * 1.5, resizeMode: "cover" },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbViews: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  thumbCaption: {
    color: G.muted,
    fontSize: 10,
    paddingHorizontal: 2,
    paddingTop: 4,
  },

  // Empty state
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: G.card,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#222",
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { color: G.text, fontSize: 18, fontWeight: "800" },
  emptySubtitle: {
    color: G.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  createBtn: {
    marginTop: 8,
    backgroundColor: G.primary,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Menu
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  menuSheet: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#2A2A2A",
  },
  logoutIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoutIconText: { fontSize: 26 },
  logoutTitle: {
    color: G.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  logoutSubtitle: {
    color: G.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  logoutConfirmBtn: {
    width: "100%",
    backgroundColor: "#EF4444",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutConfirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  logoutCancelBtn: {
    width: "100%",
    backgroundColor: G.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: G.border,
  },
  logoutCancelText: { color: G.muted, fontSize: 15, fontWeight: "600" },
});
