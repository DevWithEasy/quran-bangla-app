import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      // ===== Default Settings =====
      arabicFont: "me-quran",
      reciter: 1,
      arabicFontSize: 22,
      banglaFontSize: 14,
      translator: "bn_muhi",

      showBanglaTranslation: true,
      showBanglaTafseer: true,
      showEnglishTranslation: false,

      // ===== Update Any Setting =====
      updateSetting: (key, value) =>
        set((state) => {
          let validatedValue = value;

          if (key === "arabicFontSize" || key === "banglaFontSize") {
            validatedValue = Math.max(14, parseInt(value));
          }

          if (key === "reciter") {
            validatedValue = Math.max(1, parseInt(value));
          }

          return { ...state, [key]: validatedValue };
        }),

      // ===== Reset Settings =====
      resetSettings: () =>
        set({
          arabicFont: "me-quran",
          reciter: 1,
          arabicFontSize: 20,
          banglaFontSize: 16,
          translator: "bn_muhi",
          showBanglaTranslation: true,
          showBanglaTafseer: true,
          showEnglishTranslation: false,
        }),
    }),
    {
      name: "quran-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useSettingsStore;
