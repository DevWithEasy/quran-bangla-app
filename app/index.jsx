import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { toBengaliNumber } from "bengali-number";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Database from "../lib/database";

const COLORS = {
  primary: "#138d75",
  primaryDark: "#0b5e4e",
  primaryLight: "#1aa389",
  white: "#ffffff",
  heading: "#0c4f42",
  body: "#5b6b67",
};

// ফিচার লিস্ট
const APP_FEATURES = [
  {
    id: 1,
    icon: "book",
    title: "সম্পূর্ণ বাংলা অনুবাদ",
    description:
      "হাফেজ মুনির উদ্দিন হক ও ড. আবু বকর মুহাম্মাদ যাকারিয়ার অনুবাদ",
  },
  {
    id: 2,
    icon: "headset",
    title: "কুরআন তেলাওয়াত",
    description: "বিশিষ্ট ক্বারীদের কণ্ঠে পূর্ণ কুরআন শুনুন",
  },
  {
    id: 3,
    icon: "search",
    title: "দ্রুত সার্চ",
    description: "যেকোনো আয়াত বা সূরা মুহূর্তেই খুঁজে পান",
  },
  {
    id: 4,
    icon: "heart",
    title: "ফেভারিট আয়াত",
    description: "প্রিয় আয়াতগুলো সেভ করে রাখুন",
  },
  {
    id: 5,
    icon: "cloud-offline",
    title: "অফলাইন এক্সেস",
    description: "ইন্টারনেট ছাড়াই সব সুবিধা ভোগ করুন",
  },
  {
    id: 6,
    icon: "school",
    title: "ভিডিও কোর্স",
    description: "বেসিক থেকে অ্যাডভান্সড কুরআন শিক্ষা",
  },
];

