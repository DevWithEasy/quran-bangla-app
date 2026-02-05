import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import DbService from "../lib/dbService";
import useSettingsStore from "../store/settingsStore";
import ShareImageModal from "./ShareImageModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AyahItem({
  surah,
  ayah,
  onPlay,
  isPlaying,
  stopAudio,
}) {
  const {
    arabicFont,
    arabicFontSize,
    banglaFontSize,
    translator,
    showBanglaTranslation,
    showBanglaTafseer,
    showEnglishTranslation,
  } = useSettingsStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteExist, setFavoriteExist] = useState(false);
  const [shareImageModalVisible, setShareImageModalVisible] = useState(false);

  const router = useRouter();

  const handleModal = async () => {
    const findFav = await DbService.checkFavorite(
      ayah.surah_id,
      ayah.ayah_number,
    );
    if (findFav) setFavoriteExist(true);
    setModalVisible(true);
  };

  const handleFavorite = async () => {
    try {
      if (favoriteExist) {
        await DbService.removeFavorite(ayah.surah_id, ayah.ayah_number);
        setFavoriteExist(false);
      } else {
        await DbService.addFavorite(ayah.surah_id, ayah.ayah_number);
        setFavoriteExist(true);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "ত্রুটি",
        text2: "কপি করতে সমস্যা হয়েছে",
        visibilityTime: 2000,
      });
    }
  };

  const copyAyah = async () => {
    try {
      const ayahText = `${surah.name_bn} ${toBengaliNumber(
        surah.id,
      )}:${toBengaliNumber(ayah.ayah_number)}\n\n${ayah.text_ar}\n\n${
        ayah.text_tr
      }\n\n${
        translator === "bn_muhi" ? ayah.text_bn_muhi : ayah.text_bn_haque
      }\n\n${ayah.text_en}\n\nসোর্সঃ কুরআন বাংলা অ্যাপ\n\nডাউনলোড করুনঃ https://play.google.com/store/apps/details?id=com.codeorbitstudio.quranbangla`;
      await Clipboard.setStringAsync(ayahText);
      Toast.show({
        type: "success",
        text1: "কপি হয়েছে",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "ত্রুটি",
        text2: "কপি করতে সমস্যা হয়েছে",
        visibilityTime: 2000,
      });
    }
  };

  const shareAyah = async () => {
    try {
      const ayahText = [
        `${surah.name_bn} ${toBengaliNumber(surah.id)}:${toBengaliNumber(
          ayah.ayah_number,
        )}`,
        ayah.text_ar,
        ayah.text_tr,
        translator === "bn_muhi" ? ayah.text_bn_muhi : ayah.text_bn_haque,
        ayah.text_en,
        "সোর্সঃ কুরআন বাংলা অ্যাপ",
        "ডাউনলোড করুনঃ https://play.google.com/store/apps/details?id=com.codeorbitstudio.quranbangla",
      ].join("\n\n");

      await Share.share({
        message: ayahText,
        title: "আয়াত শেয়ার করুন",
      });
    } catch (error) {
      console.error("Share error:", error);
      Toast.show({
        type: "error",
        text1: "ত্রুটি",
        text2: "শেয়ার করতে সমস্যা হয়েছে",
        visibilityTime: 1000,
      });
    }
  };

  // মডাল বিকল্পসমূহ - লিস্ট আকারে
  const modalOptions = [
    {
      id: 1,
      icon: isPlaying ? "pause-circle" : "play-circle",
      label: isPlaying ? "আয়াত বন্ধ করুন" : "আয়াত প্লে করুন",
      color: "#138d75",
      onPress: () => {
        if (isPlaying) {
          stopAudio();
        } else {
          onPlay(surah.id, ayah);
        }
        setModalVisible(false);
      },
    },
    {
      id: 2,
      icon: "musical-notes",
      label: "সম্পূর্ণ সূরা অডিও",
      color: "#3498db",
      onPress: () => {
        stopAudio();
        router.push("/quran/audio-book");
        setModalVisible(false);
      },
    },
    {
      id: 3,
      icon: "copy",
      label: "কপি করুন",
      color: "#9b59b6",
      onPress: () => {
        copyAyah();
        setModalVisible(false);
      },
    },
    {
      id: 4,
      icon: "share-social",
      label: "শেয়ার করুন",
      color: "#2ecc71",
      onPress: () => {
        shareAyah();
        setModalVisible(false);
      },
    },
    {
      id: 5,
      icon: "image",
      label: "ছবি শেয়ার করুন",
      color: "#e74c3c",
      onPress: () => {
        setShareImageModalVisible(true);
        setModalVisible(false);
      },
    },
    {
      id: 6,
      icon: "bookmark",
      label: "বুকমার্ক করুন",
      color: "#f39c12",
      onPress: () => {
        handleFavorite();
        setModalVisible(false);
      },
    },
  ];

  return (
    <View key={ayah.id} style={styles.ayahContainer}>
      <View style={styles.ayahHeader}>
        <View style={styles.ayahNumber}>
          <Text style={styles.ayahNumberText}>
            {toBengaliNumber(surah.id)}:{toBengaliNumber(ayah.ayah_number)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleModal} style={styles.menuButton}>
          <Ionicons
            name="ellipsis-horizontal-circle"
            size={28}
            color="#138d75"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.ayahContent}>
        <Text
          style={[
            styles.ayahText,
            { fontFamily: arabicFont, fontSize: arabicFontSize },
          ]}
        >
          {ayah.text_ar}
        </Text>
        {showBanglaTranslation && (
          <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
            {ayah.text_tr}
          </Text>
        )}
        {showBanglaTafseer && (
          <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
            {translator === "bn_muhi" ? ayah.text_bn_muhi : ayah.text_bn_haque}
          </Text>
        )}
        {showEnglishTranslation && (
          <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
            {ayah.text_en}
          </Text>
        )}
      </View>

      {/* Share Image Modal */}
      <ShareImageModal
        visible={shareImageModalVisible}
        onClose={() => setShareImageModalVisible(false)}
        surah={surah}
        ayah={ayah}
        arabicFont={arabicFont}
        arabicFontSize={arabicFontSize}
        banglaFontSize={banglaFontSize}
        translator={translator}
      />

      {/* Enhanced Bottom Modal - List View */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setFavoriteExist(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              setFavoriteExist(false);
            }}
          />

          <View style={styles.modalContainer}>
            {/* মডাল হ্যান্ডেল বার */}
            <View style={styles.modalHandle}>
              <View style={styles.handleBar} />
            </View>

            {/* মডাল হেডার */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>অপশনস</Text>
            </View>

            {/* অপশনস লিস্ট */}
            <View style={styles.optionsContainer}>
              <ScrollView
                style={styles.optionsScrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.optionsContent}
              >
                {modalOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          option.icon === "bookmark" && favoriteExist
                            ? `${option.color}15`
                            : "",
                      },
                    ]}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.optionIconContainer,
                        { backgroundColor: `${option.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={22}
                        color={option.color}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionLabel}>
                        {option.icon !== "bookmark"
                          ? option.label
                          : option.icon === "bookmark" && favoriteExist
                            ? "বুকমার্ক থেকে বাদ দিন"
                            : option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ক্লোজ বাটন */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={22} color="#7f8c8d" />
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>

            {/* সেফ এরিয়া ফর iOS */}
            {Platform.OS === "ios" && <View style={styles.safeArea} />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  ayahContainer: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8f4f1",
    elevation: 3,
    shadowColor: "#138d75",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  ayahHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8f4f1",
  },
  ayahNumber: {
    backgroundColor: "#138d75",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#138d75",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ayahNumberText: {
    fontSize: 15,
    color: "#ffffff",
    fontFamily: "banglaSemiBold",
    fontWeight: "600",
  },
  menuButton: {
    padding: 4,
  },
  ayahContent: {
    marginBottom: 8,
  },
  ayahText: {
    fontSize: 24,
    textAlign: "right",
    lineHeight: 42,
    marginBottom: 16,
    color: "#2c3e50",
  },
  translation: {
    lineHeight: 24,
    color: "#34495e",
    marginBottom: 12,
    fontFamily: "banglaRegular",
    textAlign: "left",
    fontSize: 15,
  },
  // নতুন মডাল স্টাইলস - লিস্ট ভিউ (ফিক্সড)
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    height: SCREEN_HEIGHT * 0.7,
  },
  modalHandle: {
    alignItems: "center",
    marginBottom: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContent: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e8f4f1",
  },
  optionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: "banglaRegular",
    color: "#2c3e50",
    marginBottom: 2,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  closeButtonText: {
    fontFamily: "banglaSemiBold",
    color: "#7f8c8d",
    marginLeft: 10,
  },
  safeArea: {
    height: 20,
  },
});
