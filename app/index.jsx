import AsyncStorage from "@react-native-async-storage/async-storage";
import { toBengaliNumber } from "bengali-number";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Database from "../lib/database";

// ফিচার লিস্ট
const APP_FEATURES = [
  {
    id: 1,
    icon: "📖",
    title: "সম্পূর্ণ বাংলা অনুবাদ",
    description:
      "হাফেজ মুনির উদ্দিন হক ও ড. আবু বকর মুহাম্মাদ যাকারিয়ার অনুবাদ",
  },
  {
    id: 2,
    icon: "🎧",
    title: "কুরআন তেলাওয়াত",
    description: "বিশিষ্ট ক্বারীদের কণ্ঠে পূর্ণ কুরআন শুনুন",
  },
  {
    id: 3,
    icon: "🔍",
    title: "দ্রুত সার্চ",
    description: "যেকোনো আয়াত বা সূরা মুহূর্তেই খুঁজে পান",
  },
  {
    id: 4,
    icon: "⭐",
    title: "ফেভারিট আয়াত",
    description: "প্রিয় আয়াতগুলো সেভ করে রাখুন",
  },
  {
    id: 5,
    icon: "📱",
    title: "অফলাইন এক্সেস",
    description: "ইন্টারনেট ছাড়াই সব সুবিধা ভোগ করুন",
  },
  {
    id: 6,
    icon: "🎓",
    title: "ভিডিও কোর্স",
    description: "বেসিক থেকে অ্যাডভান্সড কুরআন শিক্ষা",
  },
];

