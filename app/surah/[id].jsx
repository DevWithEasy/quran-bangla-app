import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AyahItem from "../../components/AyahItem";
import AyahLoadingScreen from "../../components/AyahLoadingScreen";
import NoSuraModal from "../../components/NoSuraModal";
import QuranHeader from "../../components/QuranHeader";
import SuraInfo from "../../components/SuraInfo";
import {
  checkFileExist,
  getFilePath,
  getTiming,
} from "../../utils/audioControllers";

export default function SurahScreen() {
  const { id, surahData } = useLocalSearchParams();
  const surahItem = surahData ? JSON.parse(surahData) : null;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [reciter, setReciter] = useState(null);
  const [sound, setSound] = useState(null);
  const [currentAyahId, setCurrentAyahId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load reciter from AsyncStorage
        const savedReciter = await AsyncStorage.getItem("reciter");
        setReciter(savedReciter ? parseInt(savedReciter) : 4);
        
        // Load ayah data for this surah
        const ayahFilePath = `${FileSystem.documentDirectory}APP_DATA/ayah/surah_${id}.json`;
        const fileInfo = await FileSystem.getInfoAsync(ayahFilePath);
        
        if (!fileInfo.exists) {
          throw new Error("Ayah data not found");
        }

        const ayahContent = await FileSystem.readAsStringAsync(ayahFilePath);
        const parsedAyahs = JSON.parse(ayahContent);
        
        if (Array.isArray(parsedAyahs)) {
          setAyahs(parsedAyahs);
        } else {
          throw new Error("Invalid ayah data format");
        }
      } catch (error) {
        console.error("DB error:", error);
        Alert.alert("ত্রুটি", "আয়াত ডাটা লোড করতে ব্যর্থ");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      // Clean up audio when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setCurrentAyahId(null);
      } catch (err) {
        console.error("Error stopping audio:", err);
      }
    }
  };

  const playAyah = async (ayah) => {
    try {
      // If same ayah is playing, stop it
      if (currentAyahId === ayah.id && isPlaying) {
        await stopAudio();
        return;
      }

      const exist = await checkFileExist(ayah.surah_id, reciter);
      if (!exist) {
        setModalVisible(true);
        return;
      }

      await stopAudio(); // Stop previous audio

      const audioPath = await getFilePath(ayah.surah_id, reciter);
      const timings = await getTiming(ayah.surah_id, reciter);

      const currentAyah = timings.find((item) => item.ayah === ayah.ayah_id);
      const nextAyah = timings.find((item) => item.ayah === ayah.ayah_id + 1);

      const startTime = currentAyah.time;
      const endTime = nextAyah ? nextAyah.time : null;

      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: false }
      );
      setSound(newSound);

      await newSound.setPositionAsync(startTime);
      await newSound.playAsync();

      setIsPlaying(true);
      setCurrentAyahId(ayah.id);

      if (endTime) {
        const duration = endTime - startTime;
        setTimeout(async () => {
          if (newSound) {
            try {
              await newSound.pauseAsync();
              setIsPlaying(false);
              setCurrentAyahId(null);
            } catch (error) {
              console.log("Pause error:", error);
            }
          }
        }, duration);
      }
    } catch (error) {
      console.error("Error playing ayah:", error);
    }
  };

  const onDownloadComplete = async () => {
    setModalVisible(false);
  };

  const onDownloadCancelled = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuranHeader name={surahItem.name_bn} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 0,
          paddingTop: 0,
          backgroundColor: "#ffffff",
        }}
        style={{ flex: 1 }}
      >
        <SuraInfo sura={surahItem} />
        
        {loading ? (
          <AyahLoadingScreen surah={surahItem} />
        ) : (
          <>
            {surahItem.serial > 1 && (
              <Text style={styles.bismillah}>
                بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
              </Text>
            )}

            {/* Ayah List */}
            {ayahs.map((ayah) => (
              <AyahItem
                key={ayah.id}
                ayah={ayah}
                surah={surahItem}
                onPlay={playAyah}
                isPlaying={currentAyahId === ayah.id && isPlaying}
                stopAudio={stopAudio}
              />
            ))}

            {/* No sura modal */}
            <NoSuraModal
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
              surahId={surahItem.serial}
              reciter={reciter}
              onDownloadCancelled={onDownloadCancelled}
              onDownloadComplete={onDownloadComplete}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "banglaRegular",
  },
  bismillah: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: "me-quran",
    marginVertical: 16,
    color: "#333",
  },
});