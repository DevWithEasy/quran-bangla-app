import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import DatabaseInitializer from "../components/DatabaseInitializer";
import { DatabaseProvider } from "../contexts/DatabaseContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    banglaRegular: require("../assets/fonts/banglaRegular.ttf"),
    banglaSemiBold: require("../assets/fonts/banglaSemiBold.ttf"),
    "me-quran": require("../assets/fonts/me_quran.ttf"),
    noorehidayat: require("../assets/fonts/noorehidayat.ttf"),
    noorehira: require("../assets/fonts/noorehira.ttf"),
    noorehuda: require("../assets/fonts/noorehuda.ttf"),
    qalam: require("../assets/fonts/qalam.ttf"),
  });

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
      <DatabaseInitializer onInitialized={() => setIsAppReady(true)}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#138d75",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontFamily: "banglaSemiBold",
            },
          }}
        >
          {/* Initial screen - shows only during database initialization */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          {/* Tabs group - main app after initialization */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          {/* Surah details page */}
          <Stack.Screen
            name="surah/[id]"
            options={{
              headerShown : false ,
              headerTitle: "সূরা বিস্তারিত",
              headerTitleStyle: {
                fontFamily: "banglaRegular",
              },
            }}
          />

          {/* Settings page */}
          <Stack.Screen
            name="settings"
            options={{
              headerTitle: "সেটিংস",
            }}
          />

          {/* About page */}
          <Stack.Screen
            name="about"
            options={{
              headerTitle: "এপ্লিকেশন সম্পর্কে",
            }}
          />

          {/* Privacy page */}
          <Stack.Screen
            name="privacy"
            options={{
              headerTitle: "গোপনীয়তা নীতি",
            }}
          />
        </Stack>
        <Toast />
      </DatabaseInitializer>
    </DatabaseProvider>
    </GestureHandlerRootView>
    
  );
}
