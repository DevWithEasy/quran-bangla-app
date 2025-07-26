import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatTime } from "../utils/formatTime";

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
        setCurrentReciterName(reciter.name);
      }
    }
  }, [reciters, selectedReciter]);

  return (
    <View style={styles.playerContainer}>
      <View style={styles.playerHeader}>
        <Text style={styles.surahName} numberOfLines={1}>
          {currentSurah?.name_bn} - {currentReciterName}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(playerStatus.positionMillis)}
        </Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={playerStatus.durationMillis}
            value={playerStatus.positionMillis}
            onSlidingComplete={onSeek}
            minimumTrackTintColor="#138d75"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#138d75"
          />
        </View>
        <Text style={styles.timeText}>
          {formatTime(playerStatus.durationMillis)}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={28} color="#138d75" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
          <Ionicons
            name={playerStatus.isPlaying ? "pause" : "play"}
            size={36}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="stop-circle" size={28} color="#e74c3c" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={28} color="#138d75" />
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
  },
  playerHeader: {
    marginBottom: 10,
  },
  surahName: {
    fontFamily: "banglaSemiBold",
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 10,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  controlButton: {
    padding: 10,
  },
  playPauseButton: {
    backgroundColor: "#138d75",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginHorizontal: 5,
  },
  closeButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
