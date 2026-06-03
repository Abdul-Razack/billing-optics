import { db } from '../config/db';
import { sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import extractZip from 'extract-zip';
import { appPaths } from '../config/paths';

export class MaintenanceService {
  /**
   * Retrieves detailed statistics for all tables in the database.
   */
  static async getTableStats() {
    const query = sql`
      SELECT 
        relname AS "tableName",
        seq_scan AS "sequentialScans",
        idx_scan AS "indexScans",
        n_live_tup AS "liveRows",
        n_dead_tup AS "deadRows",
        last_vacuum AS "lastVacuum",
        last_autovacuum AS "lastAutoVacuum",
        last_analyze AS "lastAnalyze",
        last_autoanalyze AS "lastAutoAnalyze",
        pg_total_relation_size(relid) AS "totalSizeBytes"
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC;
    `;
    
    try {
      const result = await db.execute(query);
      return result.rows || result;
    } catch (e) {
      console.error('Failed to get table stats:', e);
      throw e;
    }
  }

  /**
   * Performs a VACUUM ANALYZE operation to optimize the database.
   */
  static async performOptimization() {
    // VACUUM cannot be run inside a transaction block, so we use execute() directly
    // Note: If Drizzle wraps execute in a transaction globally, we might need a raw pg client.
    // By default, db.execute is generally not wrapped unless db.transaction is called.
    const query = sql`VACUUM ANALYZE;`;
    try {
      await db.execute(query);
      return { success: true, timestamp: new Date().toISOString() };
    } catch (e) {
      console.error('Failed to perform VACUUM ANALYZE:', e);
      throw e;
    }
  }

  /**
   * Verifies the integrity of a backup zip by extracting it to a temp dir and checking for database.sql
   */
  static async verifyBackupIntegrity(filename: string) {
    const backupDir = appPaths.backups;
    const zipFilePath = path.join(backupDir, filename);

    if (!fs.existsSync(zipFilePath) || !filename.endsWith('.zip')) {
      throw new Error('Backup file not found or invalid format.');
    }

    const tempDir = path.join(appPaths.temp, `verify_${Date.now()}`);
    let isIntact = false;
    let sizeBytes = fs.statSync(zipFilePath).size;
    let errorDetails = null;

    try {
      await extractZip(zipFilePath, { dir: tempDir });
      
      const sqlFile = path.join(tempDir, 'database.sql');
      if (fs.existsSync(sqlFile)) {
        const stats = fs.statSync(sqlFile);
        if (stats.size > 0) {
          isIntact = true;
        } else {
          errorDetails = 'database.sql is empty';
        }
      } else {
        errorDetails = 'Missing database.sql in archive';
      }
    } catch (e: any) {
      errorDetails = e.message;
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    return {
      filename,
      sizeBytes,
      isIntact,
      errorDetails,
      timestamp: new Date().toISOString()
    };
  }
}
