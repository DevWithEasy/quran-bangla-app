import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Database from "../lib/database";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toBengaliNumber } from "bengali-number";

export default function DownloadScreen() {
  const [initializing, setInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState("২.৫");
  const router = useRouter();

  const checkExistingData = async () => {
    try {
      // AsyncStorage এ চেক করুন ডাটাবেজ ইনিশিয়ালাইজড হয়েছে কিনা
      const dbInitialized = await AsyncStorage.getItem('database_initialized');
      return dbInitialized === 'true';
    } catch (error) {
      console.error('Error checking existing data:', error);
      return false;
    }
  };

  const checkDatabaseFile = async () => {
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/quran.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking database file:', error);
      return false;
    }
  };

  const initializeDatabase = async () => {
    const hasFile = await checkDatabaseFile();
    if (hasFile) {
      try {
        setCurrentStep("ডাটাবেজ লোড হচ্ছে...");
        await Database.initialize();
        return true;
      } catch (error) {
        console.error('Error initializing existing database:', error);
        return false;
      }
    }
    return false;
  };

  const handleInitialize = async () => {
    setInitializing(true);
    setShowModal(false);
    setProgress(0);

    try {
      // ধাপ ১: ডাটাবেজ ফাইল চেক
      setCurrentStep("ডাটাবেজ ফাইল চেক করা হচ্ছে...");
      setProgress(0.1);
      
      const hasExistingDb = await initializeDatabase();
      if (hasExistingDb) {
        console.log('✅ Using existing database');
        await AsyncStorage.setItem("reciter", "4");
        router.replace("/(tabs)");
        return;
      }

      // ধাপ ২: নতুন ডাটাবেজ ইনিশিয়ালাইজেশন
      setCurrentStep("ডাটাবেজ প্রস্তুত হচ্ছে...");
      setProgress(0.3);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep("ডাটাবেজ ইনিশিয়ালাইজ করা হচ্ছে...");
      setProgress(0.6);
      
      const db = await Database.initialize();
      
      setCurrentStep("ডাটাবেজ যাচাই করা হচ্ছে...");
      setProgress(0.8);
      
      // ডাটাবেজ টেস্ট ক্যুয়েরি
      const surahCount = await Database.query("SELECT COUNT(*) as count FROM surah");
      console.log('📊 Total surahs:', surahCount[0]?.count || 0);
      
      if (!surahCount[0]?.count || surahCount[0].count === 0) {
        throw new Error('ডাটাবেজে কোনো সূরা পাওয়া যায়নি');
      }

      setCurrentStep("সেটআপ সম্পন্ন হচ্ছে...");
      setProgress(1);
      
      await AsyncStorage.setItem("reciter", "4");
      
      // সাফল্যের জন্য একটু অপেক্ষা করুন
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.replace("/(tabs)");
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      
      Alert.alert(
        "ত্রুটি",
        `ডাটাবেজ ইনিশিয়ালাইজেশনে সমস্যা হয়েছে: ${error.message}`,
        [
          { 
            text: "আবার চেষ্টা করুন", 
            onPress: () => {
              Database.resetDb().then(() => {
                handleInitialize();
              });
            }
          },
          { 
            text: "বাতিল করুন", 
            style: "cancel",
            onPress: () => {
              setInitializing(false);
              setShowModal(true);
            }
          }
        ]
      );
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        // প্রথমে চেক করুন ডাটাবেজ ইতিমধ্যেই প্রস্তুত কিনা
        const hasData = await checkExistingData();
        const hasFile = await checkDatabaseFile();
        
        console.log('📊 App initialization check:', { hasData, hasFile });
        
        if (hasData && hasFile) {
          // ডাটাবেজ ইতিমধ্যে আছে, সরাসরি হোমে নিয়ে যান
          console.log('✅ Database already initialized, redirecting...');
          router.replace("/(tabs)");
        } else if (hasFile) {
          // ফাইল আছে কিন্তু ইনিশিয়ালাইজড নয়
          console.log('📁 Database file exists but not initialized');
          setShowModal(true);
        } else {
          // কোনো ফাইল নেই, ইনিশিয়ালাইজেশন প্রয়োজন
          console.log('📭 No database file found, showing modal');
          setShowModal(true);
        }
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
        setShowModal(true);
      }
    };

    initApp();
  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <View style={styles.downloadContainer}>
          <Text style={styles.title}>{currentStep}</Text>
          <Text style={styles.percentage}>
            {toBengaliNumber(Math.round(progress * 100))}%
          </Text>
          
          {/* প্রোগ্রেস বার */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
          
          <ActivityIndicator size="large" color="#138d75" style={styles.spinner} />
          
          <Text style={styles.size}>
            আনুমানিক ফাইল সাইজ: {estimatedSize} MB
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          // মডাল বন্ধ করতে দেবেন না, ইউজারকে ইনিশিয়ালাইজ করতেই হবে
          Alert.alert(
            "প্রয়োজনীয়",
            "অ্যাপটি ব্যবহার করতে ডাটাবেজ ইনিশিয়ালাইজ করা আবশ্যক।",
            [{ text: "ঠিক আছে", style: "default" }]
          );
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ডাটাবেজ সেটআপ</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📖 কুরআন মাজীদের ডাটাবেজ সেটআপ প্রয়োজন
              </Text>
              <Text style={styles.infoText}>
                💾 আনুমানিক সাইজ: {estimatedSize} MB
              </Text>
              <Text style={styles.infoText}>
                ⚡ ইন্টারনেট সংযোগ প্রয়োজন
              </Text>
              <Text style={styles.infoText}>
                ✅ একবার সেটআপ করার পর প্রয়োজন হবে না
              </Text>
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleInitialize}
              >
                <Text style={styles.buttonText}>সেটআপ শুরু করুন</Text>
              </TouchableOpacity>
              
              <Text style={styles.note}>
                প্রথমবার সেটআপ করতে কয়েক মিনিট সময় লাগতে পারে
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontFamily: "banglaSemiBold",
    marginBottom: 20,
    color: "#333333",
    textAlign: "center",
  },
  percentage: {
    fontSize: 32,
    fontFamily: "banglaSemiBold",
    color: "#138d75",
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "80%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 30,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#138d75",
    borderRadius: 4,
  },
  spinner: {
    marginBottom: 20,
  },
  size: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#666666",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "banglaSemiBold",
    marginBottom: 20,
    color: "#138d75",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "banglaRegular",
    color: "#495057",
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#138d75",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "banglaSemiBold",
    color: "#ffffff",
  },
  note: {
    fontSize: 12,
    fontFamily: "banglaRegular",
    color: "#6c757d",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});