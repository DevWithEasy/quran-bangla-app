import * as FileSystem from "expo-file-system";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getDownloadKLink,
  getFilePath,
  getFolderPath,
} from "../utils/audioControllers";
import Toast from "react-native-toast-message";

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

  useEffect(() => {
    // মডাল খোলা হলে আর কোন প্রগ্রেস রিসেট করতে চাই
    if (!modalVisible) {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [modalVisible]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const downloadUrl = await getDownloadKLink( reciter, surahId);
      const dirUri = await getFolderPath(reciter);
      const downloadPath = await getFilePath(reciter, surahId);

      const dirInfo = await FileSystem.getInfoAsync(dirUri);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      }

      downloadResumableRef.current = FileSystem.createDownloadResumable(
        downloadUrl,
        downloadPath,
        {},
        (progress) => {
          const progressPercent =
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
          setDownloadProgress(progressPercent);
        }
      );

      await downloadResumableRef.current.downloadAsync();

      Toast.show({
        type: "success",
        text1: "সফল হয়েছে",
        text2: "সুরাটি ডাউনলোড হয়েছে। এখন প্লে করুন 👋",
        visibilityTime: 3000,
      });

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
        // ডাউনলোডキャンセル করার জন্য ডাউনলোড রিসুমেবল কে লগ্ন করবো
        await downloadResumableRef.current.pauseAsync?.(); // pauseAsync ভ্যারিয়েশন থাকতে পারে।
        downloadResumableRef.current = null;
        Toast.show({
          type: "info",
          text1: "ডাউনলোড বাতিল হয়েছে",
          visibilityTime: 2000,
        });
        setIsDownloading(false);
        setDownloadProgress(0);
        setModalVisible(false);
        if (onDownloadCancelled) onDownloadCancelled();
      } catch (error) {
        console.error("Cancel download error:", error);
        Alert.alert("ত্রুটি", "ডাউনলোড বাতিল করতে সমস্যা হয়েছে");
      }
    } else {
      // যদি কোন ডাউনলোড না থাকে, মডাল বন্ধ করবে
      setModalVisible(false);
      setIsDownloading(false);
      setDownloadProgress(0);
      if (onDownloadCancelled) onDownloadCancelled();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={cancelDownload}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            এই সূরার অডিও ডাউনলোড করা হয়নি!
          </Text>

          {isDownloading ? (
            <>
              <ActivityIndicator size="large" color="#138d75" />
              <Text style={styles.progressText}>
                ডাউনলোড হচ্ছে... {Math.round(downloadProgress)}%
              </Text>

              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={cancelDownload}
              >
                <Text style={styles.textStyle}>ডাউনলোড বাতিল করুন</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.button, styles.downloadButton]}
                onPress={handleDownload}
              >
                <Text style={styles.textStyle}>ডাউনলোড করুন</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={cancelDownload}
              >
                <Text style={styles.textStyle}>বাতিল</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#333",
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#138d75",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  textStyle: {
    color: "white",
    fontFamily: "banglaSemiBold",
    textAlign: "center",
    fontSize: 16,
  },
  progressText: {
    marginTop: 10,
    fontFamily: "banglaRegular",
    color: "#138d75",
  },
});
