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
                  আয়াত সংখ্যা - {toBengaliNumber(sura.total_ayah)}
                </Text>
                <Text style={styles.surahMeaning}>
                  {sura.type === "Meccan" ? "মাক্কি" : " মাদানি"} সূরা
                </Text>
              </View>
    
              <Image
                source={
                  sura.type === "Meccan"
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
    margin: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 0,
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  surahTextContainer: {
    flex: 1,
  },
  surahName: {
    fontSize: 20,
    color: "#138d75",
    marginBottom: 4,
    fontFamily: "banglaSemiBold",
  },
  surahMeaning: {
    color: "#5a5a5aff",
    marginBottom: 4,
    fontFamily: "banglaRegular",
  },
  bismillah: {
    fontSize: 28,
    color: "#6b5802ff",
    textAlign: "center",
    marginBottom: 16,
  },
  surahTypeImage: {
    width: 60,
    height: 60,
    right: 10,
    bottom: 10,
    opacity: 0.8,
  },
});
