import { toBengaliNumber } from 'bengali-number';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function LastRead({surah}) {
  return (
    <View style={styles.lastReadContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>সর্বশেষ পড়েছেন</Text>
        <Text style={styles.suraName}>{surah.name_bn}</Text>
        <Text style={styles.suraAyah}>আয়াত - {toBengaliNumber(surah.total_ayah)}</Text>
      </View>
      <Image 
        source={require('../assets/images/quran_read.png')}
        style={styles.image}
      /> 
    </View>
  );
}

const styles = StyleSheet.create({
  lastReadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily : 'banglaRegular'
  },
  suraName: {
    fontSize: 18,
    fontFamily : 'banglaSemiBold',
    color: '#138d75',
  },
  suraAyah: {
    color: '#636363ff',
    fontFamily : 'banglaRegular'
  },
  image: {
    width: 60,
    height: 60,
    marginLeft: 16,
  },
});