import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { toBengaliNumber } from 'bengali-number';

export default function SuraInfo({sura}) {
  return (
    <View style={styles.surahInfoContainer}>
      <View style={styles.surahTextContainer}>
        <Text style={styles.surahName}>{sura.name_bn}</Text>
        <Text style={styles.surahMeaning}>{sura.meaning_bn}</Text>
        <Text style={styles.surahMeaning}>
          আয়াত সংখ্যা - {toBengaliNumber(sura.total_ayah)}
        </Text>
        <Text style={styles.surahMeaning}>
          {sura.revelation_type === "Meccan" ? "মাক্কী" : "মাদানী"} সূরা
        </Text>
      </View>

      <Image
        source={
          sura.revelation_type === "Meccan"
            ? require("../assets/images/maccan.png")
            : require("../assets/images/madina.png")
        }
        style={styles.surahTypeImage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  surahInfoContainer: {
    backgroundColor: '#d4efdf',
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  surahTextContainer: {
    flex: 1,
  },
  surahName: {
    fontSize:18,
    color: "#138d75",
    marginBottom: 6,
    fontFamily: "banglaSemiBold",
  },
  surahMeaning: {
    color: "#5a5a5aff",
    marginBottom: 4,
    fontFamily: "banglaRegular",
    fontSize: 14,
  },
  surahTypeImage: {
    width: 60,
    height: 60,
    right: 10,
    bottom: 10,
    opacity: 0.8,
  },
});