import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LastHeader() {
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>
          আল কুরআন সেই কিতাব, যাতে কোন সন্দেহ নেই, মুত্তাকীদের জন্য হিদায়াত।
        </Text>
        <Text style={styles.title2}>
          আর তোমাদের সাথে যা আছে তার সত্যায়নকারীস্বরূপ আমি যা নাযিল করেছি তার
          প্রতি তোমরা ঈমান আন এবং তোমরা তা প্রথম অস্বীকারকারী হয়ো না।
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 16,
    borderRadius: 8,
    marginBottom : 8
  },
  title: {
    color: "#138d75",
    fontFamily: "banglaSemiBold",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  title2: {
    color: "#666666",
    fontFamily: "banglaRegular",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
