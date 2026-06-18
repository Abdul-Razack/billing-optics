import { CustomerRepository } from '../repositories/customer.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { db } from '../config/db';
import { AppError } from '../utils/errors';

export class CustomerService {
  async create(data: any) {
    const existing = await CustomerRepository.findAll({ search: data.phone });
    if (existing.data.some((c: any) => c.phone === data.phone)) {
      throw new AppError(400, 'Phone number already exists');
    }
    const dbData = {
      fullName: data.fullName || data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
      gender: data.gender,
      isActive: data.isActive ?? true,
      customFields: data.customFields || {},
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      anniversaryDate: data.anniversaryDate ? new Date(data.anniversaryDate) : undefined,
      isDnd: data.isDnd ?? false,
      labels: data.labels || [],
      loyaltyPoints: data.loyaltyPoints ?? 0,
      referredBy: data.referredBy,
    };
    return await CustomerRepository.create(dbData);
  }

  async getAll(filters?: { search?: string; isActive?: boolean; page?: number; limit?: number }) {
    return await CustomerRepository.findAll(filters || {});
  }

  async getById(id: number, includePrescriptions?: boolean) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    let result: any = { ...customer };

    if (includePrescriptions) {
      const allPrescriptions = await CustomerRepository.findPrescriptionsByCustomerId(id);
      
      const prescriptionCount = allPrescriptions.length;
      const latestTest = allPrescriptions.length > 0 && allPrescriptions[0].tests && allPrescriptions[0].tests.length > 0
        ? allPrescriptions[0].tests[0]
        : null;

      const latestPrescription = latestTest ? {
        id: allPrescriptions[0].id.toString(),
        rightEye: {
          sphere: latestTest.rightEyeDvSph ? String(latestTest.rightEyeDvSph) : "",
          cylinder: latestTest.rightEyeDvCyl ? String(latestTest.rightEyeDvCyl) : "",
          axis: latestTest.rightEyeDvAxis ? String(latestTest.rightEyeDvAxis) : "",
          addPower: latestTest.rightEyeAdd ? String(latestTest.rightEyeAdd) : "",
        },
        leftEye: {
          sphere: latestTest.leftEyeDvSph ? String(latestTest.leftEyeDvSph) : "",
          cylinder: latestTest.leftEyeDvCyl ? String(latestTest.leftEyeDvCyl) : "",
          axis: latestTest.leftEyeDvAxis ? String(latestTest.leftEyeDvAxis) : "",
          addPower: latestTest.leftEyeAdd ? String(latestTest.leftEyeAdd) : "",
        },
        pd: latestTest.rightEyePd ? String(latestTest.rightEyePd) : "",
        notes: allPrescriptions[0].notes || "",
        createdAt: allPrescriptions[0].createdAt.toISOString(),
      } : null;

      const recentHistory = allPrescriptions.slice(0, 5).map((p: any) => {
        const test = p.tests && p.tests.length > 0 ? p.tests[0] : null;
        return {
          id: p.id.toString(),
          createdAt: p.createdAt.toISOString(),
          notes: p.notes,
          pd: test && test.rightEyePd ? String(test.rightEyePd) : "",
          addPower: test && test.rightEyeAdd ? String(test.rightEyeAdd) : "",
        };
      });

      result = {
        ...result,
        prescriptionCount,
        latestPrescription,
        prescriptionHistory: recentHistory,
      };
    }
    
    const invoiceRepo = new InvoiceRepository();
    const invoices = await invoiceRepo.findInvoicesByCustomerId(id, db);
    result.invoices = invoices;

    return result;
  }

  async update(id: number, data: any) {
    const dbData: any = {};
    if (data.fullName !== undefined) dbData.fullName = data.fullName;
    else if (data.name !== undefined) dbData.fullName = data.name;
    
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.notes !== undefined) dbData.notes = data.notes;
    if (data.gender !== undefined) dbData.gender = data.gender;
    if (data.isActive !== undefined) dbData.isActive = data.isActive;
    if (data.customFields !== undefined) dbData.customFields = data.customFields;
    
    if (data.dateOfBirth !== undefined) dbData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    if (data.anniversaryDate !== undefined) dbData.anniversaryDate = data.anniversaryDate ? new Date(data.anniversaryDate) : null;
    if (data.isDnd !== undefined) dbData.isDnd = data.isDnd;
    if (data.labels !== undefined) dbData.labels = data.labels;
    if (data.loyaltyPoints !== undefined) dbData.loyaltyPoints = data.loyaltyPoints;
    if (data.referredBy !== undefined) dbData.referredBy = data.referredBy;

    return await CustomerRepository.update(id, dbData);
  }

  async delete(id: number) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }
    return await CustomerRepository.delete(id);
  }

  async addPrescription(customerId: number, data: any) {
    const rightEye = data.rightEye || {};
    const leftEye = data.leftEye || {};
    return await CustomerRepository.addPrescription({
      customerId,
      createdBy: data.createdBy,
      notes: data.notes,
      tests: [{
        testType: 'SPECTACLE',
        rightEyeDvSph: rightEye.sphere?.toString(),
        rightEyeDvCyl: rightEye.cylinder?.toString(),
        rightEyeDvAxis: rightEye.axis ? parseInt(rightEye.axis, 10) : null,
        leftEyeDvSph: leftEye.sphere?.toString(),
        leftEyeDvCyl: leftEye.cylinder?.toString(),
        leftEyeDvAxis: leftEye.axis ? parseInt(leftEye.axis, 10) : null,
        rightEyeAdd: data.addPower || rightEye.addPower || leftEye.addPower || null,
        leftEyeAdd: data.addPower || rightEye.addPower || leftEye.addPower || null,
        rightEyePd: data.pd?.toString(),
        leftEyePd: data.pd?.toString(),
      }],
    } as any);
  }

  async getBirthdays(month: number) {
    return await CustomerRepository.findBirthdays(month);
  }

  async getAnniversaries(month: number) {
    return await CustomerRepository.findAnniversaries(month);
  }

  async getTopReferrers(limit?: number) {
    return await CustomerRepository.findTopReferrers(limit);
  }

  async getLoyaltyLeaderboard(limit?: number) {
    return await CustomerRepository.findLoyaltyLeaderboard(limit);
  }
}

export const customerService = new CustomerService();
