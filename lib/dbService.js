import Database from "./database";

// Database service for easy access
class DbService {
  // Surah related methods
  static async getAllSurahs() {
    try {
      return await Database.getAllSurahs();
    } catch (error) {
      console.error("Error getting all surahs:", error);
      throw error;
    }
  }

  static async getSurah(surahId) {
    try {
      return await Database.getSurah(surahId);
    } catch (error) {
      console.error(`Error getting surah ${surahId}:`, error);
      throw error;
    }
  }

  static async getAyahs(surahId) {
    try {
      return await Database.getAyahs(surahId);
    } catch (error) {
      console.error(`Error getting ayahs for surah ${surahId}:`, error);
      throw error;
    }
  }

  static async searchAyahs(query) {
    try {
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
      `;
      const searchQuery = `%${query}%`;
      return await Database.query(sql, [
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
      ]);
    } catch (error) {
      console.error("Error searching ayahs:", error);
      throw error;
    }
  }

  static async getFavoriteAyahs() {
    try {
      const sql = `
        SELECT 
          a.id,
          a.surah_id,
          a.ayah_number,
          a.text_ar,
          a.text_bn_haque,
          s.name_bn,
          s.name_ar
        FROM ayahs a
        JOIN surah s ON a.surah_id = s.id
        JOIN favorites f ON a.id = f.ayah_id
        ORDER BY f.created_at DESC
      `;
      return await Database.query(sql);
    } catch (error) {
      console.error("Error getting favorite ayahs:", error);
      throw error;
    }
  }

  // Reciters
  static async getAllReciters() {
    try {
      const sql = `SELECT * FROM reciters ORDER BY name`;
      return await Database.query(sql);
    } catch (error) {
      console.error("Error getting reciters:", error);
      throw error;
    }
  }

  static async getReciter(reciterId) {
    try {
      const sql = `SELECT * FROM reciters WHERE id = ?`;
      return await Database.getFirst(sql, [reciterId]);
    } catch (error) {
      console.error(`Error getting reciter ${reciterId}:`, error);
      throw error;
    }
  }

  static async getSuraUrl(suraId, reciterId) {
    try {
      const sql = `SELECT * FROM surah_audio WHERE surah_id = ? AND reciter_id = ?`;
      return await Database.getFirst(sql, [suraId, reciterId]);
    } catch (error) {
      console.error(`Error getting reciter ${reciterId}:`, error);
      throw error;
    }
  }

  //course videos
  static async getVideos() {
    try {
      const sql = `SELECT * FROM course_videos ORDER BY id`;
      return await Database.query(sql);
    } catch (error) {
      console.error("Error getting reciters:", error);
      throw error;
    }
  }

  static async markVideoAsCompleted(videoId) {
    try {
      const sql = `UPDATE course_videos SET is_completed = 1 WHERE id = ?`;
      return await Database.query(sql, [videoId]);
    } catch (error) {
      console.error("Error marking video as completed:", error);
      throw error;
    }
  }

  static async markVideoAsIncomplete(videoId) {
    try {
      const sql = `UPDATE course_videos SET is_completed = 0 WHERE id = ?`;
      return await Database.query(sql, [videoId]);
    } catch (error) {
      console.error("Error marking video as incomplete:", error);
      throw error;
    }
  }

  static async getCompletedVideosCount() {
    try {
      const sql = `SELECT COUNT(*) as count FROM course_videos WHERE is_completed = 1`;
      const result = await Database.getFirstRow(sql);
      return result?.count || 0;
    } catch (error) {
      console.error("Error getting completed videos count:", error);
      return 0;
    }
  }

  // Favorites
static async getFavorites() {
  try {
    const sql = `
      SELECT 
        f.id AS favorite_id,
        f.surah_id,
        f.ayah_number,

        s.name_bn,
        s.name_en,
        s.name_ar,
        s.total_ayah,
        s.revelation_type,

        a.text_ar,
        a.text_bn_haque,
        a.text_bn_muhi,
        a.text_en

      FROM favorites f
      JOIN surah s 
        ON s.id = f.surah_id
      JOIN ayahs a 
        ON a.surah_id = f.surah_id 
        AND a.ayah_number = f.ayah_number

      ORDER BY f.id DESC
    `;

    const result = await Database.query(sql);
    return result;

  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
}

  static async checkFavorite(surahId, ayahId) {
    try {
      // চেক করুন ফেভারিট ইতিমধ্যে আছে কিনা
      const checkSql = `SELECT * FROM favorites WHERE surah_id=? AND ayah_number = ?`;
      return await Database.getFirst(checkSql, [surahId, ayahId]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  static async addFavorite(surahId, ayahId) {
    try {
      // নতুন ফেভারিট যোগ করুন
      const insertSql = `INSERT INTO favorites (surah_id, ayah_number) VALUES (?, ?)`;
      return await Database.execute(insertSql, [surahId, ayahId]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  static async removeFavorite(surahId, ayahId) {
    try {
      const sql = `DELETE FROM favorites WHERE surah_id=? AND ayah_number = ?`;
      return await Database.execute(sql, [surahId, ayahId]);
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  }

  // Search by Surah name
  static async searchSurahs(query) {
    try {
      const sql = `
        SELECT * FROM surah 
        WHERE name_bn LIKE ? 
           OR name_ar LIKE ? 
           OR name_en LIKE ?
           OR meaning_bn LIKE ?
        ORDER BY id
      `;
      const searchQuery = `%${query}%`;
      return await Database.query(sql, [
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
      ]);
    } catch (error) {
      console.error("Error searching surahs:", error);
      throw error;
    }
  }

  // Statistics
  static async getStatistics() {
    try {
      const [totalSurahs] = await Database.query(
        "SELECT COUNT(*) as count FROM surah",
      );
      const [totalAyahs] = await Database.query(
        "SELECT COUNT(*) as count FROM ayahs",
      );
      const [totalReciters] = await Database.query(
        "SELECT COUNT(*) as count FROM reciters",
      );

      return {
        totalSurahs: totalSurahs.count,
        totalAyahs: totalAyahs.count,
        totalReciters: totalReciters.count,
      };
    } catch (error) {
      console.error("Error getting statistics:", error);
      throw error;
    }
  }

  // Initialize database
  static async initialize() {
    try {
      return await Database.initialize();
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  // Reset database
  static async reset() {
    try {
      return await Database.reset();
    } catch (error) {
      console.error("Error resetting database:", error);
      throw error;
    }
  }

  // Direct query (for complex operations)
  static async query(sql, params = []) {
    try {
      return await Database.query(sql, params);
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  // Check database status
  static async checkDatabaseStatus() {
    try {
      const sql = "SELECT name FROM sqlite_master WHERE type='table'";
      const tables = await Database.query(sql);
      return {
        isInitialized: tables.length > 0,
        tablesCount: tables.length,
        tables: tables.map((t) => t.name),
      };
    } catch (error) {
      return {
        isInitialized: false,
        error: error.message,
      };
    }
  }

  // Get ayah by ID
  static async getAyah(ayahId) {
    try {
      const sql = `
        SELECT 
          a.*,
          s.name_bn,
          s.name_ar,
          s.total_ayah
        FROM ayahs a
        JOIN surah s ON a.surah_id = s.id
        WHERE a.id = ?
      `;
      return await Database.getFirst(sql, [ayahId]);
    } catch (error) {
      console.error(`Error getting ayah ${ayahId}:`, error);
      throw error;
    }
  }

  // Get ayah by surah and ayah number
  static async getAyahBySurahAndNumber(surahId, ayahNumber) {
    try {
      const sql = `
        SELECT 
          a.*,
          s.name_bn,
          s.name_ar,
          s.total_ayah
        FROM ayahs a
        JOIN surah s ON a.surah_id = s.id
        WHERE a.surah_id = ? AND a.ayah_number = ?
      `;
      return await Database.getFirst(sql, [surahId, ayahNumber]);
    } catch (error) {
      console.error(`Error getting ayah ${surahId}:${ayahNumber}:`, error);
      throw error;
    }
  }

  // Get next ayah
  static async getNextAyah(surahId, currentAyahNumber) {
    try {
      const sql = `
        SELECT * FROM ayahs 
        WHERE surah_id = ? AND ayah_number > ? 
        ORDER BY ayah_number ASC 
        LIMIT 1
      `;
      return await Database.getFirst(sql, [surahId, currentAyahNumber]);
    } catch (error) {
      console.error("Error getting next ayah:", error);
      return null;
    }
  }

  // Get previous ayah
  static async getPreviousAyah(surahId, currentAyahNumber) {
    try {
      const sql = `
        SELECT * FROM ayahs 
        WHERE surah_id = ? AND ayah_number < ? 
        ORDER BY ayah_number DESC 
        LIMIT 1
      `;
      return await Database.getFirst(sql, [surahId, currentAyahNumber]);
    } catch (error) {
      console.error("Error getting previous ayah:", error);
      return null;
    }
  }
}

export default DbService;
