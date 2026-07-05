import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
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
const THUMB = (width - 52) / 3;

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

// ── Comments sheet ────────────────────────────────────────────
function CommentsSheet({ visible, videoId, onClose, viewer }: any) {
  const [comments, setComments] = useState<any[]>([]);
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
    if (!text.trim() || !viewer?.id) return;
    setPosting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/videos/${videoId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athlete_id: viewer.id,
            name: viewer.name,
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
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          backgroundColor: G.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: height * 0.75,
          borderTopWidth: 0.5,
          borderColor: G.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: G.border,
          }}
        >
          <Text style={{ color: G.text, fontSize: 15, fontWeight: "700" }}>
            {total} Comments
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: G.muted, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View
            style={{
              height: 120,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator color={G.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View
            style={{
              height: 120,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: G.dim }}>No comments yet</Text>
          </View>
        ) : (
          <ScrollView
            style={{ maxHeight: height * 0.45 }}
            showsVerticalScrollIndicator={false}
          >
            {comments.map((c) => (
              <View
                key={c.id}
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 0.5,
                  borderBottomColor: G.surfaceAlt,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: G.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}
                  >
                    {c.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{ color: G.text, fontSize: 13, fontWeight: "700" }}
                    >
                      {c.name}
                    </Text>
                    <Text style={{ color: G.dim, fontSize: 11 }}>
                      {timeAgo(c.created_at)}
                    </Text>
                  </View>
                  <Text style={{ color: "#CCC", fontSize: 13, lineHeight: 18 }}>
                    {c.text}
                  </Text>
                </View>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            gap: 10,
            borderTopWidth: 0.5,
            borderTopColor: G.border,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: G.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>
              {viewer?.name?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: G.bg,
              borderWidth: 0.5,
              borderColor: G.border,
              borderRadius: 20,
              color: G.text,
              fontSize: 14,
              paddingHorizontal: 14,
              paddingVertical: 8,
              maxHeight: 80,
            }}
            placeholder="Add a comment..."
            placeholderTextColor={G.dim}
            value={text}
            onChangeText={setText}
            maxLength={300}
            multiline
          />
          <TouchableOpacity
            style={[
              {
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: G.primary,
                alignItems: "center",
                justifyContent: "center",
              },
              (!text.trim() || posting) && { opacity: 0.4 },
            ]}
            onPress={postComment}
            disabled={!text.trim() || posting}
          >
            {posting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 14 }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Video card ────────────────────────────────────────────────
function VideoCard({ video, isActive, viewer, onCommentPress }: any) {
  const player = useVideoPlayer(video.url, (p) => {
    p.loop = true;
    p.muted = false;
  });
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes ?? 0);
  const [views, setViews] = useState(0);
  const [comments] = useState(video.comments ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const viewTracked = useRef(false);

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
    if (isActive) {
      player.play();
      if (!viewTracked.current && viewer?.id) {
        viewTracked.current = true;
        fetch(`${API_BASE_URL}/api/videos/${video.id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athlete_id: viewer.id }),
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
  }, [isActive]);

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
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  return (
    <View style={{ width, height, backgroundColor: G.bg }}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 280,
          backgroundColor: "rgba(6,26,15,0.5)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 14,
          bottom: 120,
          alignItems: "center",
          gap: 20,
        }}
      >
        <TouchableOpacity
          style={{ alignItems: "center", gap: 5 }}
          onPress={handleLike}
          disabled={likeLoading}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: liked
                ? "rgba(9,192,104,0.2)"
                : "rgba(0,0,0,0.5)",
              borderWidth: 0.5,
              borderColor: liked ? "#09C068" : "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22, color: liked ? G.primary : "#fff" }}>
              {liked ? "♥" : "♡"}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700" }}>
            {fmt(likes)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center", gap: 5 }}
          onPress={() => onCommentPress(video.id)}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(6,26,15,0.5)",
              borderWidth: 0.5,
              borderColor: "rgba(9,192,104,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../assets/icons/chat.png")}
              style={{ width: 22, height: 22, tintColor: "#fff" }}
            />
          </View>
          <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700" }}>
            {fmt(comments)}
          </Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center", gap: 5 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(6,26,15,0.5)",
              borderWidth: 0.5,
              borderColor: "rgba(9,192,104,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../assets/icons/eye.png")}
              style={{ width: 22, height: 22, tintColor: "#fff" }}
            />
          </View>
          <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700" }}>
            {fmt(views)}
          </Text>
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 70,
          padding: 16,
          paddingBottom: 20,
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

// ── Feed modal ────────────────────────────────────────────────
function VideoFeedModal({ visible, videos, startIndex, onClose, viewer }: any) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
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
            backgroundColor: "rgba(6,26,15,0.7)",
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
          <Text
            style={{
              color: "rgba(9,192,104,0.8)",
              fontSize: 12,
              fontWeight: "700",
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
            <VideoCard
              video={item}
              isActive={index === activeIndex}
              viewer={viewer}
              onCommentPress={(id: string) => setCommentVideoId(id)}
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
        <CommentsSheet
          visible={!!commentVideoId}
          videoId={commentVideoId}
          onClose={() => setCommentVideoId(null)}
          viewer={viewer}
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
    let c = false;
    VideoThumbnails.getThumbnailAsync(item.url, { time: 0 })
      .then(({ uri }) => {
        if (!c) setThumb(uri);
      })
      .catch(() => {})
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, [item.url]);
  function fmt(n: number) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }
  return (
    <TouchableOpacity
      style={{ width: THUMB }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={{
          width: THUMB,
          height: THUMB * 1.4,
          backgroundColor: G.surface,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <ActivityIndicator color={G.primary} size="small" />
        ) : thumb ? (
          <Image
            source={{ uri: thumb }}
            style={{
              width: THUMB,
              height: THUMB * 1.4,
              borderRadius: 8,
              resizeMode: "cover",
            }}
          />
        ) : (
          <Text style={{ fontSize: 24 }}>🎬</Text>
        )}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "rgba(6,26,15,0.6)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, marginLeft: 2 }}>
              ▶
            </Text>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 5,
            left: 5,
            backgroundColor: "rgba(6,26,15,0.7)",
            borderRadius: 8,
            paddingHorizontal: 5,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
            👁 {fmt(item.views ?? 0)}
          </Text>
        </View>
      </View>
      {item.caption ? (
        <Text
          style={{
            color: G.muted,
            fontSize: 10,
            paddingHorizontal: 2,
            paddingTop: 3,
          }}
          numberOfLines={1}
        >
          {item.caption}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function PublicProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { athlete: viewer } = useAuth();
  const athleteId = params.athleteId as string;

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ followers: 0, following: 0, videos: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedStart, setFeedStart] = useState(0);

  const fetchAll = useCallback(
    async (isRefresh = false) => {
      if (!athleteId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [pRes, sRes, vRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/athletes/${athleteId}`),
          fetch(
            `${API_BASE_URL}/api/athletes/${athleteId}/stats?athlete_id=${viewer?.id ?? ""}`,
          ),
          fetch(`${API_BASE_URL}/api/videos/mine?athlete_id=${athleteId}`),
        ]);
        const [pData, sData, vData] = await Promise.all([
          pRes.json(),
          sRes.json(),
          vRes.json(),
        ]);
        if (pRes.ok) setProfile(pData.data);
        if (sRes.ok) {
          setStats({
            followers: sData.followers,
            following: sData.following,
            videos: sData.videos,
          });
          setIsFollowing(sData.isFollowing);
        }
        if (vRes.ok) {
          const vlist = vData.data ?? [];
          const withViews = await Promise.all(
            vlist.map(async (v: any) => {
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
        setLoading(false);
        setRefreshing(false);
      }
    },
    [athleteId, viewer?.id],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleFollow() {
    if (!viewer?.id || followLoading) return;
    setFollowLoading(true);
    const was = isFollowing;
    setIsFollowing(!was);
    setStats((s) => ({
      ...s,
      followers: was ? Math.max(0, s.followers - 1) : s.followers + 1,
    }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/athletes/${athleteId}/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ athlete_id: viewer.id }),
        },
      );
      const d = await res.json();
      if (res.ok) {
        setIsFollowing(d.following);
        setStats((s) => ({ ...s, followers: d.followers }));
      } else {
        setIsFollowing(was);
        setStats((s) => ({
          ...s,
          followers: was ? s.followers + 1 : Math.max(0, s.followers - 1),
        }));
      }
    } catch {
      setIsFollowing(was);
    } finally {
      setFollowLoading(false);
    }
  }

  function fmt(n: number) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

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
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View
        style={[
          styles.root,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <StatusBar hidden={true} />
        <Text style={{ color: G.muted, fontSize: 14 }}>Profile not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: G.primary, fontSize: 15, fontWeight: "700" }}>
            ← Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProfile = viewer?.id === athleteId;

  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAll(true)}
            tintColor={G.primary}
            colors={[G.primary]}
          />
        }
      >
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.handle}>
            @{profile.name?.toLowerCase().replace(/\s+/g, "_")}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={{ position: "relative" }}>
            {profile.photo_url ? (
              <Image
                source={{ uri: profile.photo_url }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {profile.status === "approved" && (
              <View style={styles.verifiedBadge}>
                <Text style={{ color: G.bg, fontSize: 12, fontWeight: "900" }}>
                  ✓
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.athleteName}>{profile.name.toUpperCase()}</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {profile.sport && (
              <View style={styles.tagGreen}>
                <Text style={styles.tagGreenText}>
                  {profile.sport
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </Text>
              </View>
            )}
            {profile.city && (
              <View style={styles.tagDark}>
                <Text style={styles.tagDarkText}>📍 {profile.city}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Follow button */}
        {!isOwnProfile && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
            onPress={handleFollow}
            disabled={followLoading}
            activeOpacity={0.85}
          >
            {followLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={[
                  styles.followBtnText,
                  isFollowing && { color: G.primary },
                ]}
              >
                {isFollowing ? "✓  Following" : "+  Follow"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { l: "Followers", v: fmt(stats.followers) },
            { l: "Following", v: fmt(stats.following) },
            { l: "Videos", v: fmt(stats.videos) },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNumber}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
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

        {/* Bio */}
        {(profile.bio || profile.achievements) && (
          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>ABOUT</Text>
            <Text style={styles.bioText}>
              {profile.bio || profile.achievements}
            </Text>
          </View>
        )}

        {/* Videos */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginHorizontal: 20,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "800",
              color: G.muted,
              letterSpacing: 2,
            }}
          >
            VIDEOS
          </Text>
          <View
            style={{
              backgroundColor: G.primary,
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
              {videos.length}
            </Text>
          </View>
        </View>

        {videos.length === 0 ? (
          <View
            style={{
              marginHorizontal: 20,
              padding: 28,
              backgroundColor: G.surface,
              borderWidth: 0.5,
              borderColor: G.border,
              borderRadius: 14,
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 32 }}>🎬</Text>
            <Text style={{ color: G.muted, fontSize: 13 }}>
              No videos posted yet
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 20,
              gap: 6,
              marginBottom: 8,
            }}
          >
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

        <View style={{ height: 30 }} />
      </ScrollView>

      <VideoFeedModal
        visible={feedOpen}
        videos={videos}
        startIndex={feedStart}
        onClose={() => setFeedOpen(false)}
        viewer={viewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  handle: {
    color: G.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: 0,
    left: "20%",
    right: "20%",
    height: 120,
    backgroundColor: G.primary,
    opacity: 0.05,
    borderRadius: 60,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: G.primary,
    marginBottom: 14,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: G.surfaceAlt,
    borderWidth: 2.5,
    borderColor: G.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarInitial: { color: G.primary, fontSize: 36, fontWeight: "900" },
  verifiedBadge: {
    position: "absolute",
    bottom: 18,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: G.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: G.bg,
  },
  athleteName: {
    fontSize: 24,
    fontWeight: "900",
    color: G.text,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  tagGreen: {
    backgroundColor: G.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  tagGreenText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tagDark: {
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  tagDarkText: { color: G.muted, fontSize: 12 },
  followBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: G.primary,
    borderRadius: 12,
    padding: 13,
    alignItems: "center",
  },
  followBtnActive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: G.primary,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 14,
    paddingVertical: 14,
    position: "relative",
  },
  statItem: { flex: 1, alignItems: "center", position: "relative" },
  statNumber: { color: G.primary, fontSize: 20, fontWeight: "800" },
  statLabel: { color: G.muted, fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
  bioCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 14,
    padding: 16,
  },
  bioLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: G.muted,
    marginBottom: 8,
  },
  bioText: { color: G.text, fontSize: 13, lineHeight: 20 },
});