export default function DownloadScreen() {
  const [initializing, setInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [showFeatures, setShowFeatures] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [featureTimer, setFeatureTimer] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const router = useRouter();

  const checkDatabaseFile = async () => {
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/quran.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      return fileInfo.exists;
    } catch {
      return false;
    }
  };

  const initializeDatabase = async () => {
    try {
      const hasFile = await checkDatabaseFile();

      if (!hasFile) {
        setIsFirstTimeSetup(true);
        setCurrentStep("ডাটাবেজ প্রস্তুত হচ্ছে...");
        setProgress(5);
        await new Promise((r) => setTimeout(r, 300));

        setCurrentStep("ডাটাবেজ ফাইল তৈরি করা হচ্ছে...");
        setProgress(15);
        await new Promise((r) => setTimeout(r, 300));
      }

      setCurrentStep("ডাটাবেজ লোড হচ্ছে...");
      setProgress(30);
      await new Promise((r) => setTimeout(r, 300));

      await Database.initialize();

      setCurrentStep("ইনডেক্স তৈরি হচ্ছে...");
      setProgress(80);
      await new Promise((r) => setTimeout(r, 800));

      setCurrentStep("সেটআপ সম্পন্ন হচ্ছে...");
      setProgress(100);
      await new Promise((r) => setTimeout(r, 300));

      await AsyncStorage.setItem("reciter", "4");
      await AsyncStorage.setItem("database_initialized", "true");

      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const startFeatureRotation = () => {
    // প্রতি ২.৫ সেকেন্ডে ফিচার পরিবর্তন
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentFeatureIndex((prevIndex) =>
        prevIndex === APP_FEATURES.length - 1 ? 0 : prevIndex + 1,
      );
    }, 2500);

    setFeatureTimer(timer);

    // ১২ সেকেন্ড পর অটোমেটিক ট্যাবে নিয়ে যাবে (প্রথমবার সেটআপের জন্য)
    setTimeout(() => {
      clearInterval(timer);
      if (isFirstTimeSetup) {
        router.replace("/(tabs)");
      }
    }, 12000);
  };

  const handleAppStart = async () => {
    try {
      const isInitialized = await AsyncStorage.getItem("database_initialized");
      const hasFile = await checkDatabaseFile();

      if (isInitialized === "true" && hasFile) {
        // ডাটাবেজ ইতিমধ্যে আছে, সরাসরি হোমপেজে নিয়ে যান
        router.replace("/(tabs)");
        return;
      }

      // প্রথমবার ইনিশিয়ালাইজেশন
      setInitializing(true);
      setIsFirstTimeSetup(true);
      setProgress(0);
      setCurrentStep("");

      // প্রথমে ফিচার দেখানো শুরু করুন
      setShowFeatures(true);
      startFeatureRotation();

      // তারপর ডাটাবেজ ইনিশিয়ালাইজেশন শুরু করুন
      await initializeDatabase();

      // ডাটাবেজ তৈরি হওয়ার পর আরও ২ সেকেন্ড ফিচার দেখানোর পর রিডাইরেক্ট
      setTimeout(() => {
        if (featureTimer) {
          clearInterval(featureTimer);
        }
        router.replace("/(tabs)");
      }, 2000);
    } catch (error) {
      console.log("Error in app start:", error);
      // এরর হলেও হোমপেজে নিয়ে যান
      router.replace("/(tabs)");
    }
  };

  const handleSkipFeatures = () => {
    if (featureTimer) {
      clearInterval(featureTimer);
    }
    router.replace("/(tabs)");
  };

  useEffect(() => {
    handleAppStart();

    return () => {
      if (featureTimer) {
        clearInterval(featureTimer);
      }
    };
  }, []);

  /* ---------- Feature Showcase Screen (শুধু প্রথমবার সেটআপের সময়) ---------- */
  if (showFeatures && isFirstTimeSetup) {
    const currentFeature = APP_FEATURES[currentFeatureIndex];

    return (
      <View style={styles.container}>
        {/* উপরের অংশ: লোডিং স্ট্যাটাস */}
        <View style={styles.topSection}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>কুরআন বাংলা</Text>

          {initializing && (
            <>
              <Text style={styles.stepText}>{currentStep}</Text>

              <View style={styles.progressContainer}>
                <Text style={styles.percentage}>
                  {toBengaliNumber(Math.round(progress))}%
                </Text>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBar, { width: `${progress}%` }]}
                  />
                </View>
              </View>

              <ActivityIndicator
                size="large"
                color="#ffffff"
                style={styles.spinner}
              />
            </>
          )}
        </View>

        {/* নিচের অংশ: ফিচার ডিসপ্লে */}
        <View style={styles.bottomSection}>
          <Animated.View style={[styles.featureCard, { opacity: fadeAnim }]}>
            <Text style={styles.featureIcon}>{currentFeature.icon}</Text>
            <Text style={styles.featureTitle}>{currentFeature.title}</Text>
            <Text style={styles.featureDescription}>
              {currentFeature.description}
            </Text>
          </Animated.View>

          {/* প্রোগ্রেস ডটস */}
          <View style={styles.progressDots}>
            {APP_FEATURES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentFeatureIndex
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* তথ্য বক্স */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⏳ প্রথমবার সেটআপ চলছে, অল্প সময় অপেক্ষা করুন...
            </Text>
            <Text style={styles.infoText}>✅ পরবর্তীতে দ্রুত ওপেন হবে</Text>
          </View>
        </View>
      </View>
    );
  }

  /* ---------- শুধু লোডিং স্ক্রিন (যদি কোন কারনে ফিচার না দেখানো হয়) ---------- */
  if (initializing && !showFeatures) {
    return (
      <View style={styles.container}>
        <View style={styles.downloadContainer}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.downloadLogo}
          />

          <Text style={styles.title}>{currentStep}</Text>

          <View style={styles.progressContainer}>
            <Text style={styles.percentage}>
              {toBengaliNumber(Math.round(progress))}%
            </Text>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>

          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.spinner}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⚡ প্রথমবার সেটআপ হতে সময় লাগতে পারে
            </Text>
            <Text style={styles.infoText}>
              ✅ একবার সেটআপ করার পর প্রয়োজন হবে না
            </Text>
          </View>
        </View>
      </View>
    );
  }

  /* ---------- Initial Loading (খুব অল্প সময়ের জন্য) ---------- */
  return (
    <View style={styles.container}>
      <View style={styles.initialLoading}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.loadingLogo}
        />
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingText}>অ্যাপ চেক করা হচ্ছে...</Text>
      </View>
    </View>
  );
}

/* ================== Styles ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#138d75",
  },

  /* Feature Screen Styles */
  topSection: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
    marginBottom: 20,
  },
  stepText: {
    fontSize: 16,
    fontFamily: "banglaRegular",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  percentage: {
    fontSize: 28,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "80%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  spinner: {
    marginTop: 10,
    marginBottom: 10,
  },
  divider: {
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  dividerText: {
    fontSize: 15,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
  },
  bottomSection: {
    flex: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 26,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 20,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ffffff",
    width: 10,
    height: 10,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 16,
  },
  footer: {
    alignItems: "center",
  },
  featureCounter: {
    fontSize: 13,
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
  },
  skipButton: {
    fontSize: 14,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    marginBottom: 15,
  },
  timerBar: {
    width: "80%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  timerProgress: {
    height: "100%",
    backgroundColor: "#ffffff",
  },

  /* Download Screen Styles (বিকল্প) */
  downloadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  downloadLogo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },

  /* Initial Loading Styles */
  initialLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "banglaRegular",
    color: "#ffffff",
  },
});
