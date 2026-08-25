import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import NoSuraModal from "../../components/NoSuraModal";
import Player from "../../components/Player";
import DbService from "../../lib/dbService";

// File paths
const DATA_PATH = `${FileSystem.documentDirectory}APP_DATA`;

export default function AudioBook() {
  const router = useRouter();
  const [surahs, setSurahs] = useState([]);
  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReciter, setSelectedReciter] = useState(null);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [playerStatus, setPlayerStatus] = useState({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
  });
  const [playerVisible, setPlayerVisible] = useState(false);
  const [downloadingSurah, setDownloadingSurah] = useState(null);
  const soundRef = useRef(null);

  // Data structure formatting helper
  const formatSurahsData = (surahsData) => {
    if (!surahsData || !Array.isArray(surahsData)) return [];

    return surahsData.map((surah) => ({
      serial: surah.id,
      name_ar: surah.name_ar,
      name_bn: surah.name_bn,
      name_en: surah.name_en,
      meaning_bn: surah.meaning_bn,
      total_ayah: surah.total_ayah,
      revelation_type: surah.revelation_type,
      type: surah.revelation_type === "Meccan" ? "মাক্কী" : "মাদানী",
      id: surah.id,
    }));
  };

  // Format reciters data
  const formatRecitersData = (recitersData) => {
    if (!recitersData || !Array.isArray(recitersData)) return [];

    return recitersData.map((reciter) => ({
      id: reciter.id,
      name: reciter.name,
      name_bn: reciter.name_bn || reciter.name,
      style: reciter.style || "",
      // Add any other fields you need
    }));
  };

  // Find reciter by ID
  const getReciterById = (id) => {
    return reciters.find((r) => r.id === id) || reciters[0];
  };

  // Get current reciter name
  const getCurrentReciterName = () => {
    const reciter = getReciterById(selectedReciter);
    return reciter?.name_bn || reciter?.name || "ক্বারী";
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        console.log("Loading surahs and reciters from database...");

        // ডাটাবেজ থেকে সূরা লোড করুন
        const surahsData = await DbService.getAllSurahs();

        // ডাটাবেজ থেকে ক্বারী লোড করুন
        const recitersData = await DbService.getAllReciters();

        if (surahsData && surahsData.length > 0) {
          const formattedSurahs = formatSurahsData(surahsData);
          setSurahs(formattedSurahs);
        } else {
          throw new Error("ডাটাবেজে কোন সূরা পাওয়া যায়নি");
        }

        if (recitersData && recitersData.length > 0) {
          const formattedReciters = formatRecitersData(recitersData);
          setReciters(formattedReciters);
          // প্রথম ক্বারীকে ডিফল্ট হিসেবে সেট করুন
          setSelectedReciter(formattedReciters[0].id);
        } else {
          throw new Error("ডাটাবেজে কোন ক্বারী পাওয়া যায়নি");
        }
      } catch (error) {
        console.error("Database error:", error);
        Alert.alert("ত্রুটি", "ডেটা লোড করতে সমস্যা হয়েছে", [
          {
            text: "পুনরায় চেষ্টা করুন",
            onPress: () => loadData(),
          },
          {
            text: "ডাউনলোড পৃষ্ঠায় যান",
            onPress: () => router.replace("/"),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const getAudioUri = (surah) => {
    if (!selectedReciter) return "";
    return `${DATA_PATH}/audio_quran/${selectedReciter}/${surah.serial}.mp3`;
  };

  const playSurah = async (surah) => {
    try {
      // Check if reciter is selected
      if (!selectedReciter) {
        Toast.show({
          type: "info",
          text1: "ক্বারী নির্বাচন করুন",
          text2: "অডিও শোনার আগে একজন ক্বারী নির্বাচন করুন",
          visibilityTime: 3000,
        });
        return;
      }

      const audioUri = getAudioUri(surah);
      console.log(`Playing: ${audioUri}`);

      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
        console.log(`Audio file not found for surah ${surah.serial}`);
        setModalVisible(true);
        setCurrentSurah(null);
        setPlayerVisible(false);
        setDownloadingSurah(surah);
        return;
      }

      setCurrentSurah(surah);
      setPlayerVisible(true);
      setModalVisible(false);
      setDownloadingSurah(null);

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (playbackStatus) => {
          if (!playbackStatus.isLoaded) {
            if (playbackStatus.error) {
              console.error("Playback error:", playbackStatus.error);
            }
            return;
          }
          setPlayerStatus({
            isPlaying: playbackStatus.isPlaying,
            positionMillis: playbackStatus.positionMillis,
            durationMillis: playbackStatus.durationMillis || 0,
          });

          if (playbackStatus.didJustFinish) {
            setPlayerStatus((prev) => ({ ...prev, isPlaying: false }));
          }
        },
      );

      soundRef.current = newSound;
    } catch (error) {
      console.error("Playback error:", error);
      Toast.show({
        type: "error",
        text1: "সমস্যা হচ্ছে",
        text2: "অডিও প্লে করতে সমস্যা হয়েছে 👋",
        visibilityTime: 3000,
      });
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (playerStatus.isPlaying) {
      await soundRef.current.pauseAsync();
      setPlayerStatus((prev) => ({ ...prev, isPlaying: false }));
    } else {
      await soundRef.current.playAsync();
      setPlayerStatus((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const handleNext = async () => {
    if (!currentSurah) return;

    const nextSurahIndex =
      surahs.findIndex((s) => s.serial === currentSurah.serial) + 1;
    if (nextSurahIndex < surahs.length) {
      const nextSurah = surahs[nextSurahIndex];
      const audioUri = getAudioUri(nextSurah);
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
        setModalVisible(true);
        setCurrentSurah(null);
        setPlayerVisible(false);
        setDownloadingSurah(nextSurah);
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        return;
      }

      await playSurah(nextSurah);
    } else {
      Toast.show({
        type: "info",
        text1: "শেষ সূরা",
        text2: "এটিই শেষ সূরা",
        visibilityTime: 2000,
      });
    }
  };

  const handlePrevious = async () => {
    if (!currentSurah) return;

    const prevSurahIndex =
      surahs.findIndex((s) => s.serial === currentSurah.serial) - 1;
    if (prevSurahIndex >= 0) {
      const prevSurah = surahs[prevSurahIndex];
      const audioUri = getAudioUri(prevSurah);
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
        setModalVisible(true);
        setCurrentSurah(null);
        setPlayerVisible(false);
        setDownloadingSurah(prevSurah);
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        return;
      }

      await playSurah(prevSurah);
    } else {
      Toast.show({
        type: "info",
        text1: "প্রথম সূরা",
        text2: "এটিই প্রথম সূরা",
        visibilityTime: 2000,
      });
    }
  };

  const handleSeek = async (value) => {
    if (!soundRef.current) return;

    await soundRef.current.setPositionAsync(value);
    setPlayerStatus((prev) => ({
      ...prev,
      positionMillis: value,
    }));
  };

  const closePlayer = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    } finally {
      setPlayerVisible(false);
      setCurrentSurah(null);
      setPlayerStatus({
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 0,
      });
    }
  };

  const onDownloadComplete = async () => {
    if (downloadingSurah) {
      Toast.show({
        type: "success",
        text1: "ডাউনলোড সম্পন্ন",
        text2: "অডিওটি এখন প্লে করা যাবে",
        visibilityTime: 2000,
      });
      await playSurah(downloadingSurah);
      setModalVisible(false);
      setDownloadingSurah(null);
    }
  };

  const onDownloadCancelled = () => {
    Toast.show({
      type: "info",
      text1: "ডাউনলোড বাতিল",
      text2: "অডিও ডাউনলোড বাতিল করা হয়েছে",
      visibilityTime: 2000,
    });
    setModalVisible(false);
    setDownloadingSurah(null);
  };

  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.log("Audio mode setup error:", e);
      }
    }

    async function loadData() {
      try {
        setLoading(true);
        console.log("Loading surahs and reciters from database...");

        const surahsData = await DbService.getAllSurahs();
        const recitersData = await DbService.getAllReciters();

        if (surahsData && surahsData.length > 0) {
          const formattedSurahs = formatSurahsData(surahsData);
          setSurahs(formattedSurahs);
        } else {
          throw new Error("ডাটাবেজে কোন সূরা পাওয়া যায়নি");
        }

        if (recitersData && recitersData.length > 0) {
          const formattedReciters = formatRecitersData(recitersData);
          setReciters(formattedReciters);
          setSelectedReciter(formattedReciters[0].id);
        } else {
          throw new Error("ডাটাবেজে কোন ক্বারী পাওয়া যায়নি");
        }
      } catch (error) {
        console.error("Database error:", error);
        Alert.alert("ত্রুটি", "ডেটা লোড করতে সমস্যা হয়েছে", [
          {
            text: "পুনরায় চেষ্টা করুন",
            onPress: () => loadData(),
          },
          {
            text: "ডাউনলোড পৃষ্ঠায় যান",
            onPress: () => router.replace("/"),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    setupAudio();
    loadData();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#138d75" />
          <Text style={styles.loadingText}>সূরা এবং ক্বারী লোড হচ্ছে...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reciters.length || !surahs.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>ডাটা লোড করতে ব্যর্থ হয়েছে</Text>
          <Text style={styles.errorSubText}>
            ডাটাবেজে সূরা অথবা ক্বারীর তথ্য পাওয়া যায়নি
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace("/download")}
          >
            <Text style={styles.retryButtonText}>ডাউনলোড পৃষ্ঠায় যান</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: "#3498db", marginTop: 12 },
            ]}
            onPress={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            }}
          >
            <Text style={styles.retryButtonText}>পুনরায় চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Reciter Selection */}
      <View style={styles.reciterContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={20} color="#2c3e50" />
          <Text style={styles.sectionTitle}>ক্বারী নির্বাচন করুন:</Text>
        </View>
        <View style={styles.reciterList}>
          {reciters.map((reciter) => (
            <TouchableOpacity
              key={reciter.id}
              style={[
                styles.reciterButton,
                selectedReciter === reciter.id && styles.selectedReciter,
              ]}
              onPress={() => {
                setSelectedReciter(reciter.id);
                setCurrentSurah(null);
                setPlayerVisible(false);
                if (soundRef.current) {
                  soundRef.current.unloadAsync();
                  soundRef.current = null;
                }
              }}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.reciterText,
                  selectedReciter === reciter.id && styles.selectedReciterText,
                ]}
              >
                {reciter.name_bn || reciter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Surah List */}
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.serial.toString()}
        renderItem={({ item }) => {
          const isCurrent = currentSurah?.serial === item.serial;

          return (
            <TouchableOpacity
              style={[styles.surahItem, isCurrent && styles.currentSurahItem]}
              onPress={() => playSurah(item)}
            >
              <View style={styles.surahNumber}>
                <Text style={styles.surahNumberText}>
                  {toBengaliNumber(item.serial)}
                </Text>
              </View>
              <View style={styles.surahInfo}>
                <View style={styles.surahNameContainer}>
                  <Text style={styles.surahName}>{item.name_bn}</Text>
                  <Text style={styles.surahNameAr}>{item.name_ar}</Text>
                </View>
                <Text style={styles.surahDetails}>
                  আয়াত: {toBengaliNumber(item.total_ayah)} | {item.type} |{" "}
                  {item.meaning_bn}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => playSurah(item)}
                style={styles.playButton}
              >
                <Ionicons
                  name={
                    isCurrent && playerStatus.isPlaying
                      ? "pause-circle"
                      : "play-circle"
                  }
                  size={32}
                  color={isCurrent ? "#138d75" : "#7f8c8d"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: playerVisible ? 160 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      {/* No sura modal */}
      <NoSuraModal
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        surahId={downloadingSurah ? downloadingSurah.serial : null}
        reciter={selectedReciter}
        onDownloadComplete={onDownloadComplete}
        onDownloadCancelled={onDownloadCancelled}
      />

      {/* Audio Player */}
      {playerVisible && currentSurah && (
        <Player
          currentSurah={currentSurah}
          reciters={reciters}
          selectedReciter={selectedReciter}
          togglePlayPause={togglePlayPause}
          playerStatus={playerStatus}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSeek={handleSeek}
          onClose={closePlayer}
        />
      )}

      {/* Toast notification */}
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#138d75",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#bebebe",
  },
  settingsButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#333",
  },
  errorText: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    color: "#e74c3c",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#138d75",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "banglaSemiBold",
    fontSize: 16,
  },
  reciterContainer: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginLeft: 8,
    color: "#2c3e50",
  },
  reciterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reciterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#ecf0f1",
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedReciter: {
    backgroundColor: "#138d75",
    borderColor: "#138d75",
  },
  reciterText: {
    fontFamily: "banglaRegular",
    fontSize: 14,
    color: "#333",
  },
  selectedReciterText: {
    color: "#fff",
    fontFamily: "banglaSemiBold",
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  surahItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentSurahItem: {
    backgroundColor: "#e8f6f3",
    borderWidth: 1,
    borderColor: "#138d75",
  },
  surahNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#138d75",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  surahNumberText: {
    color: "white",
    fontFamily: "banglaSemiBold",
    fontSize: 18,
  },
  surahInfo: {
    flex: 1,
  },
  surahNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  surahName: {
    fontFamily: "banglaSemiBold",
    fontSize: 16,
    color: "#2c3e50",
    marginRight: 12,
  },
  surahNameAr: {
    fontFamily: "arabicRegular",
    fontSize: 18,
    color: "#138d75",
  },
  surahDetails: {
    fontFamily: "banglaRegular",
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  playButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
});
