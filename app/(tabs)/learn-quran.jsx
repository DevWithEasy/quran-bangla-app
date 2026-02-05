import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import DbService from "../../lib/dbService";

export default function QuranCourse() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedVideoForCompletion, setSelectedVideoForCompletion] =
    useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DbService.getVideos();
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
      Alert.alert("ত্রুটি", "ভিডিও লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Handle video press
  const handleVideoPress = async (video) => {
    setActiveVideo(video.id);
    try {
      // Check if YouTube URL
      if (
        video.video_url.includes("youtube.com") ||
        video.video_url.includes("youtu.be")
      ) {
        const canOpen = await Linking.canOpenURL(video.video_url);
        if (canOpen) {
          await Linking.openURL(video.video_url);
        } else {
          Alert.alert("ত্রুটি", "এই ভিডিওটি খুলতে পারছি না");
        }
      } else {
        // For direct video URLs, show a modal with options
        Alert.alert("ভিডিও দেখুন", "আপনি কি ভিডিওটি দেখতে চান?", [
          { text: "বাতিল", style: "cancel" },
          { text: "ভিডিও দেখুন", onPress: () => openVideoInBrowser(video) },
          {
            text: "সম্পন্ন হিসেবে মার্ক করুন",
            onPress: () => promptForCompletion(video),
          },
        ]);
      }
    } catch (error) {
      console.error("Error opening video:", error);
      Alert.alert("ত্রুটি", "ভিডিও খুলতে সমস্যা হয়েছে");
    } finally {
      setActiveVideo(null);
    }
  };

  // Open video in browser
  const openVideoInBrowser = async (video) => {
    try {
      await Linking.openURL(video.video_url);
    } catch (error) {
      console.error("Error opening video URL:", error);
      Alert.alert("ত্রুটি", "ভিডিও খুলতে সমস্যা হয়েছে");
    }
  };

  // Prompt for completion
  const promptForCompletion = (video) => {
    setSelectedVideoForCompletion(video);
    setShowCompletionModal(true);
  };

  // Mark video as completed
  const markVideoAsCompleted = async () => {
    if (!selectedVideoForCompletion) return;

    try {
      await DbService.markVideoAsCompleted(selectedVideoForCompletion.id);

      // Update local state
      const updatedVideos = videos.map((video) =>
        video.id === selectedVideoForCompletion.id
          ? { ...video, is_completed: 1 }
          : video,
      );

      setVideos(updatedVideos);
      setShowCompletionModal(false);
      setSelectedVideoForCompletion(null);

      // Show success message
      Alert.alert(
        "সফল!",
        `"${selectedVideoForCompletion.title}" সম্পন্ন হিসেবে মার্ক করা হয়েছে`,
        [{ text: "ঠিক আছে" }],
      );
    } catch (error) {
      console.error("Error marking video as completed:", error);
      Alert.alert("ত্রুটি", "ভিডিও মার্ক করতে সমস্যা হয়েছে");
    }
  };

  // Mark video as incomplete
  const markVideoAsIncomplete = async (videoId) => {
    try {
      await DbService.markVideoAsIncomplete(videoId);

      // Update local state
      const updatedVideos = videos.map((video) =>
        video.id === videoId ? { ...video, is_completed: 0 } : video,
      );

      setVideos(updatedVideos);
      Alert.alert("সফল!", "ভিডিওটি ইনকমপ্লিট হিসেবে মার্ক করা হয়েছে");
    } catch (error) {
      console.error("Error marking video as incomplete:", error);
      Alert.alert("ত্রুটি", "ভিডিও মার্ক করতে সমস্যা হয়েছে");
    }
  };

  // Handle note press
  const handleNotePress = async (noteUrl) => {
    if (!noteUrl) {
      Alert.alert("মনে রাখা", "এই ক্লাসের জন্য কোনো নোট নেই");
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(noteUrl);
      if (canOpen) {
        await Linking.openURL(noteUrl);
      } else {
        Alert.alert("ত্রুটি", "এই নোটটি খুলতে পারছি না");
      }
    } catch (error) {
      console.error("Error opening note:", error);
      Alert.alert("ত্রুটি", "নোট খুলতে সমস্যা হয়েছে");
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!videos || videos.length === 0) return 0;
    const completedCount = videos.filter((v) => v.is_completed === 1).length;
    return Math.round((completedCount / videos.length) * 100);
  };

  // Get completed videos count
  const getCompletedCount = () => {
    return videos.filter((v) => v.is_completed === 1).length;
  };

  // Handle long press on video card for more options
  const handleVideoLongPress = (video) => {
    Alert.alert("ভিডিও অপশন", `${video.title}`, [
      { text: "বাতিল", style: "cancel" },
      {
        text:
          video.is_completed === 1
            ? "ইনকমপ্লিট মার্ক করুন"
            : "সম্পন্ন মার্ক করুন",
        onPress: () => {
          if (video.is_completed === 1) {
            markVideoAsIncomplete(video.id);
          } else {
            promptForCompletion(video);
          }
        },
      },
      {
        text: "ভিডিও খুলুন",
        onPress: () => handleVideoPress(video),
      },
    ]);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#138d75" />
        <Text style={styles.loadingText}>কোর্স লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Course Content */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#138d75"]}
            tintColor="#138d75"
          />
        }
      >
              {/* Header Section */}
      <LinearGradient colors={["#138d75", "#16a085"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="school" size={32} color="#fff" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>২৪ ঘন্টায় কুরআন শিক্ষা</Text>
            <Text style={styles.headerSubtitle}>
              সহজে আরবি পড়া ও কুরআন তিলাওয়াত শিখুন
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              অগ্রগতি: {toBengaliNumber(calculateProgress())}%
            </Text>
            <Text style={styles.completedText}>
              সম্পন্ন: {toBengaliNumber(getCompletedCount())}/
              {toBengaliNumber(videos.length)} ক্লাস
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${calculateProgress()}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.contentContainer}>
        {/* Introduction Card */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>কোর্স সম্পর্কে</Text>
            <Text style={styles.introDescription}>
              এই কোর্সটিতে আপনি সহজ ধাপে কুরআন পড়া এবং তিলাওয়াত শিখবেন।
              প্রতিটি ক্লাসে ভিডিও লেকচার এবং প্র্যাকটিস নোট রয়েছে। ভিডিওতে
              দীর্ঘক্ষণ টাচ করলে আরও অপশন দেখতে পাবেন। এই কোর্সে স্বত্বধিকারী &quot;১০ মিনিট স্কুল&quot;
            </Text>
        </View>

        {/* Video List */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="play-circle-filled" size={24} color="#138d75" />
          <Text style={styles.sectionTitle}>ক্লাস লিস্ট</Text>
          <Text style={styles.videoCount}>
            {toBengaliNumber(videos.length)} টি ক্লাস
          </Text>
        </View>

        {videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-off" size={64} color="#ddd" />
            <Text style={styles.emptyText}>কোনো ভিডিও পাওয়া যায়নি</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>পুনরায় চেষ্টা করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          videos.map((video) => {
            const isCompleted = video.is_completed === 1;
            const hasNotes = !!video.note_url && video.note_url.trim() !== "";

            return (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => handleVideoPress(video)}
                onLongPress={() => handleVideoLongPress(video)}
                activeOpacity={0.7}
              >
                {/* Video Number */}
                <View
                  style={[
                    styles.videoNumberContainer,
                    isCompleted && styles.videoNumberCompleted,
                  ]}
                >
                  <Text style={styles.videoNumber}>
                    {toBengaliNumber(video.id)}
                  </Text>
                  {isCompleted && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#138d75"
                      style={styles.completedIcon}
                    />
                  )}
                </View>

                {/* Video Info */}
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>

                  <View style={styles.videoMeta}>
                    <View style={styles.durationContainer}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.durationText}>
                        {video.duration || "N/A"}
                      </Text>
                    </View>

                    {hasNotes && (
                      <View style={styles.noteIndicator}>
                        <Ionicons
                          name="document-text-outline"
                          size={14}
                          color="#138d75"
                        />
                        <Text style={styles.noteText}>নোট আছে</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {activeVideo === video.id ? (
                    <ActivityIndicator size="small" color="#138d75" />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          isCompleted && styles.playButtonCompleted,
                        ]}
                        onPress={() => handleVideoPress(video)}
                      >
                        <Ionicons
                          name={
                            isCompleted ? "play-circle" : "play-circle-outline"
                          }
                          size={28}
                          color="#fff"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.noteButton,
                          !hasNotes && styles.noteButtonDisabled,
                        ]}
                        onPress={() => handleNotePress(video.note_url)}
                        disabled={!hasNotes}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={22}
                          color={hasNotes ? "#138d75" : "#ccc"}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Course Completion Message */}
        {getCompletedCount() === videos.length && videos.length > 0 && (
          <View style={styles.completionCard}>
            <LinearGradient
              colors={["#27ae60", "#2ecc71"]}
              style={styles.completionGradient}
            >
              <Ionicons name="trophy" size={48} color="#fff" />
              <Text style={styles.completionTitle}>অভিনন্দন!</Text>
              <Text style={styles.completionMessage}>
                আপনি পুরো কোর্সটি সম্পন্ন করেছেন। কুরআন পড়া এবং তিলাওয়াত
                সম্পর্কে আপনার বেসিক জ্ঞান এখন পূর্ণতা পেয়েছে।
              </Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.footerSpacing} />
      </View>

      </ScrollView>

      {/* Completion Confirmation Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color="#27ae60"
              style={styles.modalIcon}
            />

            <Text style={styles.modalTitle}>ভিডিও সম্পন্ন?</Text>

            <Text style={styles.modalDescription}>
              আপনি কি &quot;{selectedVideoForCompletion?.title}&quot; ভিডিওটি
              সম্পন্ন দেখেছেন?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCompletionModal(false);
                  setSelectedVideoForCompletion(null);
                }}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={markVideoAsCompleted}
              >
                <Text style={styles.confirmButtonText}>হ্যাঁ, সম্পন্ন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#333",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "rgba(255,255,255,0.9)",
  },
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 15,
    padding: 15,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#fff",
  },
  completedText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "rgba(255,255,255,0.9)",
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  introCard: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  introTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  introTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  introDescription: {
    fontFamily: "banglaRegular",
    color: "#666",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
    marginLeft: 10,
    flex: 1,
  },
  videoCount: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#7f8c8d",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#138d75",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "banglaSemiBold",
    fontSize: 14,
  },
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  videoNumberCompleted: {
    backgroundColor: "#27ae60",
  },
  videoNumber: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
  },
  completedIcon: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  durationText: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#666",
    marginLeft: 5,
  },
  noteIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteText: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#138d75",
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: "#138d75",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  playButtonCompleted: {
    backgroundColor: "#27ae60",
  },
  noteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
  },
  noteButtonDisabled: {
    backgroundColor: "#f8f9fa",
  },
  completionCard: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  completionGradient: {
    padding: 25,
    alignItems: "center",
  },
  completionTitle: {
    fontSize: 28,
    fontFamily: "banglaBold",
    color: "#fff",
    marginTop: 15,
    marginBottom: 10,
  },
  completionMessage: {
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: 24,
  },
  footerSpacing: {
    height: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "banglaBold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ecf0f1",
  },
  cancelButtonText: {
    color: "#7f8c8d",
    fontFamily: "banglaSemiBold",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#27ae60",
  },
  confirmButtonText: {
    color: "#fff",
    fontFamily: "banglaSemiBold",
    fontSize: 16,
  },
});