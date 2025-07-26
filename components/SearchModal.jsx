import { useRouter } from 'expo-router';
import { 
  FlatList, 
  Modal, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Dimensions 
} from 'react-native';

const { height } = Dimensions.get('window');

export default function SearchModal({
  searchModalVisible,
  closeSearchModal,
  searchQuery,
  setSearchQuery,
  filteredSurahs
}) {
  const router = useRouter();

  const navigateToSurah = (surah) => {
    closeSearchModal();
    router.push({
      pathname: `/surah/${surah.serial}`,
      params: {
        surahData: JSON.stringify(surah),
      },
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={searchModalVisible}
      onRequestClose={closeSearchModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="সূরা নাম বা অর্থ লিখুন..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              <TouchableOpacity onPress={closeSearchModal}>
                <Text style={styles.cancelButton}>বন্ধ</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredSurahs}
              keyExtractor={(item) => item.serial.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchItem}
                  onPress={() => navigateToSurah(item)}
                >
                  <Text style={styles.searchItemText}>
                    {item.serial}. {item.name_bn} - {item.meaning_bn}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyResults}>
                  {searchQuery.trim() !== "" && (
                    <Text style={styles.emptyText}>কোন সূরা পাওয়া যায়নি</Text>
                  )}
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.6, // Takes 60% of screen height
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    fontFamily: "banglaRegular",
  },
  cancelButton: {
    marginLeft: 10,
    color: "#138d75",
    fontFamily: "banglaSemiBold",
  },
  searchItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchItemText: {
    fontSize: 16,
    fontFamily: "banglaRegular",
  },
  emptyResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontFamily: "banglaRegular",
    color: "#888",
  },
});