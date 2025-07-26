import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export const DIR_PATH = FileSystem.documentDirectory + "APP_DATA";

export async function getJsonData(filePath) {
  const jsonContent = await FileSystem.readAsStringAsync(filePath);

  const parsedJson = JSON.parse(jsonContent);

  if (Array.isArray(parsedJson)) {
    return parsedJson;
  } else {
    return [];
  }
}

export async function getFolderPath(reciter) {
  const folderPath = DIR_PATH + "/audio_quran/" + reciter;
  return folderPath;
}

export async function getFilePath(reciter,surah_id) {
  const audiopath =
    DIR_PATH + "/audio_quran/" + reciter + "/" + surah_id + ".mp3";
  return audiopath;
}

export async function checkAudioFileExist(reciter,surah_id) {
  const FILE_PATH = DIR_PATH + "/audio_quran/" + reciter + "/" + surah_id + ".mp3";

  const fileInfo = await FileSystem.getInfoAsync(FILE_PATH);

  if (fileInfo.exists) {
    return true;
  } else {
    return false;
  }
}
export async function checkFileExist(path) {
  const FILE_PATH = DIR_PATH + "/" + path + ".json";

  const fileInfo = await FileSystem.getInfoAsync(FILE_PATH);

  if (fileInfo.exists) {
    return true;
  } else {
    return false;
  }
}

export async function getDownloadKLink(reciter,surah_id) {
  const RECITOR_PATH = DIR_PATH + "/audio/reciter_" + reciter + ".json";
  const reciterData = await getJsonData(RECITOR_PATH);
  const findSura = reciterData.find((item) => item.id === surah_id);
  return findSura.link;
}

export async function getTiming(reciter,surah_id) {
  const  TIMING_PATH= DIR_PATH + "/timing/reciter_" + reciter + "_surah_" + surah_id + ".json";
  const timings = await getJsonData(TIMING_PATH);
  return timings;
}

export async function getAyahTiming (surah_id, ayah_id){
  const timings = await getTiming(surah_id);
  const currentAyah = timings.find((item) => item.ayah === ayah_id);
  const lastAyah = timings[timings.length - 1];
  const isLastAyah = currentAyah.ayah === lastAyah.ayah;
  console.log(currentAyah, lastAyah, isLastAyah);
};

export async function downloadAudio() {
  const reciter = await AsyncStorage.getItem("reciter");
  return reciter;
}
