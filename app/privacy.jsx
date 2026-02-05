import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Privacy() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>তথ্য সংগ্রহ</Text>
          <Text style={styles.text}>
            কুরআন বাংলা অ্যাপ্লিকেশনটি আপনার কোনো ব্যক্তিগত তথ্য সংগ্রহ করে না।
            অ্যাপটি ব্যবহারের সময় আমরা:
          </Text>
          <Text style={styles.listItem}>
            • কোনো ব্যক্তিগত তথ্য সংগ্রহ করি না
          </Text>
          <Text style={styles.listItem}>• কোনো ডিভাইস তথ্য সংরক্ষণ করি না</Text>
          <Text style={styles.listItem}>
            • কোনো অবস্থাতেই আপনার ডেটা তৃতীয় পক্ষের সাথে শেয়ার করি না
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>অনুমতি</Text>
          <Text style={styles.text}>
            অ্যাপটি শুধুমাত্র নিম্নলিখিত অনুমতিগুলো ব্যবহার করতে পারে:
          </Text>
          <Text style={styles.listItem}>
            • ইন্টারনেট অ্যাক্সেস (কুরআনের অডিও স্ট্রিমিং এর জন্য)
          </Text>
          <Text style={styles.listItem}>
            • স্টোরেজ অ্যাক্সেস (অফলাইন মোডে কুরআন পড়ার জন্য)
          </Text>
          <Text style={styles.text}>
            এই অনুমতিগুলো শুধুমাত্র অ্যাপের কার্যকারিতার জন্য ব্যবহার করা হয়
            এবং কোনো ব্যক্তিগত তথ্য সংগ্রহ করার জন্য নয়।
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>তৃতীয় পক্ষের সেবা</Text>
          <Text style={styles.text}>
            আমরা তৃতীয় পক্ষের কোনো বিজ্ঞাপন বা বিশ্লেষণ সেবা ব্যবহার করি না।
            তবে, অ্যাপে কুরআনের অডিও তিলাওয়াতের জন্য কিছু বাহ্যিক লিঙ্ক থাকতে
            পারে।
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>নীতিতে পরিবর্তন</Text>
          <Text style={styles.text}>
            আমরা আমাদের গোপনীয়তা নীতিতে প্রয়োজনীয় পরিবর্তন আনতে পারি। কোনো
            পরিবর্তন করা হলে আমরা অ্যাপের মাধ্যমে আপনাকে জানাবো।
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            এই নীতি শেষ আপডেট: ০৬ ফেব্রুয়ারি, ২০২৬
          </Text>
          <Text style={styles.footerText}>
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
    paddingBottom: 16,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    color: "#2c3e50",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  text: {
    fontSize: 15,
    fontFamily: "banglaRegular",
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    fontFamily: "banglaRegular",
    color: "#333",
    lineHeight: 24,
    marginLeft: 10,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#888",
    marginBottom: 8,
  },
});
