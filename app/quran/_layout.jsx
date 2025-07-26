import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Image, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.appName}>কুরআন বাংলা</Text>
        <Text style={styles.appVersion}>বর্তমান সংস্করণ: ১.০.০</Text>
      </View>
      <DrawerItemList
        {...props}
        activeTintColor="#ffffff"
        inactiveTintColor="#138d75"
        activeBackgroundColor="#138d75"
        labelStyle={styles.drawerLabel}
      />
    </DrawerContentScrollView>
  );
}

export default function Layout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTitleStyle: {
            fontFamily: "banglaRegular",
            color: "#138d75",
          },
          drawerActiveTintColor: "#ffffff",
          drawerInactiveTintColor: "#138d75",
          drawerActiveBackgroundColor: "#138d75",
          drawerLabelStyle: {
            fontFamily: "banglaSemiBold",
          },
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 8,
            marginVertical: 4,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "হোম",
            title: "কুরআন বাংলা",
            headerShown: false,
            drawerIcon: ({ focused, color, size }) => (
              <Ionicons
                name="home"
                size={18}
                color={focused ? "#ffffff" : "#138d75"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="audio-book"
          options={{
            drawerLabel: "অডিও কুরআন",
            title: "অডিও কুরআন",
            drawerIcon: ({ focused, color, size }) => (
              <Ionicons
                name="play-circle"
                size={size}
                color={focused ? "#ffffff" : "#138d75"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="about"
          options={{
            drawerLabel: "অ্যাপ সম্পর্কে",
            title: "অ্যাপ সম্পর্কে",
            drawerIcon: ({ focused, color, size }) => (
              <Ionicons
                name="information-circle"
                size={size}
                color={focused ? "#ffffff" : "#138d75"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="privacy"
          options={{
            drawerLabel: "গোপনীয়তা নীতি",
            title: "গোপনীয়তা নীতি",
            drawerIcon: ({ focused, color, size }) => (
              <Ionicons
                name="lock-closed"
                size={size}
                color={focused ? "#ffffff" : "#138d75"}
              />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
    
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontFamily: "banglaSemiBold",
    marginBottom: 4,
    color: "#138d75",
  },
  appVersion: {
    fontSize: 14,
    color: "#888",
    fontFamily: "banglaRegular",
  },
  drawerLabel: {
    fontFamily: "banglaSemiBold",
  },
});
