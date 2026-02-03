import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '../contexts/DatabaseContext';
import { toBengaliNumber } from 'bengali-number';

const DatabaseInitializer = ({ children }) => {
  const { 
    isInitialized, 
    isInitializing, 
    error, 
    progress, 
    currentStep 
  } = useDatabase();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isInitialized && !isInitializing && !redirecting) {
      console.log('Redirecting to /quran...');
      setRedirecting(true);
      
      // 500ms দেরি করুন ইউজারকে দেখার জন্য
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    }
  }, [isInitialized, isInitializing, redirecting]);

  // যদি এরর থাকে
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#f8d7da" barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ডাটাবেজ ত্রুটি</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.solutionText}>
            দয়া করে অ্যাপটি বন্ধ করে পুনরায় চালু করুন
          </Text>
        </View>
      </View>
    );
  }

  // যদি লোডিং চলতে থাকে
  if (isInitializing || !isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#138d75" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{currentStep}</Text>
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${progress * 100}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>
                {toBengaliNumber(Math.round(progress * 100))}%
              </Text>
            </View>
          )}
          {!progress && (
            <Text style={styles.hintText}>
              প্রথমবার ব্যবহারের জন্য কিছু সময় লাগতে পারে
            </Text>
          )}
        </View>
      </View>
    );
  }

  // যদি সবকিছু ঠিক থাকে
  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#138d75',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: 'banglaSemiBold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
  hintText: {
    marginTop: 30,
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 30,
    width: '80%',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 5,
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'banglaSemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 30,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'banglaSemiBold',
    color: '#721c24',
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'banglaRegular',
    color: '#721c24',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  solutionText: {
    fontSize: 14,
    fontFamily: 'banglaRegular',
    color: '#721c24',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DatabaseInitializer;