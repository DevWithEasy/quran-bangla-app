import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSettingsStore = create((set) => ({
  arabicFont: 'me-quran',
  reciter: 1,
  arabicFontSize: 20,
  banglaFontSize: 16,
  translator: 'bn_muhi',
  lastSura: null,

  loadSettings: async () => {
    try {
      const [font, reciter, arabicSize, banglaSize, translator, lastSura] = await Promise.all([
        AsyncStorage.getItem('arabicFont'),
        AsyncStorage.getItem('reciter'),
        AsyncStorage.getItem('arabicFontSize'),
        AsyncStorage.getItem('banglaFontSize'),
        AsyncStorage.getItem('translator'),
        AsyncStorage.getItem('lastReadSurah'),
      ]);

      // ডিফল্ট ভ্যালু এবং ভ্যালিডেশন যোগ করুন
      set({
        arabicFont: font || 'me-quran',
        reciter: reciter ? Math.max(1, parseInt(reciter)) : 1,
        arabicFontSize: arabicSize ? Math.max(16, parseInt(arabicSize)) : 20,
        banglaFontSize: banglaSize ? Math.max(14, parseInt(banglaSize)) : 16,
        translator: translator || 'tr_bn_muhi',
        lastSura: lastSura ? JSON.parse(lastSura) : null,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({
        arabicFont: 'me-quran',
        reciter: 1,
        arabicFontSize: 24,
        banglaFontSize: 16,
        translator: 'tr_bn_muhi',
        lastSura: null,
      });
    }
  },

  updateSetting: async (key, value) => {
    try {
      // ভ্যালিডেশন যোগ করুন
      let validatedValue = value;
      if (key === 'arabicFontSize' || key === 'banglaFontSize') {
        validatedValue = Math.max(14, parseInt(value));
      } else if (key === 'reciter') {
        validatedValue = Math.max(1, parseInt(value));
      }

      await AsyncStorage.setItem(key, typeof validatedValue === 'object' ? JSON.stringify(validatedValue) : validatedValue.toString());
      set({ [key]: validatedValue });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  },
}));

export default useSettingsStore;