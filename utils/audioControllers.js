import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export const LOCAL_DB_PATH = FileSystem.documentDirectory + "quran.db";

export async function getFolderPath(reciter) {
  const folderPath = FileSystem.documentDirectory + reciter;
  return folderPath;
}

export async function getFilePath(sura_id,reciter) {
  const audiopath =
    FileSystem.documentDirectory + reciter + "/" + sura_id + ".mp3";
  return audiopath;
}

export async function checkFileExist(sura_id,reciter) {
  const SURA_URI = await getFilePath(sura_id,reciter)
  // console.log("SURA_URI", SURA_URI);
  const fileInfo = await FileSystem.getInfoAsync(SURA_URI);
  // console.log("File Info:", fileInfo);
  if (fileInfo.exists) {
    return true;
  } else {
    return false;
  }
}

export async function getDownloadKLink(db,sura_id,reciter) {
  const findSura = await db.getFirstAsync(
    "SELECT * FROM audio WHERE reciter_id = ? AND surah_id = ?",
    [reciter, sura_id]
  );
  return findSura.audio_link
}

export async function getTiming(db,sura_id,reciter) {
  const findTimings = await db.getAllAsync(
    "SELECT * FROM verse_timings WHERE reciter_id = ? AND surah_id = ?",
    [reciter, sura_id]
  );
  return findTimings;
}

export const getAyahTiming = async (sura_id, ayah_id) => {
  const timings = await getTiming(sura_id);
  const currentAyah = timings.find((item) => item.ayah === ayah_id);
  const lastAyah = timings[timings.length - 1];
  const isLastAyah = currentAyah.ayah === lastAyah.ayah;
  console.log(currentAyah,lastAyah,isLastAyah);
};

export async function downloadAudio() {
  const reciter = await AsyncStorage.getItem("reciter");
  return reciter;
}