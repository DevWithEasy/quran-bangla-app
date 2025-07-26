import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSettingsStore = create((set) => ({
  arabicFont: 'me-quran',
  reciter: 1,
  arabicFontSize: 20,
  banglaFontSize: 16,
  translator: 'bn_muhi',
  lastSura: null,
  showBanglaTranslation: true,
  showBanglaTafseer: true,
  showEnglishTranslation: false,

  loadSettings: async () => {
    try {
      const [
        font, 
        reciter, 
        arabicSize, 
        banglaSize, 
        translator, 
        lastSura,
        showBanglaTranslation,
        showBanglaTafseer,
        showEnglishTranslation
      ] = await Promise.all([
        AsyncStorage.getItem('arabicFont'),
        AsyncStorage.getItem('reciter'),
        AsyncStorage.getItem('arabicFontSize'),
        AsyncStorage.getItem('banglaFontSize'),
        AsyncStorage.getItem('translator'),
        AsyncStorage.getItem('lastReadSurah'),
        AsyncStorage.getItem('showBanglaTranslation'),
        AsyncStorage.getItem('showBanglaTafseer'),
        AsyncStorage.getItem('showEnglishTranslation'),
      ]);

      set({
        arabicFont: font || 'me-quran',
        reciter: reciter ? Math.max(1, parseInt(reciter)) : 1,
        arabicFontSize: arabicSize ? Math.max(16, parseInt(arabicSize)) : 20,
        banglaFontSize: banglaSize ? Math.max(14, parseInt(banglaSize)) : 16,
        translator: translator || 'bn_muhi',
        lastSura: lastSura ? JSON.parse(lastSura) : null,
        showBanglaTranslation: showBanglaTranslation === null ? true : showBanglaTranslation === 'true',
        showBanglaTafseer: showBanglaTafseer === null ? true : showBanglaTafseer === 'true',
        showEnglishTranslation: showEnglishTranslation === null ? false : showEnglishTranslation === 'true',
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
        showBanglaTranslation: true,
        showBanglaTafseer: true,
        showEnglishTranslation: false,
      });
    }
  },

  updateSetting: async (key, value) => {
    try {
      let validatedValue = value;
      if (key === 'arabicFontSize' || key === 'banglaFontSize') {
        validatedValue = Math.max(14, parseInt(value));
      } else if (key === 'reciter') {
        validatedValue = Math.max(1, parseInt(value));
      }

      await AsyncStorage.setItem(
        key, 
        typeof validatedValue === 'object' 
          ? JSON.stringify(validatedValue) 
          : validatedValue.toString()
      );
      set({ [key]: validatedValue });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  },
}));

export default useSettingsStore;