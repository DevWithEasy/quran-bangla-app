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

  const openGitHub = () => {
    Linking.openURL('https://github.com/devwitheasy');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: 0 }]}>
        {/* হেডার সেকশন */}
        <View style={styles.header}>
          <Text style={styles.appName}>কুরআন বাংলা</Text>
          <Text style={styles.appTagline}>আপনার পকেটে পূর্ণাঙ্গ কুরআন</Text>
        </View>

        {/* ফিচার কার্ড */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={24} color="#138d75" />
            <Text style={styles.sectionTitle}>নতুন আপডেটেড ফিচারসমূহ</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>ফুল অফলাইন মোড</Text>
              <Text style={styles.featureDescription}>
                ইন্টারনেট ছাড়াই সম্পূর্ণ কুরআন, অনুবাদ ও তাফসীর অ্যাক্সেস করুন
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>অফলাইন ডাটাবেজ</Text>
              <Text style={styles.featureDescription}>
                SQLite ডাটাবেজ ব্যবহার করে দ্রুত ও নিরবিচ্ছিন্ন অভিজ্ঞতা
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>কুরআন কোর্স ও লেসন</Text>
              <Text style={styles.featureDescription}>
                ধাপে ধাপে কুরআন শেখার কোর্স, তাজবিদ ও আরবি গ্রামার
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}><Text style={styles.banglaText}>ফেভারিট</Text> আয়াত সংরক্ষণ</Text>
              <Text style={styles.featureDescription}>
                প্রিয় আয়াতগুলো সেভ করুন এবং দ্রুত অ্যাক্সেস করুন
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>কাস্টমাইজড আয়াত ইমেজ</Text>
              <Text style={styles.featureDescription}>
                বিভিন্ন থিমে আয়াতের সুন্দর ইমেজ তৈরি করুন এবং শেয়ার করুন
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>অ্যাডভান্সড সার্চ</Text>
              <Text style={styles.featureDescription}>
                কীওয়ার্ড, সুরা বা আয়াত নম্বর দিয়ে দ্রুত খুঁজুন
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#138d75" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>নাইট মোড</Text>
              <Text style={styles.featureDescription}>
                চোখ বান্ধব ডার্ক থিম সহ রাতের পড়ার অভিজ্ঞতা
              </Text>
            </View>
          </View>
        </View>

        {/* টেকনোলজি স্ট্যাক */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="code" size={24} color="#2980b9" />
            <Text style={styles.sectionTitle}>টেকনোলজি স্ট্যাক</Text>
          </View>
          
          <View style={styles.techStack}>
            <View style={styles.techItem}>
              <Ionicons name="logo-react" size={20} color="#61DAFB" />
              <Text style={styles.techText}>React Native</Text>
            </View>
            
            <View style={styles.techItem}>
              <Ionicons name="logo-nodejs" size={20} color="#68A063" />
              <Text style={styles.techText}>Expo Framework</Text>
            </View>
            
            <View style={styles.techItem}>
              <Ionicons name="server" size={20} color="#8e44ad" />
              <Text style={styles.techText}>SQLite Database</Text>
            </View>
            
            <View style={styles.techItem}>
              <Ionicons name="cloud-offline" size={20} color="#d35400" />
              <Text style={styles.techText}>Offline First</Text>
            </View>
          </View>
        </View>

        {/* ডেভেলপার সেকশন */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#8e44ad" />
            <Text style={styles.sectionTitle}>ডেভেলপার সম্পর্কে</Text>
          </View>
          
          <View style={styles.developerInfo}>
            <Text style={styles.text}>
              এই অ্যাপটি তৈরি করেছেন <Text style={styles.highlight}>CodeOrbitStudio</Text>। 
              আমাদের লক্ষ্য প্রযুক্তির মাধ্যমে ইসলামিক শিক্ষা ও কুরআনের জ্ঞান সহজলভ্য করা।
            </Text>
            
            <Text style={styles.text}>
              আমরা অফলাইন ফার্স্ট অ্যাপ্লিকেশন তৈরি করতে বিশেষজ্ঞ এবং মুসলিম কমিউনিটির জন্য 
              গুণগত ডিজিটাল সমাধান প্রদান করি।
            </Text>
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={contactDeveloper}>
              <Ionicons name="mail" size={18} color="#fff" />
              <Text style={styles.buttonText}>যোগাযোগ করুন</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={openGitHub}>
              <Ionicons name="logo-github" size={18} color="#333" />
              <Text style={[styles.buttonText, { color: '#333' }]}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* সংস্করণ ও তথ্য */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#d35400" />
            <Text style={styles.sectionTitle}>তথ্য ও সংস্করণ</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>সংস্করণ</Text>
              <Text style={styles.infoValue}>1.0.2</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>আপডেট তারিখ</Text>
              <Text style={styles.infoValue}>০৬ ফেব্রুয়ারি, ২০২৬</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ডাটাবেজ</Text>
              <Text style={styles.infoValue}>SQLite v3.45</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ফাইল সাইজ</Text>
              <Text style={styles.infoValue}>~2.85 MB</Text>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.button, styles.websiteButton]} onPress={openWebsite}>
            <Ionicons name="globe" size={18} color="#fff" />
            <Text style={styles.buttonText}>আমাদের ওয়েবসাইট ভিজিট করুন</Text>
          </TouchableOpacity>
        </View>

        {/* ফুটার */}
        <View style={styles.footer}>
          <Ionicons name="heart" size={16} color="#e74c3c" />
          <Text style={styles.footerText}>
            তৈরি হয়েছে মুসলিম উম্মাহর সেবার জন্য
          </Text>
          <Text style={[styles.footerText, styles.copyright]}>
            © ২০২৫-২০২৬ কুরআন বাংলা. সকল স্বত্ব সংরক্ষিত
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 5
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'banglaSemiBold',
    color: '#138d75',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    fontFamily: 'banglaRegular',
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'banglaSemiBold',
    color: '#2c3e50',
    marginLeft: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'banglaSemiBold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#666',
    lineHeight: 20,
  },
  banglaText: {
    fontFamily: 'banglaSemiBold',
    color: '#138d75',
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  techText: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#333',
    marginLeft: 8,
  },
  developerInfo: {
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    fontFamily: 'banglaRegular',
    color: '#444',
    lineHeight: 22,
    marginBottom: 12,
  },
  highlight: {
    fontFamily: 'banglaSemiBold',
    color: '#138d75',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#138d75',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  websiteButton: {
    backgroundColor: '#2980b9',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'banglaSemiBold',
    fontSize: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'banglaSemiBold',
    color: '#2c3e50',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  copyright: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
  },
});