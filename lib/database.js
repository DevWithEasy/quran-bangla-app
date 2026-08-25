import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";
import { unzipSync } from "fflate";

class Database {
  static instance = null;
  db = null;
  isInitialized = false;
  isInitializing = false;
  initializationPromise = null;
  indexesCreated = false;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize() {
    // যদি ইতিমধ্যেই ইনিশিয়ালাইজড হয়ে থাকে
    if (this.isInitialized && this.db && this.indexesCreated) {
      return this.db;
    }

    // যদি ইনিশিয়ালাইজেশন ইতিমধ্যে চলতে থাকে, তাহলে সেই Promise রিটার্ন করুন
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;

    // একটি Promise তৈরি করুন যা সবাই শেয়ার করবে
    this.initializationPromise = (async () => {
      try {
        console.log("🚀 Starting database initialization...");

        // ডাটাবেজ ফাইলের নাম
        const dbName = "quran.db";
        const dbDir = `${FileSystem.documentDirectory}SQLite`;
        const dbPath = `${dbDir}/${dbName}`;

        // ডিরেক্টরি তৈরি করুন
        const dirInfo = await FileSystem.getInfoAsync(dbDir);
        if (!dirInfo.exists) {
          console.log("📁 Creating SQLite directory...");
          await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
        }

        // ডাটাবেজ ফাইল চেক করুন
        const fileInfo = await FileSystem.getInfoAsync(dbPath);

        if (!fileInfo.exists) {
          // ডাটাবেজ ফাইল না থাকলে zip থেকে এক্সট্র্যাক্ট করুন
          await this.extractDatabaseFromZip(dbPath, dbDir);
        } else {
          console.log("✅ Database already exists");
        }

        // ডাটাবেজ ওপেন করুন
        this.db = await SQLite.openDatabaseAsync(dbName);

        // ইনডেক্স তৈরি করুন (একবারই তৈরি হবে)
        if (!this.indexesCreated) {
          console.log("📊 Creating database indexes...");
          await this.createIndexes();
          this.indexesCreated = true;
        }

        this.isInitialized = true;
        this.isInitializing = false;
        console.log("🎉 Database initialized successfully");

        return this.db;
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
        this.isInitialized = false;
        this.isInitializing = false;
        this.indexesCreated = false;
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  async createIndexes() {
    try {
      // গুরুত্বপূর্ণ ইনডেক্সগুলো তৈরি করুন
      const indexQueries = [
        // আয়াত টেবিলের ইনডেক্স
        "CREATE INDEX IF NOT EXISTS idx_ayahs_surah ON ayahs(surah_id)",
        "CREATE INDEX IF NOT EXISTS idx_ayahs_number ON ayahs(ayah_number)",
        "CREATE INDEX IF NOT EXISTS idx_ayahs_composite ON ayahs(surah_id, ayah_number)",

        // সূরা অডিও টেবিলের ইনডেক্স
        "CREATE INDEX IF NOT EXISTS idx_surah_audio_composite ON surah_audio(surah_id, reciter_id)",

        // আয়াত অডিও টাইমস্ট্যাম্পের ইনডেক্স
        "CREATE INDEX IF NOT EXISTS idx_audio_timestamps ON ayah_audio_timestamps(reciter_id, surah_id, ayah_number)",
        "CREATE INDEX IF NOT EXISTS idx_timestamps_reciter_surah ON ayah_audio_timestamps(reciter_id, surah_id)",

        // ফেভারিট টেবিলের ইনডেক্স
        "CREATE INDEX IF NOT EXISTS idx_favorites_composite ON favorites(surah_id, ayah_number)",
      ];

      for (const query of indexQueries) {
        try {
          await this.db.runAsync(query);
          console.log(`✅ Created index: ${query.split("ON ")[1]}`);
        } catch (error) {
          console.log(`ℹ️ Index might already exist: ${error.message}`);
        }
      }

      console.log("✅ All indexes created successfully");
    } catch (error) {
      console.error("❌ Error creating indexes:", error);
      throw error;
    }
  }

  async extractDatabaseFromZip(dbPath, dirPath) {
    try {
      console.log("📦 Starting extraction process...");

      // Assets থেকে zip ফাইল লোড করুন
      console.log("📥 Loading zip asset...");
      const zipAsset = Asset.fromModule(require("../assets/db/quran.zip"));
      await zipAsset.downloadAsync();

      // Zip ফাইল পড়ুন
      const zipBase64 = await FileSystem.readAsStringAsync(zipAsset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Base64 থেকে buffer তৈরি করুন
      console.log("🔄 Converting to buffer...");
      const zipBuffer = Buffer.from(zipBase64, "base64");

      // Zip এক্সট্র্যাক্ট করুন
      const unzipped = unzipSync(zipBuffer);

      // quran.db ফাইল খুঁজে বের করুন
      let dbFileData = null;
      let foundPath = null;

      console.log("🔍 Searching for database file...");
      // বিভিন্ন সম্ভাব্য পাথ চেক করুন
      const possiblePaths = [
        "quran.db",
        "quran/quran.db",
        "database/quran.db",
        "data/quran.db",
        "db/quran.db",
      ];

      for (const path of possiblePaths) {
        if (unzipped[path]) {
          dbFileData = unzipped[path];
          foundPath = path;
          console.log("✅ Found database at:", path);
          break;
        }
      }

      // যদি না পাওয়া যায়, প্রথম .db ফাইল খুঁজুন
      if (!dbFileData) {
        for (const [filePath, fileData] of Object.entries(unzipped)) {
          if (filePath.endsWith(".db")) {
            dbFileData = fileData;
            foundPath = filePath;
            console.log("✅ Found .db file:", filePath);
            break;
          }
        }
      }

      if (!dbFileData) {
        console.log("❌ No database file found in zip. Available files:");
        Object.keys(unzipped).forEach((key) => {
          console.log("   -", key);
        });
        throw new Error("No database file found in zip");
      }

      console.log("📊 Database file size:", dbFileData.length, "bytes");

      // ডাটাবেজ ফাইল সেভ করুন
      const fileContent = Buffer.from(dbFileData);
      await FileSystem.writeAsStringAsync(
        dbPath,
        fileContent.toString("base64"),
        { encoding: FileSystem.EncodingType.Base64 },
      );
    } catch (error) {
      console.error("❌ Error extracting database from zip:", error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const db = await this.initialize();
      const result = await db.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error("Query execution error:", error.message, "Query:", sql);
      throw error;
    }
  }

  async getFirstRow(sql, params = []) {
    try {
      const db = await this.initialize();
      const result = await db.getFirstAsync(sql, params);
      return result;
    } catch (error) {
      console.error("Query execution error:", error);
      throw error;
    }
  }

  async executeNonQuery(sql, params = []) {
    try {
      const db = await this.initialize();
      await db.runAsync(sql, params);
    } catch (error) {
      console.error("Non-query execution error:", error);
      throw error;
    }
  }

  // এলিয়াস মেথডগুলি - DbService এর জন্য
  async query(sql, params = []) {
    return this.executeQuery(sql, params);
  }

  async getFirst(sql, params = []) {
    return this.getFirstRow(sql, params);
  }

  async execute(sql, params = []) {
    return this.executeNonQuery(sql, params);
  }

  // সূরা সম্পর্কিত মেথডসমূহ
  async getAllSurahs() {
    const sql = `
      SELECT 
        id,
        total_ayah,
        name_ar,
        name_en,
        meaning_en,
        revelation_type,
        name_bn,
        meaning_bn
      FROM surah 
      ORDER BY id ASC
    `;
    return await this.executeQuery(sql);
  }

  async getSurah(surahId) {
    const sql = `
      SELECT 
        id,
        total_ayah,
        name_ar,
        name_en,
        meaning_en,
        revelation_type,
        name_bn,
        meaning_bn
      FROM surah 
      WHERE id = ?
    `;
    return await this.getFirstRow(sql, [surahId]);
  }

  async getAyahs(surahId) {
    const sql = `
      SELECT 
        id,
        surah_id,
        ayah_number,
        text_ar,
        text_tr,
        text_bn_haque,
        text_bn_muhi,
        text_en
      FROM ayahs 
      WHERE surah_id = ? 
      ORDER BY ayah_number ASC
    `;
    return await this.executeQuery(sql, [surahId]);
  }

  // অপটিমাইজড মেথড - ইনডেক্স ব্যবহার করে
  async getAyahsFast(surahId) {
    const sql = `
      SELECT 
        id,
        surah_id,
        ayah_number,
        text_ar,
        text_tr,
        text_bn_haque,
        text_bn_muhi,
        text_en
      FROM ayahs 
      WHERE surah_id = ? 
      ORDER BY ayah_number ASC
    `;
    return await this.executeQuery(sql, [surahId]);
  }

  async getAyah(surahId, ayahNumner) {
    const sql = `
      SELECT 
        id,
        surah_id,
        ayah_number,
        text_ar,
        text_tr,
        text_bn_haque,
        text_bn_muhi,
        text_en
      FROM ayahs 
      WHERE surah_id = ? AND ayah_number = ?
      ORDER BY ayah_number ASC
    `;
    return await this.getFirstRow(sql, [surahId, ayahNumner]);
  }

  // অপটিমাইজড সার্চ মেথড
  async searchAyahsFast(query) {
    const sql = `
      SELECT 
        a.id,
        a.surah_id,
        a.ayah_number,
        a.text_ar,
        a.text_bn_haque,
        a.text_bn_muhi,
        a.text_en,
        s.name_bn,
        s.name_ar,
        s.total_ayah
      FROM ayahs a
      JOIN surah s ON a.surah_id = s.id
      WHERE a.text_bn_haque LIKE ? 
         OR a.text_bn_muhi LIKE ?
         OR a.text_ar LIKE ?
         OR a.text_en LIKE ?
      ORDER BY s.id, a.ayah_number
      LIMIT 100
    `;
    const searchQuery = `%${query}%`;
    return await this.executeQuery(sql, [
      searchQuery,
      searchQuery,
      searchQuery,
      searchQuery,
    ]);
  }

  async getSuraUrlFast(suraId, reciterId) {
    const sql = `SELECT * FROM surah_audio WHERE surah_id = ? AND reciter_id = ?`;
    return await this.getFirstRow(sql, [suraId, reciterId]);
  }

  async getSurahTimestampsFast(reciterId, suraId) {
    const sql = `SELECT * FROM ayah_audio_timestamps WHERE reciter_id = ? AND surah_id = ? ORDER BY ayah_number ASC`;
    return await this.executeQuery(sql, [reciterId, suraId]);
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      this.indexesCreated = false;
      this.initializationPromise = null;
    }
  }

  async reset() {
    try {
      console.log("Resetting database...");

      // ডাটাবেজ ফাইল ডিলিট করুন
      const dbPath = `${FileSystem.documentDirectory}SQLite/quran.db`;
      await FileSystem.deleteAsync(dbPath, { idempotent: true });

      // AsyncStorage থেকে স্ট্যাটাস ডিলিট করুন
      await AsyncStorage.removeItem("database_initialized");

      // ডাটাবেজ ক্লোজ করুন
      await this.close();

      console.log("Database reset successfully");
      return true;
    } catch (error) {
      console.error("Error resetting database:", error);
      return false;
    }
  }

  // Static helper methods - DbService এর জন্য
  static async query(sql, params = []) {
    const instance = Database.getInstance();
    return await instance.query(sql, params);
  }

  static async getFirst(sql, params = []) {
    const instance = Database.getInstance();
    return await instance.getFirst(sql, params);
  }

  static async execute(sql, params = []) {
    const instance = Database.getInstance();
    return await instance.execute(sql, params);
  }

  static async getAllSurahs() {
    const instance = Database.getInstance();
    return await instance.getAllSurahs();
  }

  static async getSurah(surahId) {
    const instance = Database.getInstance();
    return await instance.getSurah(surahId);
  }

  static async getAyahs(surahId) {
    const instance = Database.getInstance();
    return await instance.getAyahsFast(surahId);
  }

  static async getSuraUrl(suraId, reciterId) {
    const instance = Database.getInstance();
    return await instance.getSuraUrlFast(suraId, reciterId);
  }

  static async getSurahTimestamps(reciterId, suraId) {
    const instance = Database.getInstance();
    return await instance.getSurahTimestampsFast(reciterId, suraId);
  }

  static async searchAyahs(query) {
    const instance = Database.getInstance();
    return await instance.searchAyahsFast(query);
  }

  static async initializeDb() {
    const instance = Database.getInstance();
    return await instance.initialize();
  }

  static async resetDb() {
    const instance = Database.getInstance();
    return await instance.reset();
  }

  static async createIndexes() {
    const instance = Database.getInstance();
    if (!instance.indexesCreated) {
      await instance.createIndexes();
    }
  }
}

export default Database.getInstance();
