import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function About() {
  const openWebsite = () => {
    Linking.openURL('https://codeorbitstudiobd.vercel.app');
  };

  const contactDeveloper = () => {
    Linking.openURL('mailto:robiulawal68@gmail.com');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: 0 }]}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>কুরআন বাংলা অ্যাপ</Text>
          <Text style={styles.text}>
            এই অ্যাপটি তৈরি করা হয়েছে মুসলিম ভাই-বোনদের জন্য যারা বাংলা ভাষায় কুরআন বুঝতে ও পড়তে চান। এখানে আপনি পাবেন:
          </Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#138d75" />
            <Text style={styles.featureText}>সম্পূর্ণ কুরআনের বাংলা অনুবাদ</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#138d75" />
            <Text style={styles.featureText}>আয়াতের তাফসীর</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#138d75" />
            <Text style={styles.featureText}>বিভিন্ন ক্বারীদের তিলাওয়াত</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ডেভেলপার সম্পর্কে</Text>
          <Text style={styles.text}>
            এই অ্যাপটি তৈরি করেছেন ইসলামিক সফটওয়্যার ডেভেলপমেন্ট টিম। আমাদের লক্ষ্য প্রযুক্তির মাধ্যমে ইসলামিক জ্ঞান ছড়িয়ে দেওয়া।
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={contactDeveloper}>
            <Text style={styles.buttonText}>ডেভেলপারের সাথে যোগাযোগ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>সংস্করণ</Text>
          <Text style={styles.text}>বর্তমান সংস্করণ: 1.0.0</Text>
          <Text style={styles.text}>আপডেট তারিখ: ২১ জুলাই, ২০২৫</Text>
          
          <TouchableOpacity style={styles.button} onPress={openWebsite}>
            <Text style={styles.buttonText}>আমাদের ওয়েবসাইট</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© ২০২৫ কুরআন বাংলা. সকল স্বত্ব সংরক্ষিত</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop : 5
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'banglaSemiBold',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'banglaRegular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    fontFamily: 'banglaRegular',
    color: '#333',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#138d75',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'banglaSemiBold',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#888',
  },
});