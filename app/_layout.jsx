import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { DatabaseProvider } from "../contexts/DatabaseContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    banglaRegular: require("../assets/fonts/banglaRegular.ttf"),
    banglaSemiBold: require("../assets/fonts/banglaSemiBold.ttf"),
    "me-quran": require("../assets/fonts/me_quran.ttf"),
    noorehidayat: require("../assets/fonts/noorehidayat.ttf"),
    noorehira: require("../assets/fonts/noorehira.ttf"),
    noorehuda: require("../assets/fonts/noorehuda.ttf"),
    qalam: require("../assets/fonts/qalam.ttf"),
  });

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
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#138d75",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontFamily: "banglaSemiBold",
            },
            headerBackTitleVisible: false,
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

          {/* Surah details page - DYNAMIC TITLE */}
          <Stack.Screen
            name="surah/[id]"
            options={({ route }) => ({
              headerTitle: "",
              headerTitleStyle: {
                fontFamily: "banglaRegular",
              },
              headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/settings")}>
                  <Ionicons name="settings" color="#ffffff" size={20} />
                </TouchableOpacity>
              ),
            })}
          />

          <Stack.Screen
            name="surah/[surah]/[ayah]"
            options={({ route }) => ({
              headerTitle: "",
              headerTitleStyle: {
                fontFamily: "banglaRegular",
              },
            })}
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
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
