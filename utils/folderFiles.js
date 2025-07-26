export function folderFiles(fileName,length) {
    return Array.from({ length: length }, (_, i) => `${fileName}_${i + 1}.json`);
}

export function timingFiles() {
    const reciters = Array.from({ length: 4 }, (_, i) => `reciter_${i + 1}`);
    const surahs = Array.from({ length: 114 }, (_, i) => `surah_${i + 1}`);
    const timings = [];
    reciters.forEach((reciter) => {
        timings.push(...surahs.map((surah) => `${reciter}_${surah}.json`));
    });
    return timings;
}

export const AUDIO_FILES = folderFiles("reciter", 4);
export const SURAH_FILES = folderFiles("surah", 114);
export const TIMING_FILES = timingFiles();