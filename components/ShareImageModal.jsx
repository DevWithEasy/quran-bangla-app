import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import ViewShot, { captureRef } from "react-native-view-shot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// কালার থিম ডেফিনিশন
const colorThemes = {
  green: {
    name: "সবুজ থিম",
    primary: "#138d75",
    secondary: "#a3e4d7",
    background: "#e8f4f1",
    cardBackground: "#ffffff",
    textPrimary: "#2c3e50",
    textSecondary: "#7f8c8d",
    accent: "#16a085",
  },
  blue: {
    name: "নীল থিম",
    primary: "#2980b9",
    secondary: "#a9cce3",
    background: "#eaf2f8",
    cardBackground: "#ffffff",
    textPrimary: "#1a5276",
    textSecondary: "#5d6d7e",
    accent: "#3498db",
  },
  purple: {
    name: "বেগুনী থিম",
    primary: "#8e44ad",
    secondary: "#d7bde2",
    background: "#f4ecf7",
    cardBackground: "#ffffff",
    textPrimary: "#4a235a",
    textSecondary: "#7d3c98",
    accent: "#9b59b6",
  },
  gold: {
    name: "স্বর্ণ থিম",
    primary: "#d35400",
    secondary: "#fad7a0",
    background: "#fef9e7",
    cardBackground: "#ffffff",
    textPrimary: "#7d6608",
    textSecondary: "#a04000",
    accent: "#f39c12",
  },
};

