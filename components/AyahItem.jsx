import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSettingsStore from "../store/settingsStore";

export default function AyahItem({ surah, ayah, onPlay, isPlaying, stopAudio }) {
  const { arabicFont, arabicFontSize, banglaFontSize, translator } =
    useSettingsStore();
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  const copyAyah = async () => {
    try {
      const ayahText = `${surah.name_bn} ${toBengaliNumber(
        ayah.surah_id
      )}:${toBengaliNumber(ayah.ayah_id)}\n\n${ayah.arabic}\n\n${
        ayah.tr_ar
      }\n\n${
        translator === "tr_bn_muhi" ? ayah.tr_bn_muhi : ayah.tr_bn_haque
      }\n\nসোর্স : কুরআন বাংলা অ্যাপ`;
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
        `${surah.name_bn} ${toBengaliNumber(ayah.surah_id)}:${toBengaliNumber(
          ayah.ayah_id
        )}`,
        ayah.arabic,
        ayah.tr_ar,
        translator === "tr_bn_muhi" ? ayah.tr_bn_muhi : ayah.tr_bn_haque,
        "সোর্স : কুরআন বাংলা অ্যাপ",
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

  return (
    <View key={ayah.id} style={styles.ayahContainer}>
      <View style={styles.ayahHeader}>
        <View style={styles.ayahNumber}>
          <Text style={styles.ayahNumberText}>
            {toBengaliNumber(surah.serial)}:{toBengaliNumber(ayah.id)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="ellipsis-horizontal-circle"
            size={26}
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
          {ayah.ar}
        </Text>
        <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
          {ayah.tr}
        </Text>
        <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
          {translator === "bn_muhi" ? ayah.bn_muhi : ayah.bn_haque}
        </Text>
      </View>

      {/* Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            {/* Play / Pause button */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                if (isPlaying) {
                  stopAudio();
                } else {
                  onPlay(ayah);
                }
                setModalVisible(false);
              }}
            >
              <Ionicons
                name={isPlaying ? "pause-circle-outline" : "caret-forward-circle-outline"}
                size={20}
                color="#333"
              />
              <Text style={styles.modalOptionText}>
                {isPlaying ? "আয়াত বন্ধ করুন" : "আয়াত প্লে করুন"}
              </Text>
            </TouchableOpacity>

            {/* Go to full sura audio page */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                stopAudio();
                router.push("/quran/audio-book");
                setModalVisible(false);
              }}
            >
              <Ionicons name="musical-notes-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>সূরা অডিও শুনুন</Text>
            </TouchableOpacity>

            {/* Copy Ayah */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                copyAyah();
                setModalVisible(false);
              }}
            >
              <Ionicons name="copy-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>কপি করুন</Text>
            </TouchableOpacity>

            {/* Share Ayah */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                shareAyah();
                setModalVisible(false);
              }}
            >
              <Ionicons name="share-social-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>শেয়ার করুন</Text>
            </TouchableOpacity>

            {/* Close Modal */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-outline" size={20} color="#ff4444" />
              <Text style={[styles.modalOptionText, { color: "#ff4444" }]}>
                বন্ধ করুন
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  ayahContainer: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ayahHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
  },
  ayahNumber: {
    backgroundColor: "#138d75",
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  ayahNumberText: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "banglaRegular",
  },
  ayahContent: {
    marginBottom: 16,
  },
  ayahText: {
    fontSize: 24,
    textAlign: "right",
    lineHeight: 40,
    marginBottom: 12,
  },
  translation: {
    lineHeight: 24,
    color: "#333",
    marginBottom: 8,
    fontFamily: "banglaRegular"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#333",
  },
});