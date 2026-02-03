import { toBengaliNumber } from "bengali-number";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuraItem({ item }) {
  const router = useRouter();
  
  const handleSurahPress = async (surahItem) => {
    router.push({
      pathname: `/surah/${surahItem.id}`,
      params: {
        surahData: JSON.stringify(surahItem),
      },
    });
  };

  return (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSurahPress(item)}
      style={styles.item}
    >
      <View style={styles.surahContainer}>
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>
            {toBengaliNumber(item.id)}
          </Text>
        </View>
        
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name_bn}</Text>
          <Text style={styles.meaningBn}>{item.meaning_bn}</Text>
          
          <View style={styles.detailsContainer}>
            <Image
              source={
                item.revelation_type === "Meccan"
                  ? require("../assets/images/maccan.png")
                  : require("../assets/images/madina.png")
              }
              style={styles.cityIcon}
            />
            <Text style={styles.surahDetails}>
              আয়াত - {toBengaliNumber(item.total_ayah)}
            </Text>
            <Text style={styles.revelationType}>
              {item.revelation_type === "Meccan" ? "মাক্কী" : "মাদানী"}
            </Text>
          </View>
        </View>
        
        <View style={styles.arabicContainer}>
          <Text style={styles.surahNameArabic}>{item.name_ar}</Text>
          <Text style={styles.meaningEn}>{item.meaning_en}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  surahContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#138d75",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  surahNumberText: {
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#ffffff",
    fontWeight: "bold",
  },
  surahInfo: {
    flex: 1,
    marginRight: 10,
  },
  surahName: {
    fontSize: 16,
    marginBottom: 2,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
  },
  meaningBn: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "banglaRegular",
    color: "#7f8c8d",
  },
  arabicContainer: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  surahNameArabic: {
    fontSize: 18,
    marginBottom: 4,
    fontFamily: "arabicRegular",
    color: "#2c3e50",
    fontWeight: "bold",
  },
  meaningEn: {
    fontSize: 10,
    fontFamily: "englishRegular",
    color: "#95a5a6",
    textAlign: "right",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  surahDetails: {
    fontSize: 12,
    color: "#7f8c8d",
    marginRight: 8,
    fontFamily: "banglaRegular",
  },
  revelationType: {
    fontSize: 12,
    color: "#e67e22",
    fontFamily: "banglaRegular",
    marginLeft: 4,
  },
  cityIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: "#e67e22",
  },
});