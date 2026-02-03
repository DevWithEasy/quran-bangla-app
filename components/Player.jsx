import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";

const formatTime = (millis) => {
  if (!millis) return "00:00";
  
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function Player({
  currentSurah,
  reciters,
  selectedReciter,
  togglePlayPause,
  playerStatus,
  onNext,
  onPrevious,
  onSeek,
  onClose,
}) {
  const [currentReciterName, setCurrentReciterName] = useState("");

  useEffect(() => {
    if (reciters && selectedReciter) {
      const reciter = reciters.find((r) => r.id === selectedReciter);
      if (reciter) {
        setCurrentReciterName(reciter.name_bn || reciter.name);
      }
    }
  }, [reciters, selectedReciter]);

  return (
    <View style={styles.playerContainer}>
      <View style={styles.playerHeader}>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName} numberOfLines={1}>
            {currentSurah?.name_bn}
          </Text>
          <Text style={styles.reciterName} numberOfLines={1}>
            {currentReciterName}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color="#7f8c8d" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(playerStatus.positionMillis)}
        </Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={playerStatus.durationMillis || 1}
            value={playerStatus.positionMillis}
            onSlidingComplete={onSeek}
            minimumTrackTintColor="#138d75"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#138d75"
            tapToSeek={true}
          />
        </View>
        <Text style={styles.timeText}>
          {formatTime(playerStatus.durationMillis)}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={30} color="#138d75" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
          <Ionicons
            name={playerStatus.isPlaying ? "pause" : "play"}
            size={32}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={30} color="#138d75" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  surahInfo: {
    flex: 1,
    marginRight: 12,
  },
  surahName: {
    fontFamily: "banglaSemiBold",
    fontSize: 18,
    color: "#2c3e50",
    marginBottom: 2,
  },
  reciterName: {
    fontFamily: "banglaRegular",
    fontSize: 14,
    color: "#7f8c8d",
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeText: {
    fontFamily: "banglaRegular",
    fontSize: 12,
    color: "#666",
    minWidth: 50,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  playPauseButton: {
    backgroundColor: "#138d75",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#138d75",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});