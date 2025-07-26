import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Home",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="quran"
          options={{
            title: "Quran",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="surah/[id]"
          options={{
            headerTitle: "Surah Details",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerTitle: "সেটিংস",
            headerTitleStyle: {
              fontFamily: "banglaRegular",
              color: "#138d75",
            },
          }}
        />
      </Stack>
      <Toast />
    </>
  );
}