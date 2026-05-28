import { eq, sql, ilike, or, and, desc, asc } from 'drizzle-orm';
import { db } from '../config/db';
import { prescriptions } from '../db/schema/prescriptions';
import { customers } from '../db/schema/customers';
import { users } from '../db/schema/users';

export class PrescriptionRepository {
  static async getPrescriptions(params: any) {
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = params.limit ? parseInt(params.limit, 10) : 10;
    const { search, sortBy } = params;

    const conditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(customers.fullName, searchTerm),
          ilike(customers.phone, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    let orderBy: any = desc(prescriptions.createdAt);
    if (sortBy === 'oldest') {
      orderBy = asc(prescriptions.createdAt);
    }

    const results = await db.select({
      id: prescriptions.id,
      customerId: prescriptions.customerId,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      rightEyeSph: prescriptions.rightEyeSph,
      rightEyeCyl: prescriptions.rightEyeCyl,
      rightEyeAxis: prescriptions.rightEyeAxis,
      leftEyeSph: prescriptions.leftEyeSph,
      leftEyeCyl: prescriptions.leftEyeCyl,
      leftEyeAxis: prescriptions.leftEyeAxis,
      addPower: prescriptions.addPower,
      pd: prescriptions.pd,
      notes: prescriptions.notes,
      creatorId: users.id,
      creatorName: users.fullName,
      createdAt: prescriptions.createdAt,
      updatedAt: prescriptions.updatedAt,
    })
    .from(prescriptions)
    .innerJoin(customers, eq(prescriptions.customerId, customers.id))
    .innerJoin(users, eq(prescriptions.createdBy, users.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

    const [countResult] = await db.select({
      total: sql<number>`count(*)::int`
    })
    .from(prescriptions)
    .innerJoin(customers, eq(prescriptions.customerId, customers.id))
    .where(whereClause);

    const formattedData = results.map(r => ({
      id: r.id.toString(),
      customerId: r.customerId.toString(),
      customer: {
        id: r.customerId,
        name: r.customerName,
        phone: r.customerPhone,
      },
      rightEye: {
        sphere: r.rightEyeSph ? String(r.rightEyeSph) : "",
        cylinder: r.rightEyeCyl ? String(r.rightEyeCyl) : "",
        axis: r.rightEyeAxis ? String(r.rightEyeAxis) : "",
        addPower: r.addPower ? String(r.addPower) : "",
      },
      leftEye: {
        sphere: r.leftEyeSph ? String(r.leftEyeSph) : "",
        cylinder: r.leftEyeCyl ? String(r.leftEyeCyl) : "",
        axis: r.leftEyeAxis ? String(r.leftEyeAxis) : "",
        addPower: r.addPower ? String(r.addPower) : "",
      },
      pd: r.pd ? String(r.pd) : "",
      notes: r.notes || "",
      createdBy: r.creatorName || "",
      createdAt: r.createdAt.toISOString(),
      isActive: true,
    }));

    return {
      data: formattedData,
      total: countResult.total || 0,
      page,
      totalPages: Math.ceil((countResult.total || 0) / limit)
    };
  }

  static async getPrescriptionById(id: number) {
    const [result] = await db.select({
      id: prescriptions.id,
      customerId: prescriptions.customerId,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      rightEyeSph: prescriptions.rightEyeSph,
      rightEyeCyl: prescriptions.rightEyeCyl,
      rightEyeAxis: prescriptions.rightEyeAxis,
      leftEyeSph: prescriptions.leftEyeSph,
      leftEyeCyl: prescriptions.leftEyeCyl,
      leftEyeAxis: prescriptions.leftEyeAxis,
      addPower: prescriptions.addPower,
      pd: prescriptions.pd,
      notes: prescriptions.notes,
      creatorId: users.id,
      creatorName: users.fullName,
      createdAt: prescriptions.createdAt,
      updatedAt: prescriptions.updatedAt,
    })
    .from(prescriptions)
    .innerJoin(customers, eq(prescriptions.customerId, customers.id))
    .innerJoin(users, eq(prescriptions.createdBy, users.id))
    .where(eq(prescriptions.id, id))
    .limit(1);

    if (!result) return undefined;

    return {
      id: result.id.toString(),
      customerId: result.customerId.toString(),
      customer: {
        id: result.customerId,
        name: result.customerName,
        phone: result.customerPhone,
      },
      rightEye: {
        sphere: result.rightEyeSph ? String(result.rightEyeSph) : "",
        cylinder: result.rightEyeCyl ? String(result.rightEyeCyl) : "",
        axis: result.rightEyeAxis ? String(result.rightEyeAxis) : "",
        addPower: result.addPower ? String(result.addPower) : "",
      },
      leftEye: {
        sphere: result.leftEyeSph ? String(result.leftEyeSph) : "",
        cylinder: result.leftEyeCyl ? String(result.leftEyeCyl) : "",
        axis: result.leftEyeAxis ? String(result.leftEyeAxis) : "",
        addPower: result.addPower ? String(result.addPower) : "",
      },
      pd: result.pd ? String(result.pd) : "",
      notes: result.notes || "",
      createdBy: result.creatorName || "",
      createdAt: result.createdAt.toISOString(),
      isActive: true,
    };
  }

  static async getPrescriptionsByCustomerId(customerId: number) {
    const results = await db.select({
      id: prescriptions.id,
      customerId: prescriptions.customerId,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      rightEyeSph: prescriptions.rightEyeSph,
      rightEyeCyl: prescriptions.rightEyeCyl,
      rightEyeAxis: prescriptions.rightEyeAxis,
      leftEyeSph: prescriptions.leftEyeSph,
      leftEyeCyl: prescriptions.leftEyeCyl,
      leftEyeAxis: prescriptions.leftEyeAxis,
      addPower: prescriptions.addPower,
      pd: prescriptions.pd,
      notes: prescriptions.notes,
      creatorId: users.id,
      creatorName: users.fullName,
      createdAt: prescriptions.createdAt,
      updatedAt: prescriptions.updatedAt,
    })
    .from(prescriptions)
    .innerJoin(customers, eq(prescriptions.customerId, customers.id))
    .innerJoin(users, eq(prescriptions.createdBy, users.id))
    .where(eq(prescriptions.customerId, customerId))
    .orderBy(desc(prescriptions.createdAt));

    return results.map(result => ({
      id: result.id.toString(),
      customerId: result.customerId.toString(),
      customer: {
        id: result.customerId,
        name: result.customerName,
        phone: result.customerPhone,
      },
      rightEye: {
        sphere: result.rightEyeSph ? String(result.rightEyeSph) : "",
        cylinder: result.rightEyeCyl ? String(result.rightEyeCyl) : "",
        axis: result.rightEyeAxis ? String(result.rightEyeAxis) : "",
        addPower: result.addPower ? String(result.addPower) : "",
      },
      leftEye: {
        sphere: result.leftEyeSph ? String(result.leftEyeSph) : "",
        cylinder: result.leftEyeCyl ? String(result.leftEyeCyl) : "",
        axis: result.leftEyeAxis ? String(result.leftEyeAxis) : "",
        addPower: result.addPower ? String(result.addPower) : "",
      },
      pd: result.pd ? String(result.pd) : "",
      notes: result.notes || "",
      createdBy: result.creatorName || "",
      createdAt: result.createdAt.toISOString(),
      isActive: true,
    }));
  }

  static async createPrescription(data: any) {
    const rightEye = data.rightEye || {};
    const leftEye = data.leftEye || {};
    // Grab the add power from either eye
    const addPower = rightEye.addPower || leftEye.addPower || null;

    const mappedData = {
      customerId: data.customerId,
      createdBy: data.createdBy,
      rightEyeSph: rightEye.sphere || null,
      rightEyeCyl: rightEye.cylinder || null,
      rightEyeAxis: rightEye.axis ? parseInt(rightEye.axis, 10) : null,
      leftEyeSph: leftEye.sphere || null,
      leftEyeCyl: leftEye.cylinder || null,
      leftEyeAxis: leftEye.axis ? parseInt(leftEye.axis, 10) : null,
      addPower: addPower,
      pd: data.pd || null,
      notes: data.notes || null,
    };
    const [result] = await db.insert(prescriptions).values(mappedData).returning();
    return this.getPrescriptionById(result.id);
  }

  static async updatePrescription(id: number, data: any) {
    const rightEye = data.rightEye || {};
    const leftEye = data.leftEye || {};
    const addPower = rightEye.addPower || leftEye.addPower || undefined;

    const mappedData: any = {};
    if (data.customerId !== undefined) mappedData.customerId = data.customerId;
    if (rightEye.sphere !== undefined) mappedData.rightEyeSph = rightEye.sphere || null;
    if (rightEye.cylinder !== undefined) mappedData.rightEyeCyl = rightEye.cylinder || null;
    if (rightEye.axis !== undefined) mappedData.rightEyeAxis = rightEye.axis ? parseInt(rightEye.axis, 10) : null;
    if (leftEye.sphere !== undefined) mappedData.leftEyeSph = leftEye.sphere || null;
    if (leftEye.cylinder !== undefined) mappedData.leftEyeCyl = leftEye.cylinder || null;
    if (leftEye.axis !== undefined) mappedData.leftEyeAxis = leftEye.axis ? parseInt(leftEye.axis, 10) : null;
    if (addPower !== undefined) mappedData.addPower = addPower || null;
    if (data.pd !== undefined) mappedData.pd = data.pd || null;
    if (data.notes !== undefined) mappedData.notes = data.notes || null;

    const [result] = await db.update(prescriptions).set(mappedData).where(eq(prescriptions.id, id)).returning();
    if (!result) return undefined;
    return this.getPrescriptionById(result.id);
  }
}
