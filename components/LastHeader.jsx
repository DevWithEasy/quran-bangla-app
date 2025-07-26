import { View, Text, ImageBackground, StyleSheet } from 'react-native';

export default function LastHeader() {
  return (
    <ImageBackground 
      source={require('../assets/images/header_backgrounnd.png')} 
      style={styles.headerBackground}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.title}>আল কুরআন সেই কিতাব, যাতে কোন সন্দেহ নেই, মুত্তাকীদের জন্য হিদায়াত।</Text>
        <Text style={styles.title2}>আর তোমাদের সাথে যা আছে তার সত্যায়নকারীস্বরূপ আমি যা নাযিল করেছি তার প্রতি তোমরা ঈমান আন এবং তোমরা তা প্রথম অস্বীকারকারী হয়ো না।</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    height: 140,
    width: '100%',
    padding: 16,
    backgroundColor: '#d4efdf',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    
  },
  title: {
    color : '#138d75',
    fontFamily: 'banglaSemiBold',
  },
    title2: {
    color : '#138d75',
    fontFamily: 'banglaRegular',
  }
});