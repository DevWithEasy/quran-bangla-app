import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import SuraItem from "../../components/SuraItem";
import SuraLoading from "../../components/SuraLoading";
import Database from "../../lib/database";

export default function Quran() {
  const router = useRouter();

  const [surahs, setSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [activeTab, setActiveTab] = useState("search"); // 'search' or 'goto'

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [ayahInput, setAyahInput] = useState("1");

  const [dataLoading, setDataLoading] = useState(true);

  // উক্তিগুলোর অ্যারেটি এখানে
  const [quotations] = useState([
    {
      text: "এই কিতাবে কোনো সন্দেহ নেই; এটি মুত্তাকীদের জন্য হিদায়াত।",
      source: "সূরা আল-বাকারা 2:2",
    },
    {
      text: "রমজান মাস, যাতে কুরআন নাযিল হয়েছে মানুষের জন্য হিদায়াতস্বরূপ।",
      source: "সূরা আল-বাকারা 2:185",
    },
    {
      text: "আমি কুরআনে নাযিল করি যা মুমিনদের জন্য শিফা ও রহমত।",
      source: "সূরা আল-ইসরা 17:82",
    },
    {
      text: "তোমাদের মধ্যে সেই ব্যক্তি সর্বোত্তম, যে কুরআন শিক্ষা করে এবং অন্যকে শিক্ষা দেয়।",
      source: "সহিহ বুখারি",
    },
    {
      text: "কুরআন পড়ো, কারণ কিয়ামতের দিন তা তার পাঠকের জন্য সুপারিশকারী হয়ে আসবে।",
      source: "সহিহ মুসলিম",
    },
  ]);

  // বর্তমান উক্তির ইনডেক্স
  const [currentQuotationIndex, setCurrentQuotationIndex] = useState(0);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const surahsData = await Database.getAllSurahs();

        if (surahsData && surahsData.length > 0) {
          const formattedSurahs = surahsData.map((surah) => ({
            serial: surah.id,
            name_ar: surah.name_ar,
            name_bn: surah.name_bn,
            name_en: surah.name_en,
            meaning_bn: surah.meaning_bn,
            total_ayah: surah.total_ayah,
            revelation_type: surah.revelation_type,
            id: surah.id,
          }));

          setSurahs(formattedSurahs);
          setSelectedSurah(formattedSurahs[0]);
        } else {
          throw new Error("No surahs found");
        }
      } catch (error) {
        Alert.alert("ত্রুটি", "সূরা লোড করতে সমস্যা হয়েছে");
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  /* ---------------- QUOTATION ROTATION ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuotationIndex((prevIndex) =>
        prevIndex === quotations.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000); // ৫ সেকেন্ড পরপর চেঞ্জ হবে

    return () => clearInterval(interval);
  }, [quotations.length]);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSurahs([]);
      return;
    }

    const filtered = surahs.filter(
      (s) =>
        s.name_bn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.meaning_bn?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setFilteredSurahs(filtered);
  }, [searchQuery, surahs]);

  /* -------- GO TO AYAH -------- */
  const handleGoToAyah = () => {
    if (!selectedSurah || !ayahInput) {
      Alert.alert("ত্রুটি", "সূরা ও আয়াত নির্বাচন করুন");
      return;
    }

    const ayahNumber = parseInt(ayahInput);
    const maxAyah = selectedSurah.total_ayah;

    if (isNaN(ayahNumber) || ayahNumber < 1 || ayahNumber > maxAyah) {
      Alert.alert(
        "ত্রুটি",
        `দয়া করে ১ থেকে ${maxAyah} এর মধ্যে আয়াত নম্বর লিখুন`,
      );
      return;
    }

    router.push({
      pathname: `/surah/${selectedSurah.serial}`,
      params: { ayah: ayahNumber },
    });
  };

  const list = searchQuery ? filteredSurahs : surahs;

  return (
    <View style={{ flex: 1, backgroundColor: '#138d75' }}>
      <StatusBar backgroundColor="#138d75" barStyle="light-content" />

      {/* -------- SURAH LIST -------- */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* -------- HERO SECTION -------- */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroTitle}>আল কুরআন</Text>

              {/* পরিবর্তনশীল উক্তি সেকশন */}
              <View style={styles.quotationContainer}>
                <Text style={styles.heroSub}>
                  &quot; {quotations[currentQuotationIndex].text} &quot;
                </Text>
                <Text style={styles.quotationSource}>
                  — {quotations[currentQuotationIndex].source}
                </Text>
              </View>

              {/* ডট ইন্ডিকেটর */}
              <View style={styles.indicatorContainer}>
                {quotations.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      currentQuotationIndex === index &&
                        styles.activeIndicatorDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* -------- TABS -------- */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "search" && styles.activeTab]}
              onPress={() => setActiveTab("search")}
            >
              <Ionicons
                name="search"
                size={20}
                color={activeTab === "search" ? "#138d75" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "search" && styles.activeTabText,
                ]}
              >
                সার্চ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "goto" && styles.activeTab]}
              onPress={() => setActiveTab("goto")}
            >
              <Ionicons
                name="navigate"
                size={20}
                color={activeTab === "goto" ? "#138d75" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "goto" && styles.activeTabText,
                ]}
              >
                Go to Ayah
              </Text>
            </TouchableOpacity>
          </View>

          {/* -------- SEARCH / GO TO CONTENT -------- */}
          <View style={styles.inputContainer}>
            {activeTab === "search" ? (
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="সূরা সার্চ করুন (বাংলা/ইংরেজি নাম বা অর্থ)"
                  placeholderTextColor="#666"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.gotoContainer}>
                {/* Surah Picker */}
                <View style={styles.pickerRow}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedSurah?.id}
                      onValueChange={(itemValue) => {
                        const findSura = surahs.find(
                          (s) => s?.id === itemValue,
                        );
                        setSelectedSurah(findSura);
                        setAyahInput("1");
                      }}
                      style={styles.picker}
                      dropdownIconColor="#666"
                    >
                      {surahs.map((surah) => (
                        <Picker.Item
                          key={surah.id}
                          label={`${surah.serial}. ${surah.name_bn}`}
                          value={surah.id}
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* Ayah Input */}
                  <View style={styles.ayahInputContainer}>
                    <Ionicons
                      name="book"
                      size={18}
                      color="#666"
                      style={styles.ayahIcon}
                    />
                    <TextInput
                      style={styles.ayahInput}
                      value={ayahInput}
                      onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, "");
                        const ayahNum = parseInt(numericText);
                        const maxAyah = selectedSurah?.total_ayah || 286;

                        if (numericText === "") {
                          setAyahInput("");
                        } else if (ayahNum > maxAyah) {
                          setAyahInput(maxAyah.toString());
                        } else {
                          setAyahInput(numericText);
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="আয়াত"
                      placeholderTextColor="#999"
                      maxLength={3}
                    />
                  </View>

                  {/* Go Button */}
                  <TouchableOpacity
                    style={styles.goButton}
                    onPress={handleGoToAyah}
                    disabled={!ayahInput}
                  >
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Ayah Range Info */}
                <Text style={styles.ayahInfo}>
                  {selectedSurah?.total_ayah}টি আয়াত (১-
                  {selectedSurah?.total_ayah})
                </Text>
              </View>
            )}
          </View>
        </View>
        {dataLoading ? (
          <SuraLoading />
        ) : (
          <View style={styles.listContainer}>
            {list.length === 0 && searchQuery ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={50} color="#ccc" />
                <Text style={styles.noResultsText}>কোন সূরা পাওয়া যায়নি</Text>
              </View>
            ) : (
              list.map((item) => <SuraItem key={item.id} item={item} />)
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  hero: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#138d75",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroHeader: {
    marginBottom: 20,
    paddingTop: 20,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontFamily: "banglaSemiBold",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 16,
  },
  quotationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  heroSub: {
    fontFamily: "banglaRegular",
    color: "white",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    fontStyle: "italic",
  },
  quotationSource: {
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontSize: 13,
    fontStyle: "italic",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  activeIndicatorDot: {
    backgroundColor: "white",
    width: 6,
    height: 6,
    borderRadius: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "banglaSemiBold",
    color: "rgba(255, 255, 255, 0.9)",
  },
  activeTabText: {
    color: "#138d75",
  },
  inputContainer: {
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "banglaRegular",
  },
  gotoContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickerWrapper: {
    flex: 3,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    height: 50,
  },
  picker: {
    height: 50,
    fontSize: 14,
    fontFamily: "banglaRegular",
  },
  ayahInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  ayahIcon: {
    marginRight: 8,
  },
  ayahInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#333",
    textAlign: "center",
  },
  goButton: {
    backgroundColor: "#138d75",
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ayahInfo: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    fontFamily: "banglaRegular",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  surahItemWrapper: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontFamily: "banglaRegular",
  },
});
