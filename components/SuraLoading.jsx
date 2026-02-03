import { StyleSheet, View, Animated, SafeAreaView } from "react-native";
import { useEffect, useRef } from "react";

export default function SuraLoading() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  // ৫টি স্কেলেটন আইটেম তৈরি
  const skeletonItems = Array(5).fill(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* হেডার স্কেলেটন */}
      <View style={styles.headerSkeleton}>
        <View style={styles.headerBack} />
        <View style={styles.headerTitle} />
        <View style={styles.headerSettings} />
      </View>

      {/* বডি */}
      <View style={styles.container}>
        {skeletonItems.map((_, index) => (
          <Animated.View key={index} style={[styles.skeletonItem, { opacity }]}>
            <View style={styles.skeletonContainer}>
              {/* সূরা নম্বর স্কেলেটন */}
              <View style={styles.skeletonNumber} />

              {/* সূরা তথ্য স্কেলেটন */}
              <View style={styles.skeletonInfo}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />

                <View style={styles.skeletonDetails}>
                  <View style={styles.skeletonIcon} />
                  <View
                    style={[styles.skeletonLine, styles.skeletonLineMedium]}
                  />
                  <View
                    style={[styles.skeletonLine, styles.skeletonLineSmall]}
                  />
                </View>
              </View>

              {/* আরবি নাম স্কেলেটন */}
              <View style={styles.skeletonArabic}>
                <View
                  style={[styles.skeletonLine, styles.skeletonArabicLine]}
                />
                <View
                  style={[styles.skeletonLine, styles.skeletonLineVeryShort]}
                />
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  headerSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#138d75",
  },
  headerBack: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  headerTitle: {
    width: 120,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  headerSettings: {
    width: 22,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  skeletonItem: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  skeletonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonNumber: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
  },
  skeletonInfo: {
    flex: 1,
    marginRight: 10,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLineShort: {
    width: "60%",
  },
  skeletonLineMedium: {
    width: "40%",
    marginBottom: 0,
    marginRight: 8,
  },
  skeletonLineSmall: {
    width: "30%",
    marginBottom: 0,
  },
  skeletonLineVeryShort: {
    width: "50%",
    marginTop: 4,
  },
  skeletonArabicLine: {
    width: 80,
    height: 16,
  },
  skeletonDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  skeletonIcon: {
    width: 14,
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 7,
    marginRight: 6,
  },
  skeletonArabic: {
    alignItems: "flex-end",
    minWidth: 80,
  },
});
