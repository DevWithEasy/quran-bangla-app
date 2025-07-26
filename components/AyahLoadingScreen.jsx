import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

export default function AyahLoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current; // opacity এর জন্য ভ্যালু

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    // কম্পোনেন্ট আনমাউন্ট হলে এনিমেশন স্টপ করুন
    return () => pulse.stop();
  }, [pulseAnim]);

  // Animated.View দিয়ে বক্সগুলোকে র‍্যাপ করে opacity কে এনিমেট করা হবে
  return (
    <View style={{ padding: 16 }}>
      <Animated.View
        style={[
          styles.headerPulse,
          {
            opacity: pulseAnim,
          },
        ]}
      />

      {[...Array(5)].map((_, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <Animated.View
            style={[
              styles.ayahBox,
              { opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.ayahLine,
              { opacity: pulseAnim, width: "90%" },
            ]}
          />
          <Animated.View
            style={[
              styles.ayahLine,
              { opacity: pulseAnim, width: "80%" },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerPulse: {
    alignSelf: "center",
    width: 200,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#eeeeee",
    marginBottom: 20,
  },
  ayahBox: {
    width: "100%",
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  ayahLine: {
    height: 20,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginTop: 6,
  },
});
