import { db } from '../config/db';
import { auditLogs } from '../db/schema';
import { desc, eq, and, or, sql, gte, lte } from 'drizzle-orm';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface LogEventParams {
  userId?: number | null; // Nullable for system tasks or failed logins where user doesn't exist
  action: string;
  module: string;
  recordId?: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  req?: Request; // Pass request to extract IP/Device
  result?: 'SUCCESS' | 'FAILURE';
  details?: string;
}

export class AuditService {
  static async logEvent(params: LogEventParams): Promise<void> {
    try {
      let ipAddress = null;
      let device = null;

      if (params.req) {
        ipAddress = params.req.ip || params.req.headers['x-forwarded-for'] || params.req.socket.remoteAddress;
        if (Array.isArray(ipAddress)) {
          ipAddress = ipAddress[0];
        }
        device = params.req.headers['user-agent']?.substring(0, 255) || 'Unknown';
      }

      await db.insert(auditLogs).values({
        id: uuidv4(),
        userId: params.userId || null,
        action: params.action,
        module: params.module,
        recordId: params.recordId || null,
        oldValues: params.oldValues || null,
        newValues: params.newValues || null,
        ipAddress: ipAddress ? ipAddress.toString().substring(0, 45) : null,
        device: device,
        result: params.result || 'SUCCESS',
        details: params.details || null,
      });
    } catch (error) {
      // We log to console but DO NOT throw error because we don't want audit logging failure to crash business logic
      console.error('CRITICAL: Failed to write to audit log:', error);
    }
  }

  static async getLogs(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 50;
    const page = query.page ? parseInt(query.page) : 1;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.userId) conditions.push(eq(auditLogs.userId, query.userId));
    if (query.module) conditions.push(eq(auditLogs.module, query.module));
    if (query.action) conditions.push(eq(auditLogs.action, query.action));
    if (query.result) conditions.push(eq(auditLogs.result, query.result));
    
    if (query.startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(query.startDate)));
    }
    if (query.endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(query.endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.auditLogs.findMany({
      where: whereClause,
      limit: limit,
      offset: offset,
      orderBy: [desc(auditLogs.timestamp)],
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    const countRes = await db.select({ count: sql<number>`count(*)` }).from(auditLogs).where(whereClause);
    const total = countRes[0].count;

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}