export default function DownloadScreen() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [showFeatures, setShowFeatures] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const featureTimerRef = useRef(null);
  const isFirstTimeRef = useRef(false);

  const router = useRouter();

  /* লোগোতে হালকা পালস অ্যানিমেশন */
  useEffect(() => {
      Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  /* প্রোগ্রেস বার স্মুথ অ্যানিমেশন */
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress]);

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
        isFirstTimeRef.current = true;
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
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 14,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      setCurrentFeatureIndex((prevIndex) =>
        prevIndex === APP_FEATURES.length - 1 ? 0 : prevIndex + 1,
      );
    }, 2500);

    featureTimerRef.current = timer;

    // ১২ সেকেন্ড পর অটোমেটিক ট্যাবে নিয়ে যাবে (প্রথমবার সেটআপের জন্য)
    setTimeout(() => {
      clearInterval(timer);
      if (isFirstTimeRef.current) {
        router.replace("/(tabs)");
      }
    }, 12000);
  };

  const handleAppStart = async () => {
    try {
      const isInitialized = await AsyncStorage.getItem("database_initialized");
      const hasFile = await checkDatabaseFile();

      if (isInitialized === "true" && hasFile) {
        // ডাটাবেজ ইতিমধ্যে আছে, সরাসরি হোমপেজে নিয়ে যান
        router.replace("/(tabs)");
        return;
      }

      // প্রথমবার ইনিশিয়ালাইজেশন
      isFirstTimeRef.current = true;
      setProgress(0);
      setCurrentStep("");

      // প্রথমে ফিচার দেখানো শুরু করুন
      setShowFeatures(true);
      startFeatureRotation();

      // তারপর ডাটাবেজ ইনিশিয়ালাইজেশন শুরু করুন
      await initializeDatabase();

      // ডাটাবেজ তৈরি হওয়ার পর আরও ২ সেকেন্ড ফিচার দেখানোর পর রিডাইরেক্ট
      setTimeout(() => {
        if (featureTimerRef.current) {
          clearInterval(featureTimerRef.current);
        }
        router.replace("/(tabs)");
      }, 2000);
    } catch (error) {
      console.log("Error in app start:", error);
      // এরর হলেও হোমপেজে নিয়ে যান
      router.replace("/(tabs)");
    }
  };

  const handleSkipFeatures = () => {
    if (featureTimerRef.current) {
      clearInterval(featureTimerRef.current);
    }
    router.replace("/(tabs)");
  };

  useEffect(() => {
    handleAppStart();

    return () => {
      if (featureTimerRef.current) {
        clearInterval(featureTimerRef.current);
      }
    };
  }, []);

  /* ---------- Feature Showcase Screen (শুধু প্রথমবার সেটআপের সময়) ---------- */
  if (showFeatures) {
    const currentFeature = APP_FEATURES[currentFeatureIndex];

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* ---------- উপরের গ্রেডিয়েন্ট অংশ: লোগো + প্রোগ্রেস ---------- */}
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
          style={styles.topSection}
        >
          <Animated.Image
            source={require("../assets/images/icon.png")}
            style={[styles.logo, { transform: [{ scale: pulseAnim }] }]
            }
          />

          <Text style={styles.title}>কুরআন বাংলা</Text>
          <Text style={styles.subtitle}>
            সম্পূর্ণ কুরআন — বাংলা অনুবাদসহ
          </Text>

          {/* গ্লাস প্রোগ্রেস কার্ড */}
          <View style={styles.glassCard}>
            <View style={styles.stepRow}>
              <Text style={styles.stepText}>{currentStep}</Text>
              <Text style={styles.percentage}>
                {toBengaliNumber(Math.round(progress))}%
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              />
            </View>

            <ActivityIndicator
              size="small"
              color="rgba(255, 255, 255, 0.9)"
              style={styles.spinner}
            />
          </View>
        </LinearGradient>

        {/* ---------- নিচের সাদা শীট: ফিচার শোকেস ---------- */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetLabel}>অ্যাপের বৈশিষ্ট্যসমূহ</Text>

          <Animated.View
            style={[
              styles.featureCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.featureIconWrap}>
              <Ionicons
                name={currentFeature.icon}
                size={32}
                color={COLORS.primary}
              />
            </View>
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

          {/* তথ্য রো */}
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Ionicons
                name="time"
                size={16}
                color={COLORS.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                প্রথমবার সেটআপ চলছে, অল্প সময় অপেক্ষা করুন...
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>পরবর্তীতে দ্রুত ওপেন হবে</Text>
            </View>
          </View>

          {/* স্কিপ বাটন */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipFeatures}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>এড়িয়ে যান</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------- Initial Loading (খুব অল্প সময়ের জন্য) ---------- */
  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.initialLoading}>
        <Animated.Image
          source={require("../assets/images/icon.png")}
          style={[
            styles.loadingLogo,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingText}>অ্যাপ চেক করা হচ্ছে...</Text>
      </View>
    </LinearGradient>
  );
}

/* ================== Styles ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },

  /* ---------- Top Gradient Section ---------- */
  topSection: {
    flex: 1.15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  title: {
    fontSize: 30,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 6,
    marginBottom: 26,
  },

  /* Glass progress card */
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 19,
    marginRight: 10,
  },
  percentage: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  spinner: {
    marginTop: 14,
  },

  /* ---------- Bottom White Sheet ---------- */
  bottomSheet: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#dbe4e1",
    marginBottom: 14,
  },
  sheetLabel: {
    fontSize: 12,
    fontFamily: "banglaSemiBold",
    color: "#93a39f",
    letterSpacing: 1,
    marginBottom: 16,
  },

  featureCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  featureIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(19, 141, 117, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 21,
    fontFamily: "banglaSemiBold",
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 30,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: COLORS.body,
    textAlign: "center",
    lineHeight: 23,
    paddingHorizontal: 10,
  },

  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 22,
  },
  inactiveDot: {
    backgroundColor: "#dbe4e1",
    width: 8,
  },

  infoList: {
    width: "100%",
    backgroundColor: "rgba(19, 141, 117, 0.06)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: "banglaRegular",
    color: COLORS.body,
    lineHeight: 19,
  },

  skipButton: {
    width: "100%",
    backgroundColor: "rgba(19, 141, 117, 0.1)",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: "banglaSemiBold",
    color: COLORS.primary,
  },

  /* ---------- Initial Loading Screen ---------- */
  initialLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 32,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "banglaRegular",
    color: "rgba(255, 255, 255, 0.85)",
  },
});
