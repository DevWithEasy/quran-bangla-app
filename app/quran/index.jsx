import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LastRead from "../../components/LastRead";
import SearchModal from "../../components/SearchModal";
import SuraItem from "../../components/SuraItem";
import SuraLoadingScreen from "../../components/SuraLoadingScreen";
import useSettingsStore from "../../store/settingsStore";
import LastHeader from "../../components/LastHeader";

const SURAH_PATH = `${FileSystem.documentDirectory}APP_DATA/surah.json`;

export default function Quran() {
  const {lastSura} = useSettingsStore();
  const navigation = useNavigation();
  const router = useRouter();
  const [surahs, setSurahs] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showResetButton, setShowResetButton] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(SURAH_PATH);
        
        if (!fileInfo.exists) {
          Alert.alert(
            "ডাটা পাওয়া যায়নি",
            "সূরার ডাটা ডাউনলোড করা হয়নি, দয়া করে ডাউনলোড করুন",
            [
              {
                text: "ডাউনলোড করুন",
                onPress: () => router.replace("/download"),
              }
            ]
          );
          return;
        }

        // Read the file
        const fileContent = await FileSystem.readAsStringAsync(SURAH_PATH);
        const parsedData = JSON.parse(fileContent);
        
        if (Array.isArray(parsedData)) {
          setSurahs(parsedData);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("DB error:", error);
        Alert.alert(
          "ত্রুটি",
          "সূরার তালিকা লোড করতে ব্যর্থ",
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
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSurahs([]);
      return;
    }

    const filtered = surahs.filter(
      (surah) =>
        surah.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.meaning_bn.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSurahs(filtered);
  }, [searchQuery, surahs]);

  const openSearchModal = () => {
    setSearchModalVisible(true);
  };

  const closeSearchModal = () => {
    setSearchQuery("");
    setSearchModalVisible(false);
    Keyboard.dismiss();
  };

  if (dataLoading) {
    return <SuraLoadingScreen />;
  }
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Ionicons 
          name="menu" 
          size={24} 
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} 
          color='#138d75'
        />
        <Text
          style={styles.headerTitle}
          onLongPress={() => setShowResetButton(!showResetButton)}
        >
          কুরআন বাংলা
        </Text>
        <Ionicons 
          name="search" 
          size={24} 
          onPress={openSearchModal} 
          color='#138d75'
        />
      </View>

      <ScrollView style={styles.container}>
        {!lastSura ? <LastHeader/> :  <LastRead surah = {lastSura}/>}
        {surahs.map((item) => (
          <SuraItem key={item.serial} item={item} />
        ))}
      </ScrollView>

      <SearchModal
        searchModalVisible={searchModalVisible}
        closeSearchModal={closeSearchModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredSurahs={filteredSurahs}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'banglaRegular',
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'banglaSemiBold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#138d75',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'banglaSemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontFamily: 'banglaRegular',
  },
  closeButton: {
    marginLeft: 10,
    color: '#138d75',
    fontFamily: 'banglaSemiBold',
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  surahName: {
    fontFamily: 'banglaSemiBold',
    fontSize: 18,
    color: '#333',
  },
  surahMeaning: {
    fontFamily: 'banglaRegular',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});