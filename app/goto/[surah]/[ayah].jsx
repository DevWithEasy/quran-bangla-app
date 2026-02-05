import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ShareImageModal from "../../../components/ShareImageModal";
import DbService from "../../../lib/dbService";
import useSettingsStore from "../../../store/settingsStore";

const { width } = Dimensions.get("window");

export default function GotoAyah() {
  const { arabicFont, arabicFontSize, banglaFontSize, translator } =
    useSettingsStore();
  const { surah, ayah, surahData } = useLocalSearchParams();
  const navigation = useNavigation();
  const [ayahData, setAyahData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState("bn_muhi");
  const [shareImageModalVisible, setShareImageModalVisible] = useState(false);

  const surahItem = surahData ? JSON.parse(surahData) : null;

  useEffect(() => {
    if (surahItem?.name_bn) {
      navigation.setOptions({
        headerTitle: `${surahItem.name_bn} - আয়াত ${toBengaliNumber(ayah)}`,
      });
    }
  }, [navigation, surahItem, ayah]);

  useEffect(() => {
    const loadAyah = async () => {
      try {
        setLoading(true);
        const data = await DbService.getAyah(parseInt(surah), parseInt(ayah));

        // Find the specific ayah
        const specificAyah = data.find(
          (item) => item.ayah_number === parseInt(ayah),
        );
        setAyahData(specificAyah);
      } catch (error) {
        console.error("Error loading ayah:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAyah();
  }, [surah, ayah]);

  const getAyahText = () => {
    if (!ayahData) return "";

    switch (selectedTranslation) {
      case "bn_haque":
        return ayahData.text_bn_haque;
      case "bn_muhi":
        return ayahData.text_bn_muhi;
      case "en":
        return ayahData.text_en;
      default:
        return ayahData.text_bn_haque;
    }
  };

  const getTranslationName = () => {
    switch (selectedTranslation) {
      case "bn_haque":
        return "ড. আবু বকর মুহাম্মাদ যাকারিয়া (হক)";
      case "bn_muhi":
        return "মুহিউদ্দীন খান";
      case "en":
        return "English Translation";
      default:
        return "";
    }
  };

  const handleShare = () => {
    setShareImageModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (!ayahData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>আয়াত পাওয়া যায়নি</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.surahName}>
            {surahItem?.name_bn} - সূরা নং {toBengaliNumber(surahItem?.serial)}
          </Text>
          <Text style={styles.ayahNumber}>
            আয়াত নং: {toBengaliNumber(ayah)}
          </Text>
        </View>

        {/* Arabic Text */}
        <View style={styles.arabicContainer}>
          <Text style={styles.arabicText}>{ayahData.text_ar}</Text>
          <Text style={styles.arabicInfo}>(আরবি)</Text>
        </View>

        {/* Translation Selector */}
        <View style={styles.translationSelector}>
          <TouchableOpacity
            style={[
              styles.translationTab,
              selectedTranslation === "bn_haque" && styles.activeTab,
            ]}
            onPress={() => setSelectedTranslation("bn_haque")}
          >
            <Text
              style={[
                styles.translationTabText,
                selectedTranslation === "bn_haque" && styles.activeTabText,
              ]}
            >
              হক
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.translationTab,
              selectedTranslation === "bn_muhi" && styles.activeTab,
            ]}
            onPress={() => setSelectedTranslation("bn_muhi")}
          >
            <Text
              style={[
                styles.translationTabText,
                selectedTranslation === "bn_muhi" && styles.activeTabText,
              ]}
            >
              মুহি
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.translationTab,
              selectedTranslation === "en" && styles.activeTab,
            ]}
            onPress={() => setSelectedTranslation("en")}
          >
            <Text
              style={[
                styles.translationTabText,
                selectedTranslation === "en" && styles.activeTabText,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>

        {/* Translation Text */}
        <View style={styles.translationContainer}>
          <Text style={styles.translationText}>{getAyahText()}</Text>
          <Text style={styles.translationInfo}>{getTranslationName()}</Text>
        </View>

        {/* Transliteration */}
        <View style={styles.transliterationContainer}>
          <Text style={styles.transliterationText}>{ayahData.text_tr}</Text>
          <Text style={styles.transliterationInfo}>(উচ্চারণ)</Text>
        </View>

        {/* Share Button Section */}
        <View style={styles.shareContainer}>
          <Text style={styles.shareHint}>এই আয়াতটি শেয়ার করুন</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="white" />
            <Text style={styles.shareButtonText}>ইমেজ শেয়ার করুন</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation to previous/next ayah */}
        <View style={styles.navigationContainer}>
          {parseInt(ayah) > 1 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                navigation.setParams({
                  ayah: parseInt(ayah) - 1,
                });
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#138d75" />
              <Text style={styles.navButtonText}>
                পূর্বের আয়াত {toBengaliNumber(parseInt(ayah) - 1)}
              </Text>
            </TouchableOpacity>
          )}

          {parseInt(ayah) < surahItem?.total_ayah && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={() => {
                navigation.setParams({
                  ayah: parseInt(ayah) + 1,
                });
              }}
            >
              <Text style={styles.navButtonText}>
                পরের আয়াত {toBengaliNumber(parseInt(ayah) + 1)}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#138d75" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Share Image Modal */}
      <ShareImageModal
        visible={shareImageModalVisible}
        onClose={() => setShareImageModalVisible(false)}
        surah={surahItem}
        ayah={ayahData}
        arabicFont={arabicFont}
        arabicFontSize={arabicFontSize}
        banglaFontSize={banglaFontSize}
        translator={translator}
        selectedTranslation={selectedTranslation}
        translationText={getAyahText()}
        translationName={getTranslationName()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    fontFamily: "banglaRegular",
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    fontFamily: "banglaRegular",
    color: "#e74c3c",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  surahName: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
    textAlign: "center",
  },
  ayahNumber: {
    fontFamily: "banglaRegular",
    color: "#666",
  },
  arabicContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    borderRightWidth: 3,
    borderRightColor: "#138d75",
  },
  arabicText: {
    fontSize: 22,
    fontFamily: "me-quran",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 45,
  },
  arabicInfo: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
    marginTop: 10,
  },
  translationSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    backgroundColor: "#f1f2f6",
    borderRadius: 10,
    padding: 5,
  },
  translationTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#138d75",
  },
  translationTabText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontFamily: "banglaSemiBold",
  },
  translationContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  translationText: {
    fontFamily: "banglaRegular",
    color: "#2c3e50",
    lineHeight: 22,
    textAlign: "justify",
  },
  translationInfo: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
    marginTop: 15,
    fontStyle: "italic",
  },
  transliterationContainer: {
    backgroundColor: "#fff8e1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 25,
    borderLeftWidth: 3,
    borderLeftColor: "#f39c12",
  },
  transliterationText: {
    fontFamily: "banglaRegular",
    color: "#d35400",
    lineHeight: 22,
  },
  transliterationInfo: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#e67e22",
    marginTop: 10,
  },
  shareContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  shareHint: {
    fontFamily: "banglaSemiBold",
    color: "#138d75",
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: "row",
    backgroundColor: "#138d75",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    elevation: 2,
  },
  shareButtonText: {
    color: "white",
    fontFamily: "banglaSemiBold",
    marginLeft: 10,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 30,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nextButton: {
    flexDirection: "row-reverse",
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#138d75",
    marginHorizontal: 8,
  },
});
