import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DbService from "../../lib/dbService";
import { useFocusEffect } from "@react-navigation/native";

export default function Favourite() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DbService.getFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
      Alert.alert("ত্রুটি", "ফেভারিট লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRemoveFavorite = async (surah_id, ayah_number) => {
    try {
      await DbService.removeFavorite(surah_id, ayah_number);
      loadData();
      setModalVisible(false);
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert("ত্রুটি", "ফেভারিট সরাতে সমস্যা হয়েছে");
    }
  };

  const navigateToSurah = (item) => {
    const surahData = {
      id: item.surah_id,
      name_ar: item.name_ar,
      name_bn: item.name_bn,
      name_en: item.name_en,
      meaning_bn: item.meaning_bn || "",
      total_ayah: item.total_ayah,
      revelation_type: item.revelation_type,
    };

    router.push({
      pathname: `/surah/${item.surah_id}`,
      params: {
        surahData: JSON.stringify(surahData),
        ayah: item.ayah_number, // Navigate directly to the ayah
      },
    });
    setModalVisible(false);
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => openItemModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemMainContent}>
        {/* সূরা নাম এবং আয়াত নম্বর */}
        <View style={styles.surahInfo}>
          <Text style={styles.surahName} numberOfLines={1}>
            {item.name_bn}
          </Text>
          <Text style={styles.ayahNumber}>
            আয়াত {toBengaliNumber(item.ayah_number)}
          </Text>
        </View>

        {/* আরবি টেক্সট (সংক্ষিপ্ত) */}
        <Text style={styles.arabicPreview} numberOfLines={1}>
          {item.text_ar}
        </Text>

        {/* বাংলা অনুবাদ (সংক্ষিপ্ত) */}
        <Text style={styles.translationPreview} numberOfLines={1}>
          {item.text_bn_muhi || item.text_bn_haque || item.text_en}
        </Text>
      </View>

      {/* সাইড আর্ক ইনফো */}
      <View style={styles.sideInfo}>
        <View
          style={[
            styles.revelationBadge,
            item.revelation_type === "Meccan"
              ? styles.meccanBadge
              : styles.madaniBadge,
          ]}
        >
          <Text style={styles.revelationText}>
            {item.revelation_type === "Meccan" ? "ম" : "দ"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={60} color="#d1d8e0" />
      <Text style={styles.emptyTitle}>কোনো ফেভারিট নেই</Text>
      <Text style={styles.emptySubtitle}>
        আপনি এখনো কোনো আয়াত ফেভারিট করেননি
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.browseButtonText}>কুরআন ব্রাউজ করুন</Text>
      </TouchableOpacity>
    </View>
  );

  const DetailModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* মডাল হ্যান্ডেল */}
            <View style={styles.modalHandle}>
              <View style={styles.handleBar} />
            </View>

            {/* মডাল হেডার */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSurahName}>
                  {selectedItem.name_bn}
                </Text>
                <Text style={styles.modalAyahNumber}>
                  আয়াত: {toBengaliNumber(selectedItem.ayah_number)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            {/* বিস্তারিত কন্টেন্ট */}
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* আরবি টেক্সট */}
              <View style={styles.arabicContainer}>
                <Text style={styles.arabicFullText}>
                  {selectedItem.text_ar}
                </Text>
              </View>

              {/* বাংলা অনুবাদ */}
              <View style={styles.translationContainer}>
                <Text style={styles.translationLabel}>বাংলা অনুবাদ:</Text>
                <Text style={styles.translationFullText}>
                  {selectedItem.text_bn_muhi || selectedItem.text_bn_haque}
                </Text>
              </View>

              {/* ইংরেজি অনুবাদ */}
              {selectedItem.text_en && (
                <View style={styles.translationContainer}>
                  <Text style={styles.translationLabel}>
                    English Translation:
                  </Text>
                  <Text style={styles.englishFullText}>
                    {selectedItem.text_en}
                  </Text>
                </View>
              )}

              {/* সূরা তথ্য */}
              <View style={styles.surahDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="book" size={18} color="#7f8c8d" />
                  <Text style={styles.detailText}>
                    সূরা: {selectedItem.name_bn} ({selectedItem.name_en})
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="list" size={18} color="#7f8c8d" />
                  <Text style={styles.detailText}>
                    মোট আয়াত: {toBengaliNumber(selectedItem.total_ayah)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={18} color="#7f8c8d" />
                  <Text style={styles.detailText}>
                    ধরন:{" "}
                    {selectedItem.revelation_type === "Meccan"
                      ? "মাক্কী"
                      : "মাদানী"}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* অ্যাকশন বাটনস */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.goToButton]}
                onPress={() => navigateToSurah(selectedItem)}
              >
                <Ionicons name="arrow-forward" size={20} color="white" />
                <Text style={styles.actionButtonText}>সূরায় যান</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() =>
                  handleRemoveFavorite(
                    selectedItem.surah_id,
                    selectedItem.ayah_number,
                  )
                }
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>ফেভারিট থেকে সরান</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.safeArea,
          { justifyContent: "center", alignContent: "center" },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#138d75" />
          <Text style={styles.loadingText}>ফেভারিট লোড হচ্ছে...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.favorite_id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <DetailModal />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  favoriteItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemMainContent: {
    flex: 1,
    marginRight: 12,
  },
  surahInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  surahName: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
    marginRight: 8,
    flex: 1,
  },
  ayahNumber: {
    fontSize: 13,
    fontFamily: "banglaRegular",
    color: "#138d75",
    backgroundColor: "#e8f6f3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  arabicPreview: {
    fontSize: 15,
    fontFamily: "me-quran",
    color: "#34495e",
    marginBottom: 4,
    textAlign: "right",
    writingDirection: "rtl",
  },
  translationPreview: {
    fontSize: 13,
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
    lineHeight: 18,
  },
  sideInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  revelationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  meccanBadge: {
    backgroundColor: "#ffeaa7",
  },
  madaniBadge: {
    backgroundColor: "#a29bfe",
  },
  revelationText: {
    fontSize: 12,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#7f8c8d",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "banglaRegular",
    color: "#bdc3c7",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: "#138d75",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  browseButtonText: {
    color: "white",
    fontFamily: "banglaSemiBold",
  },
  // মডাল স্টাইলস
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalSurahName: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
  },
  modalAyahNumber: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#138d75",
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  arabicContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  arabicFullText: {
    fontSize: 22,
    fontFamily: "me-quran",
    textAlign: "right",
    lineHeight: 36,
    color: "#2c3e50",
    writingDirection: "rtl",
  },
  translationContainer: {
    marginBottom: 16,
  },
  translationLabel: {
    fontSize: 14,
    fontFamily: "banglaSemiBold",
    color: "#7f8c8d",
    marginBottom: 8,
  },
  translationFullText: {
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#34495e",
    lineHeight: 24,
  },
  englishFullText: {
    fontSize: 15,
    fontFamily: "englishRegular",
    color: "#34495e",
    lineHeight: 22,
  },
  surahDetails: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#666",
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  goToButton: {
    backgroundColor: "#138d75",
  },
  removeButton: {
    backgroundColor: "#e74c3c",
  },
  actionButtonText: {
    color: "white",
    fontFamily: "banglaSemiBold",
    fontSize: 14,
  },
});
