import { db } from '../config/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { BackupService } from './backup.service';
import { appPaths } from '../config/paths';

export class HealthService {
  private static getDirectorySize(dirPath: string): number {
    let size = 0;
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += this.getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
    }
    return size;
  }

  static async getSystemHealth() {
    // 1. Application Health
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    const uptimeSeconds = process.uptime();
    const lastRestart = new Date(Date.now() - uptimeSeconds * 1000).toISOString();
    
    // 2. Database Health
    let dbStatus = 'Disconnected';
    let dbVersion = 'Unknown';
    let dbSize = 0;
    
    try {
      const res: any = await db.execute(sql`SELECT version()`);
      const resRows = res.rows || res;
      dbVersion = resRows[0]?.version || 'Unknown';
      dbStatus = 'Connected';
      
      const sizeRes: any = await db.execute(sql`SELECT pg_database_size(current_database()) as size`);
      const sizeRows = sizeRes.rows || sizeRes;
      dbSize = parseInt(sizeRows[0]?.size || '0', 10);
    } catch (e) {
      console.error('Database health check failed:', e);
      dbStatus = 'Error';
    }

    // 3. Storage Health
    const rootPath = appPaths.root;
    let availableSpace = 0;
    let totalSpace = 0;
    try {
      const stat = fs.statfsSync(rootPath);
      availableSpace = stat.bavail * stat.bsize;
      totalSpace = stat.blocks * stat.bsize;
    } catch (e) {
      console.error('Failed to read statfs', e);
    }
    
    const backupsDir = appPaths.backups;
    const uploadsDir = appPaths.uploads;
    
    const backupsSize = this.getDirectorySize(backupsDir);
    const uploadsSize = this.getDirectorySize(uploadsDir);
    const erpCodeSize = this.getDirectorySize(path.join(rootPath, 'src'));

    // 4. Backup Health
    let lastBackupTime = null;
    let backupStatus = 'No Backups';
    try {
      const backups = BackupService.listBackups();
      if (backups.length > 0) {
        lastBackupTime = fs.statSync(path.join(appPaths.backups, backups[0])).mtime.toISOString();
        const diffHours = (Date.now() - new Date(lastBackupTime).getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
          backupStatus = 'Healthy';
        } else {
          backupStatus = 'Warning: Old Backup';
        }
      }
    } catch (e) {
      backupStatus = 'Error Checking Backups';
    }

    // 5. System Diagnostics
    const memory = process.memoryUsage();

    return {
      application: {
        version: pkg.version,
        buildType: process.env.NODE_ENV || 'development',
        uptimeSeconds,
        lastRestart,
      },
      database: {
        status: dbStatus,
        version: dbVersion,
        sizeBytes: dbSize,
      },
      storage: {
        availableBytes: availableSpace,
        totalBytes: totalSpace,
        backupsSizeBytes: backupsSize,
        uploadsSizeBytes: uploadsSize,
        codeSizeBytes: erpCodeSize,
      },
      backups: {
        status: backupStatus,
        lastBackupTime,
      },
      diagnostics: {
        memoryUsageBytes: memory.rss,
        heapUsedBytes: memory.heapUsed,
      },
      timestamp: new Date().toISOString()
    };
  }
}
