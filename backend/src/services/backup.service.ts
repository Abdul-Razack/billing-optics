import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import extractZip from 'extract-zip';
import env from '../config/env';
import { appPaths } from '../config/paths';

const execPromise = util.promisify(exec);

export class BackupService {
  /**
   * Creates a full system backup (Database SQL, Uploads, .env) and zips it.
   * Returns the filename of the generated backup zip.
   */
  static async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = appPaths.backups;
    const uploadsDir = appPaths.uploads;
    const envFile = path.resolve(process.cwd(), '.env');
    
    // Ensure backups and uploads directories exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sqlFilename = `backup-${timestamp}.sql`;
    const sqlFilePath = path.join(backupDir, sqlFilename);
    const zipFilename = `optics-backup-${timestamp}.zip`;
    const zipFilePath = path.join(backupDir, zipFilename);

    console.log(`[BACKUP] Starting backup sequence: ${zipFilename}`);

    try {
      // 1. Generate Database Backup using pg_dump
      console.log(`[BACKUP] Dumping PostgreSQL database...`);
      // We assume pg_dump is in the system PATH
      // Use the connection string from env
      await execPromise(`pg_dump -d "${env.DATABASE_URL}" -c --if-exists -F p -f "${sqlFilePath}"`);
      console.log(`[BACKUP] Database dump successful.`);

      // 2. Create Zip Archive
      console.log(`[BACKUP] Compressing backup files...`);
      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
          zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
          console.log(`[BACKUP] Zip created successfully (${archive.pointer()} total bytes).`);
          resolve();
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // Append the SQL dump
        archive.file(sqlFilePath, { name: 'database.sql' });

        // Append the .env file if it exists
        if (fs.existsSync(envFile)) {
          archive.file(envFile, { name: '.env.backup' });
        }

        // Append the uploads directory
        archive.directory(uploadsDir, 'uploads');

        archive.finalize();
      });

      // 3. Cleanup the temporary SQL file
      if (fs.existsSync(sqlFilePath)) {
        fs.unlinkSync(sqlFilePath);
      }

      console.log(`[BACKUP] Backup sequence completed: ${zipFilePath}`);
      return zipFilename;

    } catch (error) {
      console.error(`[BACKUP] Failed during backup sequence:`, error);
      
      // Attempt cleanup on failure
      if (fs.existsSync(sqlFilePath)) fs.unlinkSync(sqlFilePath);
      if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
      
      throw error;
    }
  }

  /**
   * Retrieves a list of all available backup files.
   */
  static listBackups(): string[] {
    const backupDir = appPaths.backups;
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    return fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.zip'))
      .sort((a, b) => b.localeCompare(a)); // Newest first
  }

  /**
   * Restores a backup file, with automatic rollback on failure.
   */
  static async restoreBackup(filename: string): Promise<void> {
    const backupDir = appPaths.backups;
    const uploadsDir = appPaths.uploads;
    const zipFilePath = path.join(backupDir, filename);

    if (!fs.existsSync(zipFilePath) || !filename.endsWith('.zip')) {
      throw new Error('Backup file not found or invalid format.');
    }

    console.log(`[RESTORE] Initiating restore for ${filename}`);

    // 1. Create a safety snapshot
    console.log(`[RESTORE] Creating safety snapshot before restore...`);
    const safetySnapshotFilename = await this.createBackup();
    const safetySnapshotPath = path.join(backupDir, safetySnapshotFilename);

    const tempRestoreDir = path.join(appPaths.temp, `temp_restore_${Date.now()}`);

    try {
      // 2. Extract target backup
      console.log(`[RESTORE] Extracting backup archive...`);
      await extractZip(zipFilePath, { dir: tempRestoreDir });

      const extractedSqlFile = path.join(tempRestoreDir, 'database.sql');
      const extractedUploadsDir = path.join(tempRestoreDir, 'uploads');

      if (!fs.existsSync(extractedSqlFile)) {
        throw new Error('Corrupted backup: database.sql missing.');
      }

      // 3. Restore Database via psql
      console.log(`[RESTORE] Overwriting PostgreSQL database...`);
      await execPromise(`psql -d "${env.DATABASE_URL}" -f "${extractedSqlFile}"`);

      // 4. Restore Uploads Directory
      console.log(`[RESTORE] Overwriting uploads directory...`);
      if (fs.existsSync(uploadsDir)) {
        fs.rmSync(uploadsDir, { recursive: true, force: true });
      }
      if (fs.existsSync(extractedUploadsDir)) {
        fs.cpSync(extractedUploadsDir, uploadsDir, { recursive: true });
      } else {
        fs.mkdirSync(uploadsDir);
      }

      console.log(`[RESTORE] Restore completed successfully.`);
      
      // Cleanup temp restore dir
      if (fs.existsSync(tempRestoreDir)) {
        fs.rmSync(tempRestoreDir, { recursive: true, force: true });
      }

    } catch (error) {
      console.error(`[RESTORE] Restore failed! Initiating rollback to safety snapshot...`, error);
      
      try {
        // ROLLBACK
        const tempRollbackDir = path.join(appPaths.temp, `temp_rollback_${Date.now()}`);
        await extractZip(safetySnapshotPath, { dir: tempRollbackDir });
        const rollbackSqlFile = path.join(tempRollbackDir, 'database.sql');
        
        console.log(`[ROLLBACK] Reverting database state...`);
        await execPromise(`psql -d "${env.DATABASE_URL}" -f "${rollbackSqlFile}"`);
        console.log(`[ROLLBACK] Database reverted successfully.`);
        
        if (fs.existsSync(tempRollbackDir)) {
          fs.rmSync(tempRollbackDir, { recursive: true, force: true });
        }
      } catch (rollbackError) {
        console.error(`[ROLLBACK CRITICAL] Rollback also failed. System may be unstable.`, rollbackError);
      }

      // Cleanup temp restore dir
      if (fs.existsSync(tempRestoreDir)) {
        fs.rmSync(tempRestoreDir, { recursive: true, force: true });
      }

      throw error;
    }
  }
}
