import AsyncStorage from "@react-native-async-storage/async-storage";
import { toBengaliNumber } from "bengali-number";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import { unzipSync } from "fflate";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ZIP_URL =
  "https://cdn.jsdelivr.net/gh/DevWithEasy/app-file-store-repo/APP_DATA.zip";
const ZIP_NAME = "APP_DATA.zip";
const DATA_PATH = `${FileSystem.documentDirectory}APP_DATA`;
const ZIP_PATH = `${FileSystem.documentDirectory}${ZIP_NAME}`;

export default function DownloadScreen() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSizeMB, setTotalSizeMB] = useState(0);
  const [downloadedSizeMB, setDownloadedSizeMB] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const router = useRouter();

  const exitApp = () => {
    BackHandler.exitApp();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      exitApp
    );

    return () => backHandler.remove();
  }, []);

  const checkInternet = async () => {
    const { isInternetReachable } = await Network.getNetworkStateAsync();
    return isInternetReachable;
  };

  const checkExistingData = async () => {
    const dirInfo = await FileSystem.getInfoAsync(DATA_PATH);
    if (dirInfo.exists) {
      router.replace("/quran");
      return true;
    }
    return false;
  };

  const ensureDir = async (path) => {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  };

  const unzipAppData = async (zipPath) => {
    const zipBase64 = await FileSystem.readAsStringAsync(zipPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const zipBuffer = Buffer.from(zipBase64, "base64");
    const unzipped = unzipSync(zipBuffer);

    const firstEntry = Object.keys(unzipped)[0];
    let baseDir = DATA_PATH;

    if (firstEntry && firstEntry.startsWith("APP_DATA/")) {
      baseDir = FileSystem.documentDirectory;
    }

    for (const [filePath, fileData] of Object.entries(unzipped)) {
      const fullPath = `${baseDir}/${filePath}`;
      const isDirectory = filePath.endsWith("/");

      if (isDirectory) {
        await ensureDir(fullPath);
      } else {
        const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));
        await ensureDir(dirPath);
        const binary = Buffer.from(fileData).toString("utf8");
        await FileSystem.writeAsStringAsync(fullPath, binary);
      }
    }
  };

  const handleDownload = async () => {
    const isConnected = await checkInternet();
    if (!isConnected) {
      Alert.alert(
        "ডাউনলোড ব্যর্থ",
        "দয়া করে ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন",
        [
          { text: "আবার চেষ্টা করুন", onPress: handleDownload },
          { text: "বাতিল করুন", style: "cancel", onPress: exitApp },
        ]
      );
      return;
    }

    setDownloading(true);
    setShowDownloadModal(false);
    setProgress(0);
    setDownloadedSizeMB(0);

    try {
      setCurrentStep("ফাইল ডাউনলোড হচ্ছে...");
      await ensureDir(DATA_PATH);

      const downloadResumable = FileSystem.createDownloadResumable(
        ZIP_URL,
        ZIP_PATH,
        {},
        (downloadProgress) => {
          const written = downloadProgress.totalBytesWritten;
          const total = downloadProgress.totalBytesExpectedToWrite;
          const ratio = written / total;
          setProgress(ratio);
          setDownloadedSizeMB((written / (1024 * 1024)).toFixed(2));
          setTotalSizeMB((total / (1024 * 1024)).toFixed(2));
        }
      );

      await downloadResumable.downloadAsync();

      setCurrentStep("ফাইলগুলো প্রস্তুত হচ্ছে...");
      await unzipAppData(ZIP_PATH);

      setCurrentStep("সেটআপ সম্পন্ন হচ্ছে...");
      await AsyncStorage.setItem("reciter", "4");

      await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true });

      router.replace("/quran");
    } catch (error) {
      console.error("Download or unzip failed:", error);
      Alert.alert("ত্রুটি", "ডাউনলোড বা সেটআপে সমস্যা হয়েছে");

      try {
        await FileSystem.deleteAsync(DATA_PATH, { idempotent: true });
        await FileSystem.deleteAsync(ZIP_PATH, { idempotent: true });
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const hasData = await checkExistingData();
      if (!hasData) {
        setShowDownloadModal(true);
      }
    };

    initializeApp();
  }, []);

  if (downloading) {
    return (
      <View style={styles.downloadContainer}>
        <Text style={styles.title}>{currentStep}</Text>
        <Text style={styles.percentage}>
          {toBengaliNumber(Math.round(progress * 100))}%
        </Text>
        <Text style={styles.size}>
          ডাউনলোড: {toBengaliNumber(downloadedSizeMB)}/{toBengaliNumber(totalSizeMB)} MB
        </Text>
        <ActivityIndicator size="large" color="#138d75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={showDownloadModal}
        transparent
        animationType="fade"
        onRequestClose={exitApp}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ডাটাবেজ ফাইল ডাউনলোড</Text>
            <Text style={styles.modalText}>
              প্রথমবার ব্যবহারের জন্য কুরআনের ডাটাবেজ ডাউনলোড করতে হবে
            </Text>
            <Text style={styles.modalText}>
              প্রায় ({toBengaliNumber(2.39)} MB) ফাইলটি ডাউনলোড হবে
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleDownload}
              >
                <Text style={styles.buttonText}>ডাউনলোড করুন</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={exitApp}
              >
                <Text style={[styles.buttonText, { color: "#138d75" }]}>
                  পরে করব
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    marginBottom: 16,
    color: "#333333",
    textAlign: "center",
  },
  percentage: {
    fontSize: 26,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
    marginBottom: 8,
  },
  size: {
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#666666",
    marginBottom: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    marginBottom: 12,
    color: "#333333",
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#555555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonGroup: {
    width: "100%",
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#138d75",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#138d75",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
  },
});