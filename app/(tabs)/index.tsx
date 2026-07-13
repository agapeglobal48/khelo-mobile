import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../src/config/api";
import { useAuth } from "../../src/context/AuthContext";

const { width, height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 52;

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

interface Comment {
  id: string;
  athlete_id: string;
  name: string;
  text: string;
  created_at: string;
}
interface VideoItem {
  id: string;
  url: string;
  caption: string;
  sport: string;
  city: string;
  province: string;
  likes: number;
  comments: number;
  views: number;
  uploaded_at: string;
  athletes: { id: string; name: string; photo_url?: string; status: string };
}

const CATEGORIES = [
  "For You",
  "Trending",
  "Cricket",
  "Football",
  "Tennis",
  "Table Tennis",
  "Swimming",
  "Athletics",
  "Hockey",
  "Volleyball",
  "Badminton",
  "Boxing",
  "Wrestling",
  "Weightlifting",
  "Cycling",
  "Squash",
];

// ── Comments Modal ────────────────────────────────────────────
function CommentsModal({ visible, videoId, onClose, athlete }: any) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (visible && videoId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/videos/${videoId}/comments`)
        .then((r) => r.json())
        .then((d) => {
          if (d.status === "success") {
            setComments(d.comments);
            setTotal(d.total);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [visible, videoId]);

  async function postComment() {
    if (!text.trim() || !athlete?.id) return;
    setPosting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/videos/${videoId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athlete_id: athlete.id,
            name: athlete.name,
            text: text.trim(),
          }),
        },
      );
      const d = await res.json();
      if (res.ok) {
        setComments((p) => [d.comment, ...p]);
        setTotal((p) => p + 1);
        setText("");
      }
    } catch {
    } finally {
      setPosting(false);
    }
  }

  function timeAgo(iso: string) {
    const d = Date.now() - new Date(iso).getTime();
    const m = Math.floor(d / 60000),
      h = Math.floor(m / 60),
      dy = Math.floor(h / 24);
    if (dy > 0) return `${dy}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "just now";
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={cmt.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={cmt.sheet}
      >
        <View style={cmt.header}>
          <Text style={cmt.headerTitle}>{total} Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={18} color={G.muted} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={cmt.center}>
            <ActivityIndicator color={G.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={cmt.center}>
            <Text style={cmt.empty}>No comments yet</Text>
          </View>
        ) : (
          <ScrollView
            style={{ maxHeight: height * 0.45 }}
            showsVerticalScrollIndicator={false}
          >
            {comments.map((c) => (
              <View key={c.id} style={cmt.row}>
                <View style={cmt.avatar}>
                  <Text style={cmt.avatarText}>
                    {c.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={cmt.top}>
                    <Text style={cmt.name}>{c.name}</Text>
                    <Text style={cmt.time}>{timeAgo(c.created_at)}</Text>
                  </View>
                  <Text style={cmt.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
        <View style={cmt.inputRow}>
          <View style={cmt.inputAvatar}>
            <Text style={cmt.avatarText}>
              {athlete?.name?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
          <TextInput
            style={cmt.input}
            placeholder="Add a comment..."
            placeholderTextColor={G.dim}
            value={text}
            onChangeText={setText}
            maxLength={300}
            multiline
          />
          <TouchableOpacity
            style={[cmt.sendBtn, (!text.trim() || posting) && { opacity: 0.4 }]}
            onPress={postComment}
            disabled={!text.trim() || posting}
            activeOpacity={0.8}
          >
            {posting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={14} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cmt = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    borderTopWidth: 0.5,
    borderColor: "#2A2A2A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2A2A2A",
  },
  headerTitle: { color: G.text, fontSize: 15, fontWeight: "700" },
  closeBtn: { color: G.muted, fontSize: 18 },
  center: { height: 120, alignItems: "center", justifyContent: "center" },
  empty: { color: G.dim, fontSize: 13 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1C1C1C",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: G.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  top: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  name: { color: G.text, fontSize: 13, fontWeight: "700" },
  time: { color: G.dim, fontSize: 11 },
  commentText: { color: "#CCC", fontSize: 13, lineHeight: 18 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#2A2A2A",
  },
  inputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: G.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderWidth: 0.5,
    borderColor: "#2A2A2A",
    borderRadius: 20,
    color: G.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: G.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: { color: "#fff", fontSize: 14 },
});

// ── Video Card ────────────────────────────────────────────────
function VideoCard({
  item,
  isActive,
  athlete,
  onCommentPress,
  isFollowing,
  onFollowToggle,
  screenFocused,
  pageHeight,
}: any) {
  const player = useVideoPlayer(item.url, (p) => {
    p.loop = true;
    p.muted = false;
    p.showNowPlayingNotification = false;
  });
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState(item.comments ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const viewTracked = useRef(false);
  const isOwnVideo = athlete?.id === item.athletes?.id;

  useEffect(() => {
    if (!athlete?.id) return;
    fetch(`${API_BASE_URL}/api/videos/${item.id}/like?athlete_id=${athlete.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") {
          setLiked(d.liked);
          setLikes(d.likes);
        }
      })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/videos/${item.id}/views`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setViews(d.views);
      })
      .catch(() => {});
  }, [item.id, athlete?.id]);

  useEffect(() => {
    if (isActive && screenFocused) {
      player.play();
      if (!viewTracked.current && athlete?.id) {
        viewTracked.current = true;
        fetch(`${API_BASE_URL}/api/videos/${item.id}/view`, {
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
  }, [isActive, screenFocused]);

  async function handleLike() {
    if (!athlete?.id || likeLoading) return;
    setLikeLoading(true);
    const was = liked;
    setLiked(!was);
    setLikes((p) => (was ? Math.max(0, p - 1) : p + 1));
    try {
      const res = await fetch(`${API_BASE_URL}/api/videos/${item.id}/like`, {
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
        setLikes((p) => (was ? p + 1 : Math.max(0, p - 1)));
      }
    } catch {
      setLiked(was);
      setLikes((p) => (was ? p + 1 : Math.max(0, p - 1)));
    } finally {
      setLikeLoading(false);
    }
  }

  function fmt(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  return (
    <View style={[styles.videoCard, { height: pageHeight }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Right actions */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLike}
          disabled={likeLoading}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, liked && styles.iconWrapLiked]}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? G.primary : "#fff"}
            />
          </View>
          <Text style={styles.actionCount}>{fmt(likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onCommentPress(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrap}>
            <Image
              source={require("../../assets/icons/chat.png")}
              style={styles.iconImg}
            />
          </View>
          <Text style={styles.actionCount}>{fmt(comments)}</Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <View style={styles.iconWrap}>
            <Image
              source={require("../../assets/icons/eye.png")}
              style={styles.iconImg}
            />
          </View>
          <Text style={styles.actionCount}>{fmt(views)}</Text>
        </View>
      </View>

      {/* Bottom info */}
      <View style={styles.videoInfo}>
        <View style={styles.userRow}>
          {item.athletes?.photo_url ? (
            <Image
              source={{ uri: item.athletes.photo_url }}
              style={styles.avatarSmall}
            />
          ) : (
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {item.athletes?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <Text style={styles.username}>
            @
            {item.athletes?.name?.toLowerCase().replace(/\s+/g, "_") ??
              "athlete"}
          </Text>
          {item.athletes?.status === "approved" && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={9} color={G.bg} />
            </View>
          )}
          {!isOwnVideo && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={() => onFollowToggle(item.athletes?.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.followBtnText,
                  isFollowing && { color: "rgba(255,255,255,0.6)" },
                ]}
              >
                {isFollowing ? "Following" : "+ Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {item.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {item.caption}
          </Text>
        ) : null}
        <View style={styles.tagsRow}>
          {item.sport ? (
            <View style={styles.tagGreen}>
              <Text style={styles.tagGreenText}>
                {item.sport
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </Text>
            </View>
          ) : null}
          {item.city ? (
            <View style={styles.tagDark}>
              <Text style={styles.tagDarkText}>{item.city}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ── Home Screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const { athlete } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight =
    TAB_BAR_HEIGHT +
    Math.max(insets.bottom, Platform.OS === "android" ? 8 : 4) +
    0.5;
  const pageHeight = height - tabBarHeight;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("For You");
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState("");
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [screenFocused, setScreenFocused] = useState(true);
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const fetchControllerRef = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, []),
  );

  async function fetchFollowStatuses(videoList: VideoItem[]) {
    if (!athlete?.id) return;
    const ids = [
      ...new Set(
        videoList
          .map((v) => v.athletes?.id)
          .filter((id) => id && id !== athlete.id),
      ),
    ];
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/athletes/${id}/stats?athlete_id=${athlete.id}`,
          );
          const d = await res.json();
          if (res.ok)
            setFollowMap((prev) => ({ ...prev, [id]: d.isFollowing }));
        } catch {}
      }),
    );
  }

  async function handleFollowToggle(targetId: string) {
    if (!athlete?.id || !targetId) return;
    const was = !!followMap[targetId];
    setFollowMap((prev) => ({ ...prev, [targetId]: !was }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/athletes/${targetId}/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athlete_id: athlete.id }),
        },
      );
      const d = await res.json();
      if (res.ok)
        setFollowMap((prev) => ({ ...prev, [targetId]: d.following }));
      else setFollowMap((prev) => ({ ...prev, [targetId]: was }));
    } catch {
      setFollowMap((prev) => ({ ...prev, [targetId]: was }));
    }
  }

  const fetchVideos = useCallback(
    async (category: string, isRefresh = false) => {
      if (fetchControllerRef.current) fetchControllerRef.current.abort();
      fetchControllerRef.current = new AbortController();
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        let url = `${API_BASE_URL}/api/videos`;
        const params = new URLSearchParams();
        if (category === "For You") {
          if (athlete?.id) params.set("viewer_id", athlete.id);
        } else if (category === "Trending") {
          params.set("trending", "true");
        } else {
          params.set("sport", category.toLowerCase().replace(/\s+/g, "_"));
        }
        const qs = params.toString();
        if (qs) url += `?${qs}`;
        const res = await fetch(url, {
          signal: fetchControllerRef.current?.signal,
        });
        const data = await res.json();
        if (res.ok) {
          setVideos(data.data ?? []);
          fetchFollowStatuses(data.data ?? []);
        } else setError("Could not load feed.");
      } catch (e: any) {
        if (e?.name !== "AbortError") setError("Cannot reach server.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [athlete?.id],
  );

  useEffect(() => {
    fetchVideos(activeCategory);
  }, [activeCategory, fetchVideos]);

  const nextVideoUrl = videos[activeIndex + 1]?.url;
  useEffect(() => {
    if (!nextVideoUrl) return;
    fetch(nextVideoUrl, { method: "HEAD" }).catch(() => {});
  }, [nextVideoUrl]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
    },
    [],
  );

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />

      {/* Category pills */}
      <View style={[styles.categories, { top: insets.top + 8 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.catPill,
                activeCategory === c && styles.catPillActive,
              ]}
              onPress={() => {
                setActiveCategory(c);
                setActiveIndex(0);
              }}
              activeOpacity={0.8}
            >
              {c === "For You" && (
                <Ionicons
                  name="medal"
                  size={12}
                  color={G.gold}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.catText,
                  activeCategory === c && styles.catTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={G.primary} size="large" />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={40} color="#EF4444" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchVideos(activeCategory)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="trophy-outline" size={48} color={G.muted} />
          <Text style={styles.emptyTitle}>No videos yet</Text>
          <Text style={styles.emptyText}>Be the first to post!</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <VideoCard
              item={item}
              isActive={index === activeIndex}
              athlete={athlete}
              onCommentPress={(id: string) => setCommentVideoId(id)}
              isFollowing={!!followMap[item.athletes?.id]}
              onFollowToggle={handleFollowToggle}
              screenFocused={screenFocused}
              pageHeight={pageHeight}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={pageHeight}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, index) => ({
            length: pageHeight,
            offset: pageHeight * index,
            index,
          })}
          refreshing={refreshing}
          onRefresh={() => fetchVideos(activeCategory, true)}
          removeClippedSubviews
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}

      <CommentsModal
        visible={!!commentVideoId}
        videoId={commentVideoId}
        onClose={() => setCommentVideoId(null)}
        athlete={athlete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },
  categories: { position: "absolute", left: 0, right: 0, zIndex: 10 },
  catScroll: { paddingHorizontal: 14, gap: 8 },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(12,42,24,0.9)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: "#2A2A2A",
  },
  catPillActive: { backgroundColor: G.primary },
  catFire: { fontSize: 12 },
  catText: { color: G.muted, fontSize: 13, fontWeight: "600" },
  catTextActive: { color: "#fff" },

  videoCard: { width, height, backgroundColor: G.bg },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  actionBar: {
    position: "absolute",
    right: 12,
    bottom: 24,
    alignItems: "center",
    gap: 14,
  },
  actionBtn: { alignItems: "center", gap: 5 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapLiked: {
    backgroundColor: "rgba(9,192,104,0.25)",
    borderColor: "#09C068",
  },
  iconText: { fontSize: 18, color: "#fff" },
  iconImg: { width: 18, height: 18, tintColor: "#fff" },
  actionCount: { fontSize: 10, color: "#fff", fontWeight: "700" },

  videoInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 62,
    padding: 14,
    paddingBottom: 18,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: G.primary,
    borderWidth: 2,
    borderColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarSmallText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  username: { color: "#fff", fontSize: 15, fontWeight: "700" },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedCheck: { color: G.bg, fontSize: 9, fontWeight: "900" },
  followBtn: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followBtnActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  followBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  caption: { color: "#fff", fontSize: 13, lineHeight: 18, marginBottom: 8 },
  tagsRow: { flexDirection: "row", gap: 6 },
  tagGreen: {
    backgroundColor: G.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagGreenText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  tagDark: {
    backgroundColor: "rgba(12,42,24,0.9)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: "#2A2A2A",
  },
  tagDarkText: { color: G.muted, fontSize: 11 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { color: G.muted, fontSize: 14 },
  errorIcon: { fontSize: 40 },
  errorTitle: { color: G.text, fontSize: 18, fontWeight: "800" },
  retryBtn: {
    backgroundColor: G.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: G.text, fontSize: 20, fontWeight: "800" },
  emptyText: { color: G.muted, fontSize: 14 },
});
