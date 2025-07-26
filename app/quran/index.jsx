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
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LastHeader from "../../components/LastHeader";
import LastRead from "../../components/LastRead";
import SearchModal from "../../components/SearchModal";
import SuraItem from "../../components/SuraItem";
import SuraLoadingScreen from "../../components/SuraLoadingScreen";
import useSettingsStore from "../../store/settingsStore";

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
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Ionicons name="menu" size={24} color='#138d75' />
        </TouchableOpacity>
        
        <Text
          style={styles.headerTitle}
          onLongPress={() => setShowResetButton(!showResetButton)}
        >
          কুরআন বাংলা
        </Text>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={openSearchModal}
        >
          <Ionicons name="search" size={24} color='#138d75' />
        </TouchableOpacity>
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
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
  },
  iconButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});