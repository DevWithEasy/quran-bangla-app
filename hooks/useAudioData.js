import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useState } from "react";

const LOCAL_DB_PATH = FileSystem.documentDirectory + "quran.db";

export const useAudioData = () => {
  const [reciter, setReciter] = useState(4);
  const [fileExist, setFileExist] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioData, setAudioData] = useState(null);

  const fetchAudioData = async (reciterId, surahId) => {
    setLoading(true);
    setError(null);

    try {
        //save reciter
        const reciter = await AsyncStorage.getItem("reciter");
        setReciter(Number.parseInt(reciter))

        //open database
      const db = await SQLite.openDatabaseAsync(LOCAL_DB_PATH);

      //check file exist
      const filePath = FileSystem.documentDirectory + reciter + "/" + surahId + ".mp3";
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      setFileExist(fileInfo.exists)

      //get audioUrl
        const findSura = await db.getFirstAsync(
    "SELECT * FROM audio WHERE reciter_id = ? AND surah_id = ?",
    [reciter, surahId]);
    setAudioUrl(findSura.audio_link)
      
    } catch (err) {
      setError(err.message);
      setAudioData(null);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Clear the current audio data
  const clearAudioData = () => {
    setAudioData(null);
    setError(null);
  };

  return {
    audioData,
    loading,
    error,
    fetchAudioData,
    clearAudioData,
  };
};
