import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Buffer } from 'buffer';
import { unzipSync } from 'fflate';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Database {
  static instance = null;
  db = null;
  isInitialized = false;
  isInitializing = false;
  initializationPromise = null;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize() {
    // যদি ইতিমধ্যেই ইনিশিয়ালাইজড হয়ে থাকে
    if (this.isInitialized && this.db) {
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
        console.log('🚀 Starting database initialization...');
        
        // ডাটাবেজ ফাইলের নাম
        const dbName = 'quran.db';
        const dbDir = `${FileSystem.documentDirectory}SQLite`;
        const dbPath = `${dbDir}/${dbName}`;
        
        // ডিরেক্টরি তৈরি করুন
        const dirInfo = await FileSystem.getInfoAsync(dbDir);
        if (!dirInfo.exists) {
          console.log('📁 Creating SQLite directory...');
          await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
        }
        
        // ডাটাবেজ ফাইল চেক করুন
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        console.log('✅ Database file exists:', fileInfo.exists);
        
        if (!fileInfo.exists) {
          // ডাটাবেজ ফাইল না থাকলে zip থেকে এক্সট্র্যাক্ট করুন
          console.log('📦 Database not found, extracting from zip...');
          await this.extractDatabaseFromZip(dbPath, dbDir);
        } else {
          console.log('✅ Database already exists');
        }
        
        // ডাটাবেজ ওপেন করুন
        console.log('🔓 Opening database...');
        this.db = await SQLite.openDatabaseAsync(dbName);
        console.log('✅ Database opened successfully');
        
        // ডাটাবেজ টেবিল চেক করুন
        console.log('🔍 Verifying database...');
        const tables = await this.db.getAllAsync(
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );
        
        console.log('📋 Tables in database:', tables.length);
        tables.forEach(table => {
          console.log('   -', table.name);
        });
        
        // টেস্ট ক্যুয়েরি
        const surahCount = await this.db.getAllAsync("SELECT COUNT(*) as count FROM surah");
        console.log('📊 Surahs count:', surahCount[0]?.count || 0);
        
        const ayahsCount = await this.db.getAllAsync("SELECT COUNT(*) as count FROM ayahs");
        console.log('📊 Ayahs count:', ayahsCount[0]?.count || 0);
        
        const recitersCount = await this.db.getAllAsync("SELECT COUNT(*) as count FROM reciters");
        console.log('📊 Reciters count:', recitersCount[0]?.count || 0);
        
        console.log('✅ Database verification completed');
        
        this.isInitialized = true;
        this.isInitializing = false;
        console.log('🎉 Database initialized successfully');
        
        // AsyncStorage তে মার্ক করুন
        await AsyncStorage.setItem('database_initialized', 'true');
        
        return this.db;
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        this.isInitialized = false;
        this.isInitializing = false;
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  async extractDatabaseFromZip(dbPath, dirPath) {
    try {
      console.log('📦 Starting extraction process...');
      
      // Assets থেকে zip ফাইল লোড করুন
      console.log('📥 Loading zip asset...');
      const zipAsset = Asset.fromModule(require('../assets/db/quran.zip'));
      await zipAsset.downloadAsync();
      
      console.log('📄 Zip asset URI:', zipAsset.localUri);
      
      // Zip ফাইল পড়ুন
      console.log('📖 Reading zip file...');
      const zipBase64 = await FileSystem.readAsStringAsync(zipAsset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📊 Zip file size:', (zipBase64.length * 3 / 4 / 1024 / 1024).toFixed(2), 'MB (base64)');
      
      // Base64 থেকে buffer তৈরি করুন
      console.log('🔄 Converting to buffer...');
      const zipBuffer = Buffer.from(zipBase64, 'base64');
      
      // Zip এক্সট্র্যাক্ট করুন
      console.log('🗜️ Unzipping...');
      const unzipped = unzipSync(zipBuffer);
      console.log('📂 Unzipped entries:', Object.keys(unzipped).length);
      
      // quran.db ফাইল খুঁজে বের করুন
      let dbFileData = null;
      let foundPath = null;
      
      console.log('🔍 Searching for database file...');
      // বিভিন্ন সম্ভাব্য পাথ চেক করুন
      const possiblePaths = [
        'quran.db',
        'quran/quran.db',
        'database/quran.db',
        'data/quran.db',
        'db/quran.db',
      ];
      
      for (const path of possiblePaths) {
        if (unzipped[path]) {
          dbFileData = unzipped[path];
          foundPath = path;
          console.log('✅ Found database at:', path);
          break;
        }
      }
      
      // যদি না পাওয়া যায়, প্রথম .db ফাইল খুঁজুন
      if (!dbFileData) {
        for (const [filePath, fileData] of Object.entries(unzipped)) {
          if (filePath.endsWith('.db')) {
            dbFileData = fileData;
            foundPath = filePath;
            console.log('✅ Found .db file:', filePath);
            break;
          }
        }
      }
      
      if (!dbFileData) {
        console.log('❌ No database file found in zip. Available files:');
        Object.keys(unzipped).forEach(key => {
          console.log('   -', key);
        });
        throw new Error('No database file found in zip');
      }
      
      console.log('📊 Database file size:', dbFileData.length, 'bytes');
      
      // ডাটাবেজ ফাইল সেভ করুন
      console.log('💾 Saving database file...');
      const fileContent = Buffer.from(dbFileData);
      await FileSystem.writeAsStringAsync(
        dbPath,
        fileContent.toString('base64'),
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      // ফাইল সাইজ চেক করুন
      const savedFileInfo = await FileSystem.getInfoAsync(dbPath);
      console.log('✅ Database saved successfully');
      console.log('📊 Saved file size:', (savedFileInfo.size / 1024 / 1024).toFixed(2), 'MB');
      
    } catch (error) {
      console.error('❌ Error extracting database from zip:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const db = await this.initialize();
      const result = await db.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Query execution error:', error.message, 'Query:', sql);
      throw error;
    }
  }

  async getFirstRow(sql, params = []) {
    try {
      const db = await this.initialize();
      const result = await db.getFirstAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  async executeNonQuery(sql, params = []) {
    try {
      const db = await this.initialize();
      await db.runAsync(sql, params);
    } catch (error) {
      console.error('Non-query execution error:', error);
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

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      this.initializationPromise = null;
    }
  }

  async reset() {
    try {
      console.log('Resetting database...');
      
      // ডাটাবেজ ফাইল ডিলিট করুন
      const dbPath = `${FileSystem.documentDirectory}SQLite/quran.db`;
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      
      // AsyncStorage থেকে স্ট্যাটাস ডিলিট করুন
      await AsyncStorage.removeItem('database_initialized');
      
      // ডাটাবেজ ক্লোজ করুন
      await this.close();
      
      console.log('Database reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
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
    return await instance.getAyahs(surahId);
  }

  static async initializeDb() {
    const instance = Database.getInstance();
    return await instance.initialize();
  }

  static async resetDb() {
    const instance = Database.getInstance();
    return await instance.reset();
  }
}

export default Database.getInstance();