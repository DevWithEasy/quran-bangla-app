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

  const tabs = [
    {
      name: "index",
      label: "কুরআন",
      icon: { active: "book", inactive: "book-outline" },
      headerTitle: "কুরআন বাংলা",
    },
    {
      name: "audio-book",
      label: "অডিও",
      icon: { active: "headset", inactive: "headset-outline" },
      headerTitle: "অডিও কুরআন",
    },
    {
      name: "favourite",
      label: "পছন্দ",
      icon: { active: "heart", inactive: "heart-outline" },
      headerTitle: "পছন্দসমূহ",
    },
    {
      name: "learn-quran",
      label: "শিখুন",
      icon: { active: "school", inactive: "school-outline" },
      headerTitle: "কুরআন শিখুন",
    },
  ];

  const handleTabPress = (index, onPress) => {
    // First animate the indicator
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();

    // Update active tab state
    setActiveTab(tabs[index].name);

    // Call the original onPress handler
    if (onPress) {
      onPress();
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#138d75" barStyle="light-content" />

      <Tabs
        screenOptions={({ route }) => {
          const index = tabs.findIndex((tab) => tab.name === route.name);
          const isActive = activeTab === route.name;

          return {
            tabBarActiveTintColor: "#ffffff",
            tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
            tabBarStyle: styles.tabBar,
            headerShown : false,
            headerTitleAlign: "center",
            headerTintColor: "#ffffff",
            headerShadowVisible: true,
            tabBarHideOnKeyboard: true,
            tabBarShowLabel: true,
            tabBarLabel: ({ color }) => (
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.labelText,
                    {
                      color,
                      fontFamily: isActive ? "banglaSemiBold" : "banglaRegular",
                    },
                  ]}
                >
                  {tabs[index]?.label || ""}
                </Text>
              </View>
            ),
            tabBarIcon: ({ color }) => {
              const tab = tabs[index];
              const iconName = isActive ? tab.icon.active : tab.icon.inactive;

              return (
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconWrapper,
                      isActive && styles.iconWrapperActive,
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={isActive ? 26 : 22}
                      color={color}
                    />
                  </View>
                  {isActive && <View style={styles.activeDot} />}
                </View>
              );
            },
          };
        }}
      >
        {tabs.map((tab, index) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              headerTitle: tab.headerTitle,
              tabBarButton: (props) => {
                // Extract the onPress handler
                const { onPress, ...otherProps } = props;

                return (
                  <View
                    {...otherProps}
                    onTouchStart={() => handleTabPress(index, onPress)}
                    style={styles.tabButton}
                  >
                    {/* Content will be rendered by tabBarIcon and tabBarLabel */}
                  </View>
                );
              },
            }}
          />
        ))}
      </Tabs>

      {/* Active Tab Indicator */}
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
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 24,
    backgroundColor: "#138d75",
    zIndex: 1000,
  },
  tabBar: {
    backgroundColor: "#138d75",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: 70,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: "relative",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 2,
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
  header: {
    backgroundColor: "#138d75",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontFamily: "banglaSemiBold",
    fontSize: 18,
    color: "#ffffff",
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
