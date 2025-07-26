import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import NoSuraModal from "../../components/NoSuraModal";
import Player from "../../components/Player";

// File paths
const DATA_PATH = `${FileSystem.documentDirectory}APP_DATA`;
const SURAH_PATH = `${DATA_PATH}/surah.json`;
const RECITERS_PATH = `${DATA_PATH}/reciters.json`;

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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check if both files exist
        const [surahFileInfo, recitersFileInfo] = await Promise.all([
          FileSystem.getInfoAsync(SURAH_PATH),
          FileSystem.getInfoAsync(RECITERS_PATH)
        ]);

        if (!surahFileInfo.exists || !recitersFileInfo.exists) {
          Alert.alert(
            "ডাটা পাওয়া যায়নি",
            "অডিও ডাটা ডাউনলোড করা হয়নি, দয়া করে ডাউনলোড করুন",
            [
              {
                text: "ডাউনলোড পৃষ্ঠায় যান",
                onPress: () => router.replace("/download"),
              }
            ]
          );
          return;
        }

        // Load both files in parallel
        const [surahContent, recitersContent] = await Promise.all([
          FileSystem.readAsStringAsync(SURAH_PATH),
          FileSystem.readAsStringAsync(RECITERS_PATH)
        ]);

        const parsedSurahs = JSON.parse(surahContent);
        const parsedReciters = JSON.parse(recitersContent);

        if (Array.isArray(parsedSurahs) && Array.isArray(parsedReciters)) {
          setSurahs(parsedSurahs);
          setReciters(parsedReciters);
          
          // Set first reciter as default if available
          if (parsedReciters.length > 0) {
            setSelectedReciter(parsedReciters[0].id);
          }
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Database error:", error);
        Alert.alert(
          "ত্রুটি",
          "ডেটা লোড করতে সমস্যা হয়েছে",
          [
            {
              text: "পুনরায় চেষ্টা করুন",
              onPress: () => loadData(),
            },
            {
              text: "ডাউনলোড পৃষ্ঠায় যান",
              onPress: () => router.replace("/download"),
            }
          ]
        );
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

  const getAudioUri = (surah) =>
    `${FileSystem.documentDirectory}APP_DATA/audio/${selectedReciter}/${surah.serial}.mp3`;

  const playSurah = async (surah) => {
    try {
      const audioUri = getAudioUri(surah);
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
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
        }
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

    const nextSurahIndex = surahs.findIndex((s) => s.serial === currentSurah.serial) + 1;
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
    }
  };

  const handlePrevious = async () => {
    if (!currentSurah) return;

    const prevSurahIndex = surahs.findIndex((s) => s.serial === currentSurah.serial) - 1;
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
      await playSurah(downloadingSurah);
      setModalVisible(false);
      setDownloadingSurah(null);
    }
  };

  const onDownloadCancelled = () => {
    setModalVisible(false);
    setDownloadingSurah(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#138d75" />
        <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (!reciters.length || !surahs.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>ডাটা লোড করতে ব্যর্থ হয়েছে</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/download")}
        >
          <Text style={styles.retryButtonText}>ডাউনলোড পৃষ্ঠায় যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Reciter Selection */}
      <View style={styles.reciterContainer}>
        <Text style={styles.sectionTitle}>ক্বারী নির্বাচন:</Text>
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
                {reciter.name}
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
              style={styles.surahItem}
              onPress={() => playSurah(item)}
            >
              <View style={styles.surahNumber}>
                <Text style={styles.surahNumberText}>{toBengaliNumber(item.serial)}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{item.name_bn}</Text>
                <Text style={styles.surahDetails}>
                  আয়াত: {toBengaliNumber(item.total_ayah)} | {item.type} | {item.meaning_bn}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => playSurah(item)}
                style={styles.playButton}
              >
                <Ionicons
                  name={
                    isCurrent
                      ? playerStatus.isPlaying
                        ? "pause"
                        : "play"
                      : "play"
                  }
                  size={24}
                  color="#138d75"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: playerVisible ? 100 : 20 },
        ]}
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
    </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#333",
  },
  errorText: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#138d75",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "banglaSemiBold",
    fontSize: 16,
  },
  reciterContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginBottom: 12,
    color: "#2c3e50",
  },
  reciterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reciterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    width: "48%",
  },
  selectedReciter: {
    backgroundColor: "#138d75",
  },
  reciterText: {
    fontFamily: "banglaRegular",
    fontSize: 14,
    color: "#333",
  },
  selectedReciterText: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  surahItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#138d75",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  surahNumberText: {
    color: "white",
    fontFamily: "banglaSemiBold",
    fontSize: 16,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontFamily: "banglaSemiBold",
    fontSize: 16,
    color: "#2c3e50",
  },
  surahDetails: {
    fontFamily: "banglaRegular",
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  playButton: {
    padding: 8,
  },
});