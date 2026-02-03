import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import DbService from "../lib/dbService";
import useSettingsStore from "../store/settingsStore";

export default function SettingsScreen() {
  const {
    reciter,
    arabicFont,
    arabicFontSize,
    banglaFontSize,
    translator,
    showBanglaTranslation,
    showBanglaTafseer,
    showEnglishTranslation,
    loadSettings,
    updateSetting,
  } = useSettingsStore();

  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(true);

  const arabicFonts = [
    { id: 1, name: "me-quran", title: "মে কুরআন" },
    { id: 2, name: "noorehidayat", title: "নূর হিদায়াত" },
    { id: 3, name: "noorehira", title: "নূর হিরা" },
    { id: 4, name: "noorehuda", title: "নূর হুদা" },
    { id: 5, name: "qalam", title: "কলম" },
  ];

  const translators = [
    { label: "ডঃ জহুরুল হক", value: "bn_haque" },
    { label: "মহিউদ্দীন খান", value: "bn_muhi" },
  ];

  const [localArabicFontSize, setLocalArabicFontSize] =
    useState(arabicFontSize);
  const [localBanglaFontSize, setLocalBanglaFontSize] =
    useState(banglaFontSize);

  useEffect(() => {
    setLocalArabicFontSize(arabicFontSize);
  }, [arabicFontSize]);

  useEffect(() => {
    setLocalBanglaFontSize(banglaFontSize);
  }, [banglaFontSize]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load settings from AsyncStorage
        await loadSettings();

        // Load reciters data from database
        const recitersData = await DbService.getAllReciters();

        if (!recitersData || recitersData.length === 0) {
          throw new Error("ক্বারীদের তালিকা পাওয়া যায়নি");
        }

        setReciters(recitersData);
      } catch (error) {
        console.error("ডাটাবেস ত্রুটি:", error);
        Alert.alert("ত্রুটি", "ক্বারীদের তালিকা লোড করতে ব্যর্থ", [
          {
            text: "পুনরায় চেষ্টা করুন",
            onPress: () => loadData(),
          },
          {
            text: "ডিফল্ট ব্যবহার করুন",
            onPress: () => {
              // Default reciters if database fails
              setReciters([
                { id: 1, name: "মিশারি আল আফাসি" },
                { id: 2, name: "আব্দুর রহমান আস সুদাইস" },
                { id: 3, name: "আব্দুল বাসিত" },
                { id: 4, name: "হানি আর রিফাই" }
              ]);
              setLoading(false);
            },
            style: "cancel",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#138d75" />
        <Text style={styles.loadingText}>সেটিংস লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* অনুবাদ সেটিংস */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>অনুবাদ সেটিংস</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>বাংলা অনুবাদ দেখান</Text>
          <Switch
            value={showBanglaTranslation}
            onValueChange={(value) =>
              updateSetting("showBanglaTranslation", value)
            }
            trackColor={{ false: "#ddd", true: "#138d75" }}
            thumbColor={showBanglaTranslation ? "#fff" : "#fff"}
            ios_backgroundColor="#ddd"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>বাংলা তাফসীর দেখান</Text>
          <Switch
            value={showBanglaTafseer}
            onValueChange={(value) => updateSetting("showBanglaTafseer", value)}
            trackColor={{ false: "#ddd", true: "#138d75" }}
            thumbColor={showBanglaTafseer ? "#fff" : "#fff"}
            ios_backgroundColor="#ddd"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>ইংরেজি অনুবাদ দেখান</Text>
          <Switch
            value={showEnglishTranslation}
            onValueChange={(value) =>
              updateSetting("showEnglishTranslation", value)
            }
            trackColor={{ false: "#ddd", true: "#138d75" }}
            thumbColor={showEnglishTranslation ? "#fff" : "#fff"}
            ios_backgroundColor="#ddd"
          />
        </View>
      </View>

      {/* ক্বারী নির্বাচন */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ক্বারী নির্বাচন</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={reciter}
            onValueChange={(itemValue) => {
              updateSetting("reciter", itemValue);
            }}
            style={styles.picker}
            dropdownIconColor="#138d75"
          >
            {reciters.map((r) => (
              <Picker.Item
                key={r.id}
                label={r.name}
                value={r.id}
                style={{ fontFamily: "banglaRegular" }}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* অনুবাদক নির্বাচন */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>অনুবাদক নির্বাচন</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={translator}
            onValueChange={(itemValue) =>
              updateSetting("translator", itemValue)
            }
            style={styles.picker}
            dropdownIconColor="#138d75"
          >
            {translators.map((t) => (
              <Picker.Item
                key={t.value}
                label={t.label}
                value={t.value}
                style={{ fontFamily: "banglaRegular" }}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* আরবি ফন্ট নির্বাচন */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>আরবি ফন্ট</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={arabicFont}
            onValueChange={(itemValue) =>
              updateSetting("arabicFont", itemValue)
            }
            style={styles.picker}
            dropdownIconColor="#138d75"
          >
            {arabicFonts.map((font) => (
              <Picker.Item
                key={font.id}
                label={font.title}
                value={font.name}
                style={{ fontFamily: "banglaRegular" }}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* আরবি ফন্ট সাইজ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          আরবি ফন্ট সাইজ: {localArabicFontSize}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={20}
          maximumValue={32}
          step={1}
          value={localArabicFontSize}
          onValueChange={(value) => setLocalArabicFontSize(value)}
          onSlidingComplete={(value) => updateSetting("arabicFontSize", value)}
          minimumTrackTintColor="#138d75"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#138d75"
          tapToSeek={true}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>ছোট</Text>
          <Text style={styles.sliderLabel}>বড়</Text>
        </View>
      </View>

      {/* বাংলা ফন্ট সাইজ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          বাংলা ফন্ট সাইজ: {localBanglaFontSize}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={14}
          maximumValue={24}
          step={1}
          value={localBanglaFontSize}
          onValueChange={(value) => setLocalBanglaFontSize(value)}
          onSlidingComplete={(value) => updateSetting("banglaFontSize", value)}
          minimumTrackTintColor="#138d75"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#138d75"
          tapToSeek={true}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>ছোট</Text>
          <Text style={styles.sliderLabel}>বড়</Text>
        </View>
      </View>

      {/* টেক্সট প্রিভিউ */}
      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>প্রিভিউ</Text>
        <Text
          style={[
            styles.arabicPreview,
            {
              fontSize: localArabicFontSize,
              fontFamily: arabicFont,
              lineHeight: localArabicFontSize * 1.5,
            },
          ]}
        >
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </Text>

        {showBanglaTranslation && (
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>বাংলা অনুবাদ:</Text>
            <Text
              style={[
                styles.banglaPreview,
                {
                  fontSize: localBanglaFontSize,
                  fontFamily: "banglaRegular",
                  lineHeight: localBanglaFontSize * 1.4,
                },
              ]}
            >
              পরম করুণাময় অসীম দয়ালু আল্লাহর নামে
            </Text>
          </View>
        )}

        {showBanglaTafseer && (
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>বাংলা তাফসীর:</Text>
            <Text
              style={[
                styles.banglaPreview,
                {
                  fontSize: localBanglaFontSize,
                  fontFamily: "banglaRegular",
                  lineHeight: localBanglaFontSize * 1.4,
                },
              ]}
            >
              {translator === "bn_muhi"
                ? "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সমগ্র বিশ্বজগতের রব।"
                : "যাবতীয় প্রশংসা আল্লাহ রাব্বুল আলামীনের জন্য।"}
            </Text>
          </View>
        )}

        {showEnglishTranslation && (
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>English Translation:</Text>
            <Text
              style={[
                styles.englishPreview,
                {
                  fontSize: localBanglaFontSize - 2,
                  fontFamily: "englishRegular",
                  lineHeight: (localBanglaFontSize - 2) * 1.4,
                },
              ]}
            >
              In the name of Allah, the Most Gracious, the Most Merciful
            </Text>
          </View>
        )}
      </View>

      {/* অ্যাপ তথ্য */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>অ্যাপ সম্পর্কে</Text>
        <Text style={styles.infoText}>কুরআন বাংলা অ্যাপ - সম্পূর্ণ বাংলায়</Text>
        <Text style={styles.infoSubText}>
          সমস্ত অনুবাদ এবং তাফসীর নির্ভরযোগ্য সূত্র থেকে সংগ্রহীত
        </Text>
        <Text style={styles.infoSubText}>Version: 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    fontFamily: "banglaRegular",
  },
  section: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginBottom: 16,
    color: "#138d75",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  picker: {
    width: "100%",
    color: "#333",
    height: 50,
  },
  slider: {
    width: "100%",
    height: 40,
    marginTop: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#666",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: "banglaRegular",
    color: "#333",
    flex: 1,
  },
  previewSection: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginBottom: 16,
    color: "#138d75",
  },
  previewItem: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 13,
    fontFamily: "banglaRegular",
    color: "#666",
    marginBottom: 6,
  },
  arabicPreview: {
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 20,
    color: "#2c3e50",
  },
  banglaPreview: {
    textAlign: "left",
    color: "#333",
    fontFamily: "banglaRegular",
  },
  englishPreview: {
    textAlign: "left",
    color: "#333",
    fontFamily: "englishRegular",
  },
  infoSection: {
    backgroundColor: "#e8f4f1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginBottom: 8,
    color: "#138d75",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#333",
    marginBottom: 4,
  },
  infoSubText: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#666",
    marginBottom: 4,
  },
});
