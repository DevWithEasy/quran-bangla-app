import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AyahItem from "../../components/AyahItem";
import AyahLoadingScreen from "../../components/AyahLoadingScreen";
import NoSuraModal from "../../components/NoSuraModal";
import QuranHeader from "../../components/QuranHeader";
import SuraInfo from "../../components/SuraInfo";
import {
  checkAudioFileExist,
  getFilePath,
  getTiming,
} from "../../utils/audioControllers";
import DbService from "../../lib/dbService";

const MemoizedAyahItem = memo(AyahItem);

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
        
        // ডাটাবেজ ইনিশিয়ালাইজেশন নিশ্চিত করুন
        await DbService.initialize();
        
        const savedReciter = await AsyncStorage.getItem("reciter");
        setReciter(savedReciter ? parseInt(savedReciter) : 4);

        // ডাটাবেজ থেকে আয়াত লোড করুন
        const findAyahs = await DbService.getAyahs(parseInt(id));
        
        // যদি আয়াত না পাওয়া যায়
        if (!findAyahs || findAyahs.length === 0) {
          Alert.alert(
            "তথ্য নেই", 
            "এই সূরার আয়াত খুঁজে পাওয়া যায়নি।"
          );
        }
        
        setAyahs(findAyahs || []);

      } catch (error) {
        console.error("DB error:", error);
        
        // বিস্তারিত এরর মেসেজ
        let errorMessage = "আয়াত ডাটা লোড করতে ব্যর্থ হয়েছে।";
        
        if (error.message.includes('no such table')) {
          errorMessage = "ডাটাবেজ টেবিল খুঁজে পাওয়া যায়নি। অ্যাপ রিস্টার্ট করুন।";
        } else if (error.message.includes('no such column')) {
          errorMessage = "ডাটাবেজের কাঠামোতে সমস্যা আছে। অ্যাপ রিস্টার্ট করুন।";
        } else if (error.message.includes('database not initialized')) {
          errorMessage = "ডাটাবেজ ইনিশিয়ালাইজ হয়নি। ইন্টারনেট সংযোগ চেক করুন।";
        }
        
        Alert.alert("ত্রুটি", errorMessage);
        
        // খালি অ্যারে সেট করুন যাতে ক্র্যাশ না হয়
        setAyahs([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const stopAudio = useCallback(async () => {
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
  }, [sound]);

  const playAyah = useCallback(async (surah_id, ayah) => {
    try {
      // যদি একই আয়াত বাজছে এবং প্লেয়িং হয়, তাহলে স্টপ করুন
      if (currentAyahId === ayah.id && isPlaying) {
        await stopAudio();
        return;
      }

      // অডিও ফাইল চেক করুন
      const exist = await checkAudioFileExist(reciter, surah_id);
      if (!exist) {
        setModalVisible(true);
        return;
      }

      // আগের অডিও বন্ধ করুন
      await stopAudio();

      // অডিও পাথ এবং টাইমিং ডাটা লোড করুন
      const audioPath = await getFilePath(reciter, surah_id);
      const timings = await getTiming(reciter, surah_id);

      // বর্তমান এবং পরবর্তী আয়াতের টাইমিং খুঁজুন
      const currentAyah = timings.find((item) => item.ayah === ayah.ayah_number);
      const nextAyah = timings.find((item) => item.ayah === ayah.ayah_number + 1);

      if (!currentAyah) {
        Alert.alert("ত্রুটি", "এই আয়াতের অডিও টাইমিং পাওয়া যায়নি।");
        return;
      }

      const startTime = currentAyah.time;
      const endTime = nextAyah ? nextAyah.time : null;

      // অডিও প্লে করুন
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: false }
      );
      setSound(newSound);

      // নির্দিষ্ট সময় থেকে শুরু করুন
      await newSound.setPositionAsync(startTime);
      await newSound.playAsync();

      setIsPlaying(true);
      setCurrentAyahId(ayah.id);

      // পরবর্তী আয়াতের শুরুতে অডিও বন্ধ করুন
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
      Alert.alert("ত্রুটি", "অডিও প্লে করতে ব্যর্থ হয়েছে।");
    }
  }, [reciter, currentAyahId, isPlaying, stopAudio]);

  const onDownloadComplete = async () => {
    setModalVisible(false);
    Alert.alert("সফল", "অডিও ডাউনলোড সম্পন্ন হয়েছে।");
  };

  const onDownloadCancelled = () => {
    setModalVisible(false);
    Alert.alert("বাতিল", "অডিও ডাউনলোড বাতিল করা হয়েছে।");
  };

  const renderAyahItem = useCallback(({ item }) => (
    <MemoizedAyahItem
      ayah={item}
      surah={surahItem}
      onPlay={playAyah}
      isPlaying={currentAyahId === item.id && isPlaying}
      stopAudio={stopAudio}
    />
  ), [surahItem, playAyah, currentAyahId, isPlaying, stopAudio]);

  const ListHeaderComponent = useCallback(() => (
    <>
      <SuraInfo sura={surahItem} />
      {surahItem.id > 1 && (
        <Text style={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
        </Text>
      )}
    </>
  ), [surahItem]);

  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>এই সূরার কোনো আয়াত পাওয়া যায়নি।</Text>
      <Text style={styles.emptySubText}>দয়া করে অ্যাপ রিস্টার্ট করুন বা ইন্টারনেট সংযোগ চেক করুন।</Text>
    </View>
  ), []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <QuranHeader name={surahItem?.name_bn || "সূরা"} />
        <AyahLoadingScreen surah={surahItem} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#138d75' }}>
      <QuranHeader name={surahItem?.name_bn || "সূরা"} />

      <FlatList
        data={ayahs}
        renderItem={renderAyahItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      <NoSuraModal
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        surahId={surahItem?.id || 1}
        reciter={reciter}
        onDownloadCancelled={onDownloadCancelled}
        onDownloadComplete={onDownloadComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    textAlign: "center",
    color: "#999",
  },
  bismillah: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: "me-quran",
    marginVertical: 16,
    color: "#2c3e50",
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
});