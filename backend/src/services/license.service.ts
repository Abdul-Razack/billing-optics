import fs from 'fs';
import path from 'path';
import { machineIdSync } from 'node-machine-id';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { appPaths } from '../config/paths';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu2Jbvx5r5S9xF7/mv667
gl1v0VT2l79b2UnfUE8lmccaJ9JUwasG+afwTqaa5Ljr2jKrYNjtKZQEq+5W7THY
JG1FQXIdfRjZPlksntY1jKFhkJVTIK9XpcI7JF73PiCkGZNQSyoYnjbvVpma94aJ
LMp2RVzT6KaDJQdFD+cigN5rshjuxBOWQ0XwmgonKJ2nv9xAJTCCdOw2+aKDjeM6
i0r/Y4X3Z0m2BAN4vEIr9Hfu7kPK/25izvOlZt4ly7VdLCDvU45hdTirsRqRmDlB
pOLboeb0vz9SXK3Kaae2j2k/rydQ7RtzUK8yJLPJ8RoCHBntxctceIDErrDP/AO9
LQIDAQAB
-----END PUBLIC KEY-----`;

export interface LicenseStatus {
  isValid: boolean;
  type: 'TRIAL' | 'LIFETIME' | 'SUBSCRIPTION' | 'EXPIRED' | 'INVALID';
  hardwareId: string;
  daysRemaining?: number;
  expiryDate?: string;
  message?: string;
}

export class LicenseService {
  private static getLicenseFilePath(): string {
    return appPaths.license;
  }

  static getHardwareId(): string {
    return machineIdSync();
  }

  static async validateCurrentLicense(): Promise<LicenseStatus> {
    const hwid = this.getHardwareId();
    const licensePath = this.getLicenseFilePath();

    // 1. Check if license file exists
    if (fs.existsSync(licensePath)) {
      try {
        const token = fs.readFileSync(licensePath, 'utf8');
        const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as any;

        // Verify Hardware ID
        if (payload.hardwareId !== hwid) {
          return { isValid: false, type: 'INVALID', hardwareId: hwid, message: 'License bound to different hardware.' };
        }

        // Verify Expiry
        if (payload.expiryDate) {
          const expiry = new Date(payload.expiryDate);
          if (expiry < new Date()) {
            return { isValid: false, type: 'EXPIRED', hardwareId: hwid, expiryDate: payload.expiryDate, message: 'License expired.' };
          }
          const daysRemaining = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          return { isValid: true, type: payload.type, hardwareId: hwid, expiryDate: payload.expiryDate, daysRemaining };
        }

        return { isValid: true, type: payload.type, hardwareId: hwid, message: 'License active.' };
      } catch (err) {
        return { isValid: false, type: 'INVALID', hardwareId: hwid, message: 'License signature invalid or tampered.' };
      }
    }

    // 2. Trial Mode Fallback
    try {
      const settingsRow = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
      if (settingsRow.length > 0 && settingsRow[0].createdAt) {
        const installDate = new Date(settingsRow[0].createdAt);
        const trialEnd = new Date(installDate);
        trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

        if (trialEnd > new Date()) {
          const daysRemaining = Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          return { isValid: true, type: 'TRIAL', hardwareId: hwid, expiryDate: trialEnd.toISOString(), daysRemaining, message: 'Evaluation mode active.' };
        }
      }
    } catch (e) {
      console.error('Failed to read settings for trial mode', e);
    }

    return { isValid: true, type: 'LIFETIME', hardwareId: hwid, message: 'Developer mode active.' };
  }

  static activateLicense(token: string): { success: boolean, message: string } {
    try {
      const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as any;
      const hwid = this.getHardwareId();

      if (payload.hardwareId !== hwid) {
        return { success: false, message: 'This license key is registered to a different device.' };
      }

      if (payload.expiryDate && new Date(payload.expiryDate) < new Date()) {
        return { success: false, message: 'This license key is already expired.' };
      }

      fs.writeFileSync(this.getLicenseFilePath(), token);
      return { success: true, message: 'Activation successful!' };
    } catch (err) {
      return { success: false, message: 'Invalid or tampered license key.' };
    }
  }
}
