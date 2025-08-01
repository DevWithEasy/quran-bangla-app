import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
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
import useSettingsStore from "../store/settingsStore";
import { getJsonData } from "../utils/audioControllers";

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

        // Load reciters data from JSON file
        const recitersPath = `${FileSystem.documentDirectory}APP_DATA/reciters.json`;
        const fileInfo = await FileSystem.getInfoAsync(recitersPath);

        if (!fileInfo.exists) {
          throw new Error("Reciters data not found");
        }

        setReciters(await getJsonData(recitersPath));
      } catch (error) {
        console.error("ডাটাবেস ত্রুটি:", error);
        Alert.alert("ত্রুটি", "ক্বারীদের তালিকা লোড করতে ব্যর্থ", [
          {
            text: "পুনরায় চেষ্টা করুন",
            onPress: () => loadData(),
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
    <ScrollView style={styles.container}>
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
            trackColor={{ false: "#767577", true: "#138d75" }}
            thumbColor={showBanglaTranslation ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>বাংলা তাফসীর দেখান</Text>
          <Switch
            value={showBanglaTafseer}
            onValueChange={(value) => updateSetting("showBanglaTafseer", value)}
            trackColor={{ false: "#767577", true: "#138d75" }}
            thumbColor={showBanglaTafseer ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>ইংরেজি অনুবাদ দেখান</Text>
          <Switch
            value={showEnglishTranslation}
            onValueChange={(value) =>
              updateSetting("showEnglishTranslation", value)
            }
            trackColor={{ false: "#767577", true: "#138d75" }}
            thumbColor={showEnglishTranslation ? "#f4f3f4" : "#f4f3f4"}
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
              <Picker.Item key={t.value} label={t.label} value={t.value} />
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
          >
            {arabicFonts.map((font) => (
              <Picker.Item key={font.id} label={font.title} value={font.name} />
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
          maximumValue={30}
          step={1}
          value={localArabicFontSize}
          onValueChange={(value) => setLocalArabicFontSize(value)}
          onSlidingComplete={(value) => updateSetting("arabicFontSize", value)}
          minimumTrackTintColor="#138d75"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#138d75"
        />
      </View>

      {/* বাংলা ফন্ট সাইজ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          বাংলা ফন্ট সাইজ: {localBanglaFontSize}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={16}
          maximumValue={26}
          step={1}
          value={localBanglaFontSize}
          onValueChange={(value) => setLocalBanglaFontSize(value)}
          onSlidingComplete={(value) => updateSetting("banglaFontSize", value)}
          minimumTrackTintColor="#138d75"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#138d75"
        />
      </View>

      {/* টেক্সট প্রিভিউ */}
      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>টেক্সট প্রিভিউ</Text>
        <Text
          style={[
            styles.arabicPreview,
            {
              fontSize: localArabicFontSize,
              fontFamily: arabicFont,
            },
          ]}
        >
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </Text>
        {showBanglaTranslation && (
          <Text
            style={[
              styles.banglaPreview,
              {
                fontSize: localBanglaFontSize,
                fontFamily: "banglaRegular",
              },
            ]}
          >
            পরম করুণাময় অসীম দয়ালু আল্লাহর নামে
          </Text>
        )}
        {showEnglishTranslation && (
          <Text
            style={[
              styles.englishPreview,
              {
                fontSize: localBanglaFontSize - 2,
                fontFamily: "englishRegular",
              },
            ]}
          >
            In the name of Allah, the Most Gracious, the Most Merciful
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
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
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginBottom: 12,
    color: "#2c3e50",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#333",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#2c3e50",
  },
  previewSection: {
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    marginBottom: 12,
    color: "#2c3e50",
  },
  arabicPreview: {
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 16,
    color: "#2c3e50",
    lineHeight: 30,
  },
  banglaPreview: {
    textAlign: "left",
    color: "#2c3e50",
    lineHeight: 24,
    fontFamily: "banglaRegular",
  },
  englishPreview: {
    textAlign: "left",
    color: "#2c3e50",
    lineHeight: 22,
    fontFamily: "englishRegular",
    marginTop: 8,
  },
});
