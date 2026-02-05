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
      setProgress(5);
      setCurrentStep('ডাটাবেজ ফাইল চেক করা হচ্ছে...');

      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgress(15);
      setCurrentStep('ডাটাবেজ লোড হচ্ছে...');
      
      await Database.initialize();
      
      setProgress(80);
      setCurrentStep('ইনডেক্স তৈরি হচ্ছে...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      setCurrentStep('ডাটাবেজ প্রস্তুত!');
      
      // সামান্য দেরি করুন ইউজারকে দেখার জন্য
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsInitialized(true);
      setIsInitializing(false);
      return true;
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
        setIsInitialized(true);
      } else {
        console.log('Database not initialized, showing initial screen');
        // শুধু মার্ক করুন যে ইনিশিয়ালাইজড নয়
        setIsInitialized(false);
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
    resetDatabase: async () => {
      setIsInitialized(false);
      await AsyncStorage.removeItem('database_initialized');
    },
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};