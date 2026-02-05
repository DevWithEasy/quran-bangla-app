import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DbService from "../lib/dbService";
import { getFilePath, getFolderPath } from "../utils/audioControllers";

const { width } = Dimensions.get("window");

export default function NoSuraModal({
  modalVisible,
  setModalVisible,
  surahId,
  reciter,
  onDownloadComplete,
  onDownloadCancelled,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadResumableRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (downloadProgress > 0) {
      Animated.timing(progressAnim, {
        toValue: downloadProgress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [downloadProgress]);

  useEffect(() => {
    if (!modalVisible) {
      setIsDownloading(false);
      setDownloadProgress(0);
      progressAnim.setValue(0);
    }
  }, [modalVisible]);

  const checkInternet = async () => {
    const { isInternetReachable } = await Network.getNetworkStateAsync();
    return isInternetReachable;
  };

  const handleDownload = async () => {
    try {
      const isConnected = await checkInternet();
      if (!isConnected) {
        Alert.alert(
          "ডাউনলোড ব্যর্থ",
          "দয়া করে ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন",
          [
            {
              text: "আবার চেষ্টা করুন",
              onPress: handleDownload,
              style: "default",
            },
            {
              text: "বাতিল করুন",
              style: "cancel",
              onPress: onDownloadCancelled,
            },
          ],
        );
        return;
      }
      setIsDownloading(true);
      setDownloadProgress(0);

      const downloadUrl = await DbService.getSuraUrl(surahId, reciter);
      const dirUri = await getFolderPath(reciter);
      const downloadPath = await getFilePath(reciter, surahId);
      const dirInfo = await FileSystem.getInfoAsync(dirUri);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      }

      downloadResumableRef.current = FileSystem.createDownloadResumable(
        downloadUrl.audio_url,
        downloadPath,
        {},
        (progress) => {
          const progressPercent =
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
            100;
          setDownloadProgress(progressPercent);
        },
      );

      await downloadResumableRef.current.downloadAsync();

      setIsDownloading(false);
      setModalVisible(false);

      if (onDownloadComplete) onDownloadComplete();
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("ত্রুটি", "ডাউনলোড ব্যর্থ হয়েছে");
      setIsDownloading(false);
    }
  };

  const cancelDownload = async () => {
    if (downloadResumableRef.current) {
      try {
        await downloadResumableRef.current.pauseAsync?.();
        downloadResumableRef.current = null;
        setIsDownloading(false);
        setDownloadProgress(0);
        setModalVisible(false);
        if (onDownloadCancelled) onDownloadCancelled();
      } catch (error) {
        console.error("Cancel download error:", error);
        Alert.alert("ত্রুটি", "ডাউনলোড বাতিল করতে সমস্যা হয়েছে");
      }
    } else {
      setModalVisible(false);
      setIsDownloading(false);
      setDownloadProgress(0);
      if (onDownloadCancelled) onDownloadCancelled();
    }
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={cancelDownload}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdrop} onPress={cancelDownload} />

        <Animated.View
          style={[
            styles.modalView,
            {
              opacity: fadeAnim,
              transform: [{ translateY: modalTranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.header,
              { flexDirection: "row", alignItems: "center", gap: 6 },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="cloud-download-outline"
                size={24}
                color="#138d75"
              />
            </View>
            <View>
              <Text style={styles.modalTitle}>অডিও ডাউনলোড</Text>
              <Text style={styles.modalSubtitle}>
                সূরা {surahId} - {reciter}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            {isDownloading ? (
              <>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      style={[styles.progressBarFill, { width: progressWidth }]}
                    />
                  </View>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {Math.round(downloadProgress)}%
                    </Text>
                    <Text style={styles.progressLabel}>ডাউনলোড হচ্ছে...</Text>
                  </View>
                </View>

                <View style={styles.buttonGroup}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      styles.cancelButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={cancelDownload}
                  >
                    <Ionicons name="close-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>বাতিল করুন</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.messageContainer}>
                  <Ionicons name="alert-circle" size={24} color="#f39c12" />
                  <Text style={styles.modalText}>
                    এই সূরার অডিওটি ডাউনলোড করা হয়নি। এখনই ডাউনলোড করতে চান?
                  </Text>
                </View>

                <View style={styles.buttonGroup}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      styles.downloadButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={handleDownload}
                  >
                    <Ionicons name="download" size={20} color="white" />
                    <Text style={styles.buttonText}>ডাউনলোড করুন</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      styles.cancelButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={cancelDownload}
                  >
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.buttonText}>পরবর্তীতে</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              অডিওটি আপনার ডিভাইসে সেভ করা হবে
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 0,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 32,
    backgroundColor: "#e6f7f4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
  },
  modalSubtitle: {
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
  },
  content: {
    padding: 24,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbf0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalText: {
    fontFamily: "banglaRegular",
    color: "#2c3e50",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#138d75",
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  downloadButton: {
    backgroundColor: "#138d75",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "white",
    fontFamily: "banglaSemiBold",
  },
  footer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#95a5a6",
    textAlign: "center",
  },
});
