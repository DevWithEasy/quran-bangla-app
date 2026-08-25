import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import { usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const TABS = [
  { name: "index", label: "কুরআন", active: "book", inactive: "book-outline" },
  {
    name: "audio-book",
    label: "অডিও",
    active: "headset",
    inactive: "headset-outline",
  },
  {
    name: "favourite",
    label: "পছন্দ",
    active: "heart",
    inactive: "heart-outline",
  },
  {
    name: "learn-quran",
    label: "শিখুন",
    active: "school",
    inactive: "school-outline",
  },
];

/** Animated icon with soft pill background that scales/fades in on focus */
function TabIcon({ focused, active, inactive, color }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const glow = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    // Both values are animated on the native driver — never mix drivers
    // on parallel animations (crashes on RN 0.81+).
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.85,
        useNativeDriver: true,
        friction: 7,
        tension: 120,
      }),
      Animated.timing(glow, {
        toValue: focused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, glow]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        pointerEvents="none"
        style={[styles.iconPill, { opacity: glow }]}
      />
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <Ionicons name={focused ? active : inactive} size={24} color={color} />
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // Derive the focused tab from the actual route — no state drift
  const activeIndex = Math.max(
    TABS.findIndex((t) =>
      t.name === "index" ? pathname === "/" : pathname.startsWith(`/${t.name}`)
    ),
    0
  );

  const indicatorAnim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 9,
      tension: 110,
    }).start();
  }, [activeIndex, indicatorAnim]);

  const translateX = indicatorAnim.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * (width / TABS.length)),
  });

  // Rendered inside the tab bar so it stays aligned (edge-to-edge safe)
  const tabBarBackground = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]}>
        <View style={styles.indicatorBar} />
      </Animated.View>
    </View>
  );

  return (
    <>
      <StatusBar backgroundColor="#138d75" style="light" />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "rgba(255,255,255,0.72)",
          tabBarStyle: styles.tabBar,

          headerShown: true,
          headerStyle: styles.header,
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitle,
          headerTintColor: "#ffffff",

          tabBarHideOnKeyboard: true,
          tabBarBackground,
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title:
                tab.name === "index"
                  ? "কুরআন বাংলা"
                  : tab.name === "audio-book"
                    ? "অডিও কুরআন"
                    : tab.name === "favourite"
                      ? "পছন্দসমূহ"
                      : "কুরআন শিখুন",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  focused={focused}
                  active={tab.active}
                  inactive={tab.inactive}
                  color={color}
                />
              ),
              tabBarLabel: ({ color, focused }) => (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.labelText,
                    {
                      color,
                      fontFamily: focused
                        ? "banglaSemiBold"
                        : "banglaRegular",
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              ),
            }}
          />
        ))}
      </Tabs>
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

  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },

  iconPill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  labelText: {
    fontSize: 12,
    marginTop: 2,
  },

  indicator: {
    position: "absolute",
    top: 0,
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
  },

  indicatorBar: {
    width: 40,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "#ffffff",
  },
});
