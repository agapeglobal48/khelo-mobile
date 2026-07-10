import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
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

type Mode = "menu" | "record" | "preview" | "uploading";

const UPLOAD_STEPS = [
  "Preparing video...",
  "Connecting...",
  "Uploading to cloud...",
  "Processing...",
  "Saving your post...",
];

interface VideoItem {
  id: string;
  url: string;
  caption: string;
  sport: string;
  likes: number;
  views: number;
  uploaded_at: string;
  thumbnail?: string;
}

// ── Personal feed video card ──────────────────────────────────
function PersonalVideoCard({ video, isActive, athlete }: any) {
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
    if (isActive) player.play();
    else player.pause();
  }, [isActive]);

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

      {/* Right action bar — identical to home feed */}
      <View style={pvc.actionBar}>
        {/* Avatar */}
        <View style={pvc.avatarWrap}>
          {athlete?.photo_url ? (
            <Image source={{ uri: athlete.photo_url }} style={pvc.avatar} />
          ) : (
            <View style={pvc.avatarFallback}>
              <Text style={pvc.avatarText}>
                {athlete?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
        </View>

        {/* Like */}
        <TouchableOpacity
          style={pvc.actionBtn}
          onPress={handleLike}
          disabled={likeLoading}
        >
          <View style={[pvc.iconWrap, liked && pvc.iconWrapLiked]}>
            <Text style={[pvc.icon, liked && { color: G.primary }]}>
              {liked ? "♥" : "♡"}
            </Text>
          </View>
          <Text style={pvc.count}>{fmt(likes)}</Text>
        </TouchableOpacity>

        {/* Comments */}
        <View style={pvc.actionBtn}>
          <View style={pvc.iconWrap}>
            <Image
              source={require("../../assets/icons/chat.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </View>
          <Text style={pvc.count}>{fmt(comments)}</Text>
        </View>

        {/* Views */}
        <View style={pvc.actionBtn}>
          <View style={pvc.iconWrap}>
            <Image
              source={require("../../assets/icons/eye.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </View>
          <Text style={pvc.count}>{fmt(views)}</Text>
        </View>
      </View>

      {/* Bottom info — identical to home feed */}
      <View style={pvc.bottomInfo}>
        <View style={pvc.userRow}>
          {athlete?.photo_url ? (
            <Image
              source={{ uri: athlete.photo_url }}
              style={pvc.smallAvatar}
            />
          ) : (
            <View style={pvc.smallAvatarFallback}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>
                {athlete?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <Text style={pvc.username}>
            @{athlete?.name?.toLowerCase().replace(/\s+/g, "_") ?? "you"}
          </Text>
        </View>
        {video.caption ? (
          <Text style={pvc.caption} numberOfLines={2}>
            {video.caption}
          </Text>
        ) : null}
        {video.sport ? (
          <View style={pvc.sportTag}>
            <Text style={pvc.sportTagText}>
              {video.sport
                .replace(/_/g, " ")
                .replace(/\w/g, (s: string) => s.toUpperCase())}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const pvc = StyleSheet.create({
  actionBar: {
    position: "absolute",
    right: 12,
    bottom: 120,
    alignItems: "center",
    gap: 20,
  },
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
  actionBtn: { alignItems: "center", gap: 5 },
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

// ── Personal feed modal ───────────────────────────────────────
function PersonalFeedModal({
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
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            MY VIDEOS
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              marginTop: 2,
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
            <PersonalVideoCard
              video={item}
              isActive={index === activeIndex}
              athlete={athlete}
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
export default function CreateScreen() {
  const { athlete } = useAuth();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>("menu");
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [myVideos, setMyVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedStartIndex, setFeedStartIndex] = useState(0);

  const previewPlayer = useVideoPlayer(videoUri ?? "", (p) => {
    p.loop = false;
    p.muted = true;
  });
  useEffect(() => {
    if (videoUri) previewPlayer.replace(videoUri);
  }, [videoUri]);

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const fetchMyVideos = useCallback(async () => {
    if (!athlete?.id) return;
    setLoadingVideos(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/videos/mine?athlete_id=${athlete.id}`,
      );
      const data = await res.json();
      if (res.ok && data.data) {
        const withThumbs = await Promise.all(
          data.data.map(async (v: VideoItem) => ({
            ...v,
            thumbnail: await VideoThumbnails.getThumbnailAsync(v.url, {
              time: 0,
            })
              .then((r) => r.uri)
              .catch(() => undefined),
          })),
        );
        setMyVideos(withThumbs);
      }
    } catch {
    } finally {
      setLoadingVideos(false);
    }
  }, [athlete]);

  useEffect(() => {
    fetchMyVideos();
  }, [fetchMyVideos]);

  function showToast() {
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  }

  async function handleUpload() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 120,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
        Alert.alert("Video Too Large", "Maximum 50MB.");
        return;
      }
      setVideoUri(asset.uri);
      setVideoSize(
        asset.fileSize
          ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB`
          : null,
      );
      setMode("preview");
    }
  }

  async function handleRecord() {
    if (!cameraPermission?.granted) {
      const r = await requestCameraPermission();
      if (!r.granted) {
        Alert.alert("Camera permission needed");
        return;
      }
    }
    if (!micPermission?.granted) {
      const r = await requestMicPermission();
      if (!r.granted) {
        Alert.alert("Microphone permission needed");
        return;
      }
    }
    setMode("record");
  }

  async function toggleRecording() {
    if (!cameraRef.current) return;
    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: 120 });
        if (video?.uri) {
          setVideoUri(video.uri);
          setMode("preview");
        }
      } catch {
        setIsRecording(false);
      }
    }
  }

  async function handlePost() {
    if (!videoUri || !athlete?.id) return;
    setMode("uploading");
    setUploadStep(0);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadStep((s) => {
        const n = s + 1;
        setUploadProgress((n / UPLOAD_STEPS.length) * 85);
        if (n >= UPLOAD_STEPS.length - 1) clearInterval(interval);
        return n;
      });
    }, 900);
    try {
      const formData = new FormData();
      const filename = videoUri.split("/").pop() || "video.mp4";
      const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
      // Always use mp4 mime type for compatibility
      formData.append("video", {
        uri: videoUri,
        name: "video.mp4",
        type: "video/mp4",
      } as any);
      formData.append("athlete_id", athlete.id);
      formData.append("caption", caption.trim());
      formData.append("sport", athlete.sport ?? "");
      formData.append("province", athlete.province ?? "");
      formData.append("city", athlete.city ?? "");
      const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      clearInterval(interval);
      if (response.ok) {
        setUploadProgress(100);
        setVideoUri(null);
        setVideoSize(null);
        setCaption("");
        setMode("menu");
        fetchMyVideos();
        showToast();
      } else {
        const data = await response.json();
        setMode("preview");
        Alert.alert("Upload Failed", data.message || "Please try again.");
      }
    } catch (err: any) {
      clearInterval(interval);
      setMode("preview");
      const msg =
        err?.name === "AbortError"
          ? "Upload timed out. Try a shorter video."
          : "Upload failed. Check your connection.";
      Alert.alert("Upload Failed", msg);
    }
  }

  // ── Uploading screen ──────────────────────────────────────
  if (mode === "uploading") {
    return (
      <View
        style={[
          styles.root,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <StatusBar hidden={true} />
        <View style={styles.uploadingCard}>
          <ActivityIndicator color={G.primary} size="large" />
          <Text style={styles.uploadingStep}>{UPLOAD_STEPS[uploadStep]}</Text>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${uploadProgress}%` as any },
              ]}
            />
          </View>
          <Text style={{ color: G.muted, fontSize: 13 }}>
            {Math.round(uploadProgress)}%
          </Text>
        </View>
      </View>
    );
  }

  // ── Record screen ─────────────────────────────────────────
  if (mode === "record") {
    return (
      <View style={styles.root}>
        <StatusBar hidden={true} />
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
          mode="video"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              paddingTop: 20,
            }}
          >
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(6,26,15,0.6)",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                setMode("menu");
                setIsRecording(false);
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(6,26,15,0.6)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              {isRecording && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: G.primary,
                  }}
                />
              )}
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                {isRecording ? "REC" : "READY"}
              </Text>
            </View>
            <View style={{ width: 36 }} />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              alignItems: "center",
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                borderWidth: 4,
                borderColor: G.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={toggleRecording}
            >
              <View
                style={[
                  {
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: G.primary,
                  },
                  isRecording && { width: 28, height: 28, borderRadius: 6 },
                ]}
              />
            </TouchableOpacity>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              {isRecording ? "Tap to stop" : "Tap to record · Max 2 min"}
            </Text>
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Preview screen ────────────────────────────────────────
  if (mode === "preview") {
    return (
      <View style={styles.root}>
        <StatusBar hidden={true} />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              paddingTop: insets.top + 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setMode("menu")}
              activeOpacity={0.7}
            >
              <Text style={{ color: G.muted, fontSize: 24 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: G.text, fontSize: 16, fontWeight: "700" }}>
              New Post
            </Text>
            <View style={{ width: 36 }} />
          </View>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              overflow: "hidden",
              height: 260,
              backgroundColor: G.surface,
            }}
          >
            <VideoView
              player={previewPlayer}
              style={{ width: "100%", height: 260 }}
              contentFit="cover"
              nativeControls={true}
            />
            {videoSize && (
              <View
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  backgroundColor: "rgba(6,26,15,0.8)",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ color: G.muted, fontSize: 11, fontWeight: "600" }}
                >
                  {videoSize}
                </Text>
              </View>
            )}
          </View>
          <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <Text style={styles.label}>CAPTION</Text>
            <TextInput
              style={[
                styles.input,
                { minHeight: 100, textAlignVertical: "top" },
              ]}
              placeholder="Describe your video, add hashtags..."
              placeholderTextColor={G.dim}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Text
              style={{
                color: G.dim,
                fontSize: 11,
                textAlign: "right",
                marginTop: 4,
              }}
            >
              {caption.length}/300
            </Text>
          </View>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              backgroundColor: G.surface,
              borderWidth: 0.5,
              borderColor: G.border,
              borderRadius: 12,
              padding: 14,
              gap: 8,
            }}
          >
            <Text style={{ color: G.muted, fontSize: 13 }}>
              🏅 Sport:{" "}
              <Text style={{ color: G.text, fontWeight: "600" }}>
                {athlete?.sport?.replace(/_/g, " ") || "—"}
              </Text>
            </Text>
            <Text style={{ color: G.muted, fontSize: 13 }}>
              📍 City:{" "}
              <Text style={{ color: G.text, fontWeight: "600" }}>
                {athlete?.city || "—"}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={handlePost}
            activeOpacity={0.85}
          >
            <Text style={styles.postBtnText}>POST VIDEO →</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Menu screen ───────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar hidden={true} />

      {successToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ Video posted successfully!</Text>
        </View>
      )}

      <PersonalFeedModal
        visible={feedOpen}
        videos={myVideos}
        startIndex={feedStartIndex}
        onClose={() => setFeedOpen(false)}
        athlete={athlete}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Text style={styles.heading}>CREATE</Text>
          <Text style={styles.headingSub}>
            Share your sports journey with Punjab
          </Text>
        </View>

        {/* Action cards */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleRecord}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <Image
              source={require("../../assets/icons/create-record.png")}
              style={styles.actionIcon}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionLabel}>RECORD</Text>
            <Text style={styles.actionSub}>Record directly with camera</Text>
          </View>
          <Text style={{ color: G.primary, fontSize: 20 }}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleUpload}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.actionIconWrap,
              {
                backgroundColor: "rgba(245,200,66,0.1)",
                borderColor: "rgba(245,200,66,0.2)",
              },
            ]}
          >
            <Image
              source={require("../../assets/icons/create-upload.png")}
              style={[styles.actionIcon, { tintColor: G.gold }]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionLabel}>UPLOAD</Text>
            <Text style={styles.actionSub}>Choose from your gallery</Text>
          </View>
          <Text style={{ color: G.gold, fontSize: 20 }}>→</Text>
        </TouchableOpacity>

        {/* Gallery */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 20,
            marginBottom: 12,
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
            MY VIDEOS
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
              {myVideos.length}
            </Text>
          </View>
        </View>

        {loadingVideos ? (
          <View
            style={{
              height: 120,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <ActivityIndicator color={G.primary} size="small" />
            <Text style={{ color: G.muted, fontSize: 13 }}>
              Loading your videos...
            </Text>
          </View>
        ) : myVideos.length === 0 ? (
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 24,
              backgroundColor: G.surface,
              borderWidth: 0.5,
              borderColor: G.border,
              borderRadius: 14,
              padding: 28,
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 36 }}>🎬</Text>
            <Text style={{ color: G.muted, fontSize: 13, textAlign: "center" }}>
              No videos yet — post your first one!
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 20,
              gap: 6,
              marginBottom: 24,
            }}
          >
            {myVideos.map((video) => (
              <View key={video.id} style={styles.thumbCard}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    setFeedStartIndex(myVideos.indexOf(video));
                    setFeedOpen(true);
                  }}
                  activeOpacity={0.85}
                >
                  {video.thumbnail ? (
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={styles.thumbImg}
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Text style={{ fontSize: 28 }}>🎬</Text>
                    </View>
                  )}
                  <View style={styles.thumbOverlay}>
                    <View style={styles.thumbPlayBtn}>
                      <Text
                        style={{ color: "#fff", fontSize: 14, marginLeft: 2 }}
                      >
                        ▶
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    Alert.alert("Delete Video", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const res = await fetch(
                              `${API_BASE_URL}/api/videos/${video.id}`,
                              {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  athlete_id: athlete?.id,
                                }),
                              },
                            );
                            if (res.ok)
                              setMyVideos((prev) =>
                                prev.filter((v) => v.id !== video.id),
                              );
                          } catch {}
                        },
                      },
                    ]);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 14 }}>🗑</Text>
                </TouchableOpacity>
                {video.caption ? (
                  <View
                    style={{
                      backgroundColor: G.bg,
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 10, color: G.muted }}
                      numberOfLines={1}
                    >
                      {video.caption}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: G.surface,
            borderWidth: 0.5,
            borderColor: G.border,
            borderRadius: 16,
            padding: 18,
          }}
        >
          <Text
            style={{
              color: G.primary,
              fontSize: 13,
              fontWeight: "800",
              letterSpacing: 1.5,
              marginBottom: 14,
            }}
          >
            ✨ PRO TIPS
          </Text>
          {[
            "Film in portrait mode for best visibility",
            "Show your best skills in the first 3 seconds",
            "Good lighting makes a big difference",
            "Keep videos between 15-60 seconds",
            "Add hashtags to reach more scouts",
          ].map((tip, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: G.primary,
                  marginTop: 6,
                }}
              />
              <Text
                style={{
                  flex: 1,
                  color: G.muted,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.bg },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: G.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headingSub: { fontSize: 12, color: G.muted },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 16,
    padding: 18,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(9,192,104,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(9,192,104,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: G.primary,
  },
  actionLabel: {
    color: G.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },
  actionSub: { color: G.muted, fontSize: 12 },

  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: G.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 12,
    color: G.text,
    fontSize: 15,
    padding: 13,
  },

  postBtn: {
    marginHorizontal: 20,
    backgroundColor: G.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  postBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 2,
  },

  uploadingCard: {
    backgroundColor: G.surface,
    borderWidth: 0.5,
    borderColor: G.border,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 20,
    width: "80%",
  },
  uploadingStep: { color: G.text, fontSize: 15, textAlign: "center" },
  progressBg: {
    width: "100%",
    height: 4,
    backgroundColor: G.surfaceAlt,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: G.primary, borderRadius: 2 },

  thumbCard: {
    width: THUMB,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: G.surface,
  },
  thumbImg: { width: THUMB, height: THUMB * 1.4, resizeMode: "cover" },
  thumbPlaceholder: {
    width: THUMB,
    height: THUMB * 1.4,
    backgroundColor: G.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(6,26,15,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(6,26,15,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  toast: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: "rgba(9,192,104,0.15)",
    borderWidth: 1,
    borderColor: G.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  toastText: { color: G.primary, fontSize: 14, fontWeight: "700" },
});