export default function ShareImageModal({
  visible,
  onClose,
  surah,
  ayah,
  arabicFont,
  translator,
}) {
  const viewShotRef = useRef();
  const [isSaving, setIsSaving] = useState(false);

  // টগল স্টেটস
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(true);

  // নতুন স্টেট: কন্ট্রোল সেকশন হাইড/আনহাইড
  const [showControls, setShowControls] = useState(true);

  // কালার থিম স্টেট
  const [selectedTheme, setSelectedTheme] = useState("green");
  const currentTheme = colorThemes[selectedTheme];

  // ছবি সেভ করার ফাংশন
  const saveImageToGallery = async () => {
    try {
      setIsSaving(true);

      // ভিউ ক্যাপচার
      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      // অ্যান্ড্রয়েড/আইওএসে ফাইল সেভ করার অনুমতি
      if (Platform.OS === "android" || Platform.OS === "ios") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "অনুমতি প্রয়োজন",
            text2: "ছবি সেভ করতে স্টোরেজ এক্সেস প্রয়োজন",
          });
          return;
        }
      }

      // টেম্পোরারি ফাইল তৈরি
      const fileName = `কুরআন_${surah.id}_${ayah.ayah_number}_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // ফাইল কপি
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      // শুধু মিডিয়া লাইব্রেরিতে সেভ
      if (Platform.OS !== "web") {
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert("সফল হয়েছে", "ছবিটি গ্যালারিতে সংরক্ষিত হয়েছে");
      }
    } catch (error) {
      console.error("Error saving image:", error);
      Toast.show({
        type: "error",
        text1: "ত্রুটি",
        text2: "ছবি সেভ করতে সমস্যা হয়েছে",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ডাইনামিক স্টাইল ফাংশন
  const getDynamicStyles = () => {
    return StyleSheet.create({
      imageTemplate: {
        padding: 20,
        backgroundColor: currentTheme.cardBackground,
      },
      templateHeader: {
        alignItems: "center",
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: currentTheme.secondary,
      },
      templateTitle: {
        fontSize: 16,
        fontFamily: "banglaSemiBold",
        color: currentTheme.primary,
      },
      templateSubtitle: {
        fontFamily: "banglaRegular",
        color: currentTheme.textPrimary,
        fontSize: 14,
      },
      arabicContainer: {
        marginBottom: 4,
        padding: 12,
        backgroundColor: currentTheme.name === "dark" ? "#34495e" : "#f8f9fa",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: currentTheme.secondary,
      },
      arabicText: {
        textAlign: "right",
        lineHeight: 30,
        color: currentTheme.textPrimary,
      },
      translationContainer: {
        marginBottom: 4,
        padding: 12,
        backgroundColor: currentTheme.name === "dark" ? "#2c3e50" : "#f0f7f5",
        borderRadius: 12,
      },
      translationLabel: {
        fontFamily: "banglaSemiBold",
        color: currentTheme.primary,
      },
      translationText: {
        fontFamily: "banglaRegular",
        color: currentTheme.textPrimary,
        lineHeight: 20,
        textAlign: "left",
      },
      tafsirContainer: {
        marginBottom: 4,
        padding: 12,
        backgroundColor: currentTheme.name === "dark" ? "#34495e" : "#f9f9f9",
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: currentTheme.accent,
      },
      tafsirLabel: {
        fontFamily: "banglaSemiBold",
        color: currentTheme.accent,
      },
      tafsirText: {
        fontFamily: "banglaRegular",
        color: currentTheme.textSecondary,
        lineHeight: 20,
      },
      footer: {
        flexDirection: "row",
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: currentTheme.secondary,
        alignItems: "center",
        justifyContent: "space-between",
      },
      footerText: {
        fontFamily: "banglaSemiBold",
        color: currentTheme.textPrimary,
      },
      footerSubText: {
        fontSize: 13,
        fontFamily: "banglaRegular",
        color: currentTheme.textSecondary,
      },
    });
  };

  const dynamicStyles = getDynamicStyles();

  // টগল আইটেম কম্পোনেন্ট
  const ToggleItem = ({ label, value, onValueChange, icon }) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleLeft}>
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e0e0e0", true: currentTheme.secondary }}
        thumbColor={value ? currentTheme.primary : "#f4f3f4"}
        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
      />
    </View>
  );

  // কালার থিম বাটন কম্পোনেন্ট
  const ColorThemeButton = ({ themeKey, theme }) => (
    <TouchableOpacity
      style={[
        styles.colorButton,
        selectedTheme === themeKey && styles.selectedColorButton,
        { backgroundColor: theme.primary },
      ]}
      onPress={() => setSelectedTheme(themeKey)}
    >
      <Text style={styles.colorButtonText}>{theme.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: currentTheme.background },
        ]}
      >
        {/* প্রিভিউ কন্টেইনার */}
        <View style={styles.previewContainer}>
          <ViewShot ref={viewShotRef} style={styles.viewShotContainer}>
            {/* ছবি টেমপ্লেট */}
            <View style={dynamicStyles.imageTemplate}>
              {/* হেডার */}
              <View style={dynamicStyles.templateHeader}>
                <Text style={dynamicStyles.templateTitle}>কুরআন মাজীদ</Text>
                <Text style={dynamicStyles.templateSubtitle}>
                  {surah.name_bn} - আয়াত {toBengaliNumber(ayah.ayah_number)}
                </Text>
              </View>

              {/* আরবি টেক্সট - শুধু দেখানো হলে */}
              {showArabic && (
                <View style={dynamicStyles.arabicContainer}>
                  <Text
                    style={[
                      dynamicStyles.arabicText,
                      { fontFamily: arabicFont },
                    ]}
                  >
                    {ayah.text_ar}
                  </Text>
                </View>
              )}

              {/* বঙ্গানুবাদ - শুধু দেখানো হলে */}
              {showTranslation && (
                <View style={dynamicStyles.translationContainer}>
                  <Text style={dynamicStyles.translationLabel}>
                    বাংলা উচ্চারণ:
                  </Text>
                  <Text style={dynamicStyles.translationText}>
                    {ayah.text_tr}
                  </Text>
                </View>
              )}

              {/* অন্যান্য ট্রান্সলেশন - শুধু দেখানো হলে */}
              {showTafsir && translator === "bn_muhi" && ayah.text_bn_muhi && (
                <View style={dynamicStyles.tafsirContainer}>
                  <Text style={dynamicStyles.tafsirLabel}>অনুবাদ:</Text>
                  <Text style={dynamicStyles.tafsirText}>
                    {ayah.text_bn_muhi}
                  </Text>
                </View>
              )}

              {/* ফুটার */}
              <View style={dynamicStyles.footer}>
                <Image
                  source={require("../assets/images/icon.png")}
                  style={{ width: 50, height: 50, left: -8 }}
                />
                <View style={{ flex: 1, left: -8 }}>
                  <Text style={dynamicStyles.footerText}>কুরআন বাংলা</Text>
                  <Text style={dynamicStyles.footerSubText}>
                    প্লেস্টোর থেকে ডাউনলোড করুন
                  </Text>
                </View>
                <Image
                  source={require("../assets/images/qr_url.png")}
                  style={{ width: 50, height: 50 }}
                />
              </View>
            </View>
          </ViewShot>
        </View>

        {/* কন্ট্রোল সেকশন - শর্তসাপেক্ষে দেখানো */}
        {showControls && (
          <View
            style={[
              styles.controlContainer,
              { backgroundColor: currentTheme.cardBackground },
            ]}
          >
            <Text
              style={[styles.controlTitle, { color: currentTheme.textPrimary }]}
            >
              কন্ট্রোল
            </Text>
            <View style={styles.colorButtonsContainer}>
              {Object.entries(colorThemes).map(([key, theme]) => (
                <ColorThemeButton key={key} themeKey={key} theme={theme} />
              ))}
            </View>
            <View style={styles.controlOptions}>
              <ToggleItem
                label="আরবি"
                value={showArabic}
                onValueChange={setShowArabic}
                icon="text-outline"
              />
              <ToggleItem
                label="উচ্চারণ"
                value={showTranslation}
                onValueChange={setShowTranslation}
                icon="mic-outline"
              />
              <ToggleItem
                label="অনুবাদ"
                value={showTafsir}
                onValueChange={setShowTafsir}
                icon="language-outline"
              />
            </View>
          </View>
        )}

        {/* বাটন সেকশন */}
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: currentTheme.cardBackground },
          ]}
        >
          {/* কন্ট্রোল হাইড/আনহাইড বাটন */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: currentTheme.secondary, width: 10 },
            ]}
            onPress={() => setShowControls(!showControls)}
          >
            <Ionicons
              name={showControls ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={currentTheme.primary}
            />
            <Text style={[styles.buttonText, { color: currentTheme.primary }]}>
              কন্ট্রোল
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={saveImageToGallery}
            disabled={isSaving}
          >
            <Ionicons name="save-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>
              {isSaving ? "সেভ হচ্ছে..." : "ছবি সেভ"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isSaving}
          >
            <Ionicons name="close-circle-outline" size={22} color="#7f8c8d" />
            <Text style={[styles.buttonText, { color: "#7f8c8d" }]}>বাতিল</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
  previewContainer: {
    flex: 3,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  viewShotContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    overflow: "hidden",
  },
  colorThemeContainer: {
    padding: 12,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontFamily: "banglaSemiBold",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 15,
  },
  colorButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  colorButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: "20%",
    alignItems: "center",
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  colorButtonText: {
    fontFamily: "banglaRegular",
    color: "#fff",
    fontSize: 12,
  },
  controlContainer: {
    position: "relative",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e8f4f1",
    borderBottomWidth: 1,
    borderBottomColor: "#e8f4f1",
  },
  controlTitle: {
    fontFamily: "banglaSemiBold",
    textAlign: "center",
  },
  controlOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    margin: 2,
    flex: 1,
    elevation: 0.5,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleLabel: {
    fontFamily: "banglaRegular",
    fontSize: 13,
    color: "#2c3e50",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  controlToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  controlToggleButtonText: {
    fontFamily: "banglaRegular",
    fontSize: 12,
    marginLeft: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonText: {
    fontFamily: "banglaRegular",
    color: "#fff",
    marginLeft: 8,
  },
});
