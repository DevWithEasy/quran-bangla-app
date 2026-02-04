import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function TabsLayout() {
  const [activeTab, setActiveTab] = useState("index");
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = width / 4;

  const handleTabPress = (index, name, onPress) => {
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();

    setActiveTab(name);

    if (onPress) onPress();
  };

  const renderIcon = (isActive, active, inactive, color) => (
    <View style={styles.iconContainer}>
      <View
        style={[
          styles.iconWrapper,
          isActive && styles.iconWrapperActive,
        ]}
      >
        <Ionicons
          name={isActive ? active : inactive}
          size={isActive ? 26 : 22}
          color={color}
        />
      </View>
      {isActive && <View style={styles.activeDot} />}
    </View>
  );

  const renderLabel = (label, isActive, color) => (
    <View style={styles.labelContainer}>
      <Text
        style={[
          styles.labelText,
          {
            color,
            fontFamily: isActive
              ? "banglaSemiBold"
              : "banglaRegular",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <>
      <StatusBar backgroundColor="#138d75" style="light" />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
          tabBarStyle: styles.tabBar,

          headerShown: true,
          headerStyle: styles.header,
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitle,
          headerTintColor: "#ffffff",

          tabBarHideOnKeyboard: true,
        }}
      >
        {/* ---------- Quran ---------- */}
        <Tabs.Screen
          name="index"
          options={{
            title: "কুরআন বাংলা",
            tabBarIcon: ({ color }) =>
              renderIcon(
                activeTab === "index",
                "book",
                "book-outline",
                color
              ),
            tabBarLabel: ({ color }) =>
              renderLabel(
                "কুরআন",
                activeTab === "index",
                color
              ),
            tabBarButton: (props) => {
              const { onPress, ...rest } = props;
              return (
                <View
                  {...rest}
                  onTouchStart={() =>
                    handleTabPress(0, "index", onPress)
                  }
                  style={styles.tabButton}
                />
              );
            },
          }}
        />

        {/* ---------- Audio ---------- */}
        <Tabs.Screen
          name="audio-book"
          options={{
            title: "অডিও কুরআন",
            tabBarIcon: ({ color }) =>
              renderIcon(
                activeTab === "audio-book",
                "headset",
                "headset-outline",
                color
              ),
            tabBarLabel: ({ color }) =>
              renderLabel(
                "অডিও",
                activeTab === "audio-book",
                color
              ),
            tabBarButton: (props) => {
              const { onPress, ...rest } = props;
              return (
                <View
                  {...rest}
                  onTouchStart={() =>
                    handleTabPress(1, "audio-book", onPress)
                  }
                  style={styles.tabButton}
                />
              );
            },
          }}
        />

        {/* ---------- Favorite ---------- */}
        <Tabs.Screen
          name="favourite"
          options={{
            title: "পছন্দসমূহ",
            tabBarIcon: ({ color }) =>
              renderIcon(
                activeTab === "favourite",
                "heart",
                "heart-outline",
                color
              ),
            tabBarLabel: ({ color }) =>
              renderLabel(
                "পছন্দ",
                activeTab === "favourite",
                color
              ),
            tabBarButton: (props) => {
              const { onPress, ...rest } = props;
              return (
                <View
                  {...rest}
                  onTouchStart={() =>
                    handleTabPress(2, "favourite", onPress)
                  }
                  style={styles.tabButton}
                />
              );
            },
          }}
        />

        {/* ---------- Learn ---------- */}
        <Tabs.Screen
          name="learn-quran"
          options={{
            title: "কুরআন শিখুন",
            tabBarIcon: ({ color }) =>
              renderIcon(
                activeTab === "learn-quran",
                "school",
                "school-outline",
                color
              ),
            tabBarLabel: ({ color }) =>
              renderLabel(
                "শিখুন",
                activeTab === "learn-quran",
                color
              ),
            tabBarButton: (props) => {
              const { onPress, ...rest } = props;
              return (
                <View
                  {...rest}
                  onTouchStart={() =>
                    handleTabPress(3, "learn-quran", onPress)
                  }
                  style={styles.tabButton}
                />
              );
            },
          }}
        />
      </Tabs>

      {/* Indicator */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [
              {
                translateX: indicatorAnim.interpolate({
                  inputRange: [0, 3],
                  outputRange: [0, 3 * tabWidth],
                }),
              },
            ],
            width: tabWidth,
          },
        ]}
      >
        <View style={styles.indicatorBar} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#138d75",
    borderTopWidth: 0,
    elevation: 8,
    height: 70,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    paddingTop: 8,
  },

  header: {
    backgroundColor: "#138d75",
    elevation: 4,
  },

  headerTitle: {
    fontFamily: "banglaSemiBold",
    fontSize: 18,
    color: "#ffffff",
  },

  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  iconWrapperActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: [{ scale: 1.1 }],
  },

  activeDot: {
    position: "absolute",
    bottom: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },

  labelContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  labelText: {
    fontSize: 12,
    marginTop: 2,
  },

  activeIndicator: {
    position: "absolute",
    bottom: 68,
    height: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  indicatorBar: {
    width: 40,
    height: 2,
    backgroundColor: "#ffffff",
    borderRadius: 1,
  },
});
