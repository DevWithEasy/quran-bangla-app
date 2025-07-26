import AsyncStorage from "@react-native-async-storage/async-storage";
import { toBengaliNumber } from "bengali-number";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuraItem({ item }) {
  const router = useRouter();
  const handleSurahPress = async(surahItem) => {
    await AsyncStorage.setItem('lastReadSurah', JSON.stringify(surahItem));
    router.push({
      pathname: `/surah/${surahItem.serial}`,
      params: {
        surahData: JSON.stringify(surahItem),
      },
    });
  };

  return (
    <TouchableOpacity
      key={item.serial}
      onPress={() => handleSurahPress(item)}
      style={styles.item}
    >
      <View style={styles.surahContainer}>
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>{toBengaliNumber(item.serial)}</Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>
            {item.name_bn}
          </Text>
          <View style={styles.detailsContainer}>
            <Image 
              source={item.type === "Meccan" 
                ? require('../assets/images/maccan.png') 
                : require('../assets/images/madina.png')}
              style={styles.cityIcon}
            />
            <Text style={styles.surahDetails}>
              আয়াত - {toBengaliNumber(item.total_ayah)} 
            </Text>
          </View>
        </View>
        <Text style={styles.surahNameArabic}>
            {item.name}
          </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 8,
    elevation: .5,
  },
  surahContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  surahNumber: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: '#138d75',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  surahNumberText: {
    fontSize: 16,
    fontFamily : 'banglaRegular',
    color: '#ffffff',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily : 'banglaSemiBold',
    color: '#138d75',
  },
  surahNameArabic: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily : 'banglaRegular',
    color: '#979797ff',
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahDetails: {
    color: "#7f8c8d",
    marginRight: 8,
    fontFamily : 'banglaRegular'
  },
  cityIcon: {
    width: 12,
    height: 12,
    marginRight : 10
  },
});