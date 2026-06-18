import { eq, sql, ilike, or, and, desc, asc } from 'drizzle-orm';
import { db } from '../config/db';
import { prescriptions, prescriptionTests } from '../db/schema/prescriptions';
import { customers } from '../db/schema/customers';
import { patients } from '../db/schema/patients';
import { doctors } from '../db/schema/doctors';
import { users } from '../db/schema/users';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

export class PrescriptionRepository {
  static async getPrescriptions(params: any) {
    const { page, limit, offset } = getPaginationParams(
      params.page ? parseInt(params.page, 10) : undefined,
      params.limit ? parseInt(params.limit, 10) : undefined
    );
    const { search, sortBy } = params;

    const conditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(patients.name, searchTerm),
          ilike(customers.fullName, searchTerm),
          ilike(customers.phone, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy: any = desc(prescriptions.createdAt);
    if (sortBy === 'oldest') {
      orderBy = asc(prescriptions.createdAt);
    }

    const results = await db.query.prescriptions.findMany({
      where: whereClause,
      orderBy: orderBy,
      limit: limit,
      offset: offset,
      with: {
        tests: true,
        customer: true,
        patient: true,
        doctor: true,
        creator: true,
      }
    });

    const [countResult] = await db.select({
      total: sql<number>`count(*)::int`
    })
    .from(prescriptions)
    .leftJoin(customers, eq(prescriptions.customerId, customers.id))
    .leftJoin(patients, eq(prescriptions.patientId, patients.id))
    .where(whereClause);

    return buildPaginatedResponse(
      results.map(r => this.formatRecord(r)),
      countResult.total || 0,
      page,
      limit
    );
  }

  static async getPrescriptionById(id: number) {
    const result = await db.query.prescriptions.findFirst({
      where: eq(prescriptions.id, id),
      with: {
        tests: true,
        customer: true,
        patient: true,
        doctor: true,
        creator: true,
      }
    });

    if (!result) return undefined;
    return this.formatRecord(result);
  }

  static async getPrescriptionsByCustomerId(customerId: number) {
    const results = await db.query.prescriptions.findMany({
      where: eq(prescriptions.customerId, customerId),
      orderBy: desc(prescriptions.createdAt),
      with: {
        tests: true,
        customer: true,
        patient: true,
        doctor: true,
        creator: true,
      }
    });

    return results.map(r => this.formatRecord(r));
  }

  static async createPrescription(data: any) {
    const mappedData = {
      customerId: data.customerId || null,
      patientId: data.patientId || null,
      doctorId: data.doctorId || null,
      createdBy: data.createdBy,
      
      prescriptionType: data.prescriptionType || 'EYEWEAR',
      cardDescription: data.cardDescription || null,
      countInRecords: data.countInRecords !== undefined ? data.countInRecords : true,

      lensTypes: data.lensTypes || [],
      notes: data.notes || null,
    };
    
    return await db.transaction(async (tx) => {
      const [result] = await tx.insert(prescriptions).values(mappedData).returning();
      
      if (data.tests && data.tests.length > 0) {
        const testsToInsert = data.tests.map((test: any) => this.mapTestInput(test, result.id));
        await tx.insert(prescriptionTests).values(testsToInsert);
      }

      const created = await tx.query.prescriptions.findFirst({
        where: eq(prescriptions.id, result.id),
        with: {
          tests: true,
          customer: true,
          patient: true,
          doctor: true,
          creator: true,
        }
      });
      return created ? this.formatRecord(created) : null;
    });
  }

  static async updatePrescription(id: number, data: any) {
    const mappedData: any = {};
    if (data.customerId !== undefined) mappedData.customerId = data.customerId || null;
    if (data.patientId !== undefined) mappedData.patientId = data.patientId || null;
    if (data.doctorId !== undefined) mappedData.doctorId = data.doctorId || null;
    
    if (data.prescriptionType !== undefined) mappedData.prescriptionType = data.prescriptionType;
    if (data.cardDescription !== undefined) mappedData.cardDescription = data.cardDescription;
    if (data.countInRecords !== undefined) mappedData.countInRecords = data.countInRecords;

    if (data.lensTypes !== undefined) mappedData.lensTypes = data.lensTypes || [];
    if (data.notes !== undefined) mappedData.notes = data.notes || null;

    return await db.transaction(async (tx) => {
      if (Object.keys(mappedData).length > 0) {
        await tx.update(prescriptions).set(mappedData).where(eq(prescriptions.id, id));
      }

      if (data.tests !== undefined) {
        await tx.delete(prescriptionTests).where(eq(prescriptionTests.prescriptionId, id));
        if (data.tests.length > 0) {
          const testsToInsert = data.tests.map((test: any) => this.mapTestInput(test, id));
          await tx.insert(prescriptionTests).values(testsToInsert);
        }
      }

      const updated = await tx.query.prescriptions.findFirst({
        where: eq(prescriptions.id, id),
        with: {
          tests: true,
          customer: true,
          patient: true,
          doctor: true,
          creator: true,
        }
      });
      return updated ? this.formatRecord(updated) : null;
    });
  }

  private static mapTestInput(test: any, prescriptionId: number) {
    const rDv = test.rightEyeDv || {};
    const rNv = test.rightEyeNv || {};
    const lDv = test.leftEyeDv || {};
    const lNv = test.leftEyeNv || {};

    return {
      prescriptionId,
      testType: test.testType,

      rightEyeDvSph: rDv.sph || null,
      rightEyeDvCyl: rDv.cyl || null,
      rightEyeDvAxis: rDv.axis ? parseInt(rDv.axis, 10) : null,
      rightEyeDvVa: rDv.va || null,

      rightEyeNvSph: rNv.sph || null,
      rightEyeNvCyl: rNv.cyl || null,
      rightEyeNvAxis: rNv.axis ? parseInt(rNv.axis, 10) : null,
      rightEyeNvVa: rNv.va || null,

      rightEyeAdd: test.rightEyeAdd || null,
      rightEyePd: test.rightEyePd || null,

      leftEyeDvSph: lDv.sph || null,
      leftEyeDvCyl: lDv.cyl || null,
      leftEyeDvAxis: lDv.axis ? parseInt(lDv.axis, 10) : null,
      leftEyeDvVa: lDv.va || null,

      leftEyeNvSph: lNv.sph || null,
      leftEyeNvCyl: lNv.cyl || null,
      leftEyeNvAxis: lNv.axis ? parseInt(lNv.axis, 10) : null,
      leftEyeNvVa: lNv.va || null,

      leftEyeAdd: test.leftEyeAdd || null,
      leftEyePd: test.leftEyePd || null,
    };
  }

  private static formatRecord(r: any) {
    return {
      id: r.id.toString(),
      prescriptionType: r.prescriptionType,
      cardDescription: r.cardDescription,
      countInRecords: r.countInRecords,
      customerId: r.customerId ? r.customerId.toString() : null,
      customer: r.customer ? {
        id: r.customer.id,
        name: r.customer.fullName,
        phone: r.customer.phone,
      } : null,
      patientId: r.patientId ? r.patientId.toString() : null,
      patient: r.patient ? {
        id: r.patient.id,
        name: r.patient.name,
        age: r.patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(r.patient.dateOfBirth).getTime()) / 31557600000) : null,
        gender: r.patient.gender,
      } : null,
      doctorId: r.doctorId ? r.doctorId.toString() : null,
      doctor: r.doctor ? {
        id: r.doctor.id,
        name: r.doctor.name,
      } : null,
      lensTypes: r.lensTypes || [],
      notes: r.notes || "",
      tests: (r.tests || []).map((t: any) => ({
        id: t.id,
        testType: t.testType,
        rightEyeDv: {
          sph: t.rightEyeDvSph ? String(t.rightEyeDvSph) : "",
          cyl: t.rightEyeDvCyl ? String(t.rightEyeDvCyl) : "",
          axis: t.rightEyeDvAxis ? String(t.rightEyeDvAxis) : "",
          va: t.rightEyeDvVa || "",
        },
        rightEyeNv: {
          sph: t.rightEyeNvSph ? String(t.rightEyeNvSph) : "",
          cyl: t.rightEyeNvCyl ? String(t.rightEyeNvCyl) : "",
          axis: t.rightEyeNvAxis ? String(t.rightEyeNvAxis) : "",
          va: t.rightEyeNvVa || "",
        },
        rightEyeAdd: t.rightEyeAdd ? String(t.rightEyeAdd) : "",
        rightEyePd: t.rightEyePd ? String(t.rightEyePd) : "",
        leftEyeDv: {
          sph: t.leftEyeDvSph ? String(t.leftEyeDvSph) : "",
          cyl: t.leftEyeDvCyl ? String(t.leftEyeDvCyl) : "",
          axis: t.leftEyeDvAxis ? String(t.leftEyeDvAxis) : "",
          va: t.leftEyeDvVa || "",
        },
        leftEyeNv: {
          sph: t.leftEyeNvSph ? String(t.leftEyeNvSph) : "",
          cyl: t.leftEyeNvCyl ? String(t.leftEyeNvCyl) : "",
          axis: t.leftEyeNvAxis ? String(t.leftEyeNvAxis) : "",
          va: t.leftEyeNvVa || "",
        },
        leftEyeAdd: t.leftEyeAdd ? String(t.leftEyeAdd) : "",
        leftEyePd: t.leftEyePd ? String(t.leftEyePd) : "",
      })),
      createdBy: r.creator ? r.creator.fullName : "",
      createdAt: r.createdAt.toISOString(),
      isActive: true,
    };
  }
}
