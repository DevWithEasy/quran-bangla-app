import React, { createContext, useState, useContext, useEffect } from 'react';
import Database from '../lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const checkDatabaseStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('database_initialized');
      console.log('Database status from storage:', status);
      return status === 'true';
    } catch (error) {
      console.error('Error checking database status:', error);
      return false;
    }
  };

  const initializeDatabase = async () => {
    // চেক করুন যদি ইতিমধ্যে ইনিশিয়ালাইজেশন চলতে থাকে
    if (isInitializing) {
      console.log('Initialization already in progress');
      return;
    }

    setIsInitializing(true);
    setError(null);
    setProgress(0);
    setCurrentStep('প্রস্তুতি চলছে...');

    try {
      setProgress(0.1);
      setCurrentStep('ডাটাবেজ ফাইল চেক করা হচ্ছে...');

      // ডাটাবেজ ইনিশিয়ালাইজ করুন
      setProgress(0.3);
      setCurrentStep('ডাটাবেজ লোড হচ্ছে...');
      
      await Database.initialize();
      
      setProgress(0.8);
      setCurrentStep('ডাটাবেজ যাচাই করা হচ্ছে...');
      
      // একটি সহজ টেস্ট ক্যুয়েরি
      const surahs = await Database.getAllSurahs();
      console.log('Test query successful, found surahs:', surahs?.length || 0);
      
      if (surahs && surahs.length > 0) {
        setProgress(1);
        setCurrentStep('ডাটাবেজ প্রস্তুত!');
        
        // সামান্য দেরি করুন ইউজারকে দেখার জন্য
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsInitialized(true);
        setIsInitializing(false);
        return true;
      } else {
        throw new Error('ডাটাবেজে কোন ডাটা পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      setError(error.message);
      setIsInitializing(false);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const isReady = await checkDatabaseStatus();
      if (isReady) {
        console.log('Database already initialized in storage');
        // শুধু মার্ক করুন যে ইনিশিয়ালাইজড, কিন্তু ডাটাবেজ ওপেন করবেন না
        setIsInitialized(true);
      } else {
        console.log('Database not initialized, starting initialization');
        await initializeDatabase();
      }
    };
    
    init();
  }, []);

  const value = {
    isInitialized,
    isInitializing,
    error,
    progress,
    currentStep,
    initializeDatabase,
    resetDatabase: () => {
      setIsInitialized(false);
      AsyncStorage.removeItem('database_initialized');
    },
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};