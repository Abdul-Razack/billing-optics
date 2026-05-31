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
      const latestPrescription = allPrescriptions.length > 0 ? {
        id: allPrescriptions[0].id.toString(),
        rightEye: {
          sphere: allPrescriptions[0].rightEyeSph ? String(allPrescriptions[0].rightEyeSph) : "",
          cylinder: allPrescriptions[0].rightEyeCyl ? String(allPrescriptions[0].rightEyeCyl) : "",
          axis: allPrescriptions[0].rightEyeAxis ? String(allPrescriptions[0].rightEyeAxis) : "",
          addPower: allPrescriptions[0].addPower ? String(allPrescriptions[0].addPower) : "",
        },
        leftEye: {
          sphere: allPrescriptions[0].leftEyeSph ? String(allPrescriptions[0].leftEyeSph) : "",
          cylinder: allPrescriptions[0].leftEyeCyl ? String(allPrescriptions[0].leftEyeCyl) : "",
          axis: allPrescriptions[0].leftEyeAxis ? String(allPrescriptions[0].leftEyeAxis) : "",
          addPower: allPrescriptions[0].addPower ? String(allPrescriptions[0].addPower) : "",
        },
        pd: allPrescriptions[0].pd ? String(allPrescriptions[0].pd) : "",
        notes: allPrescriptions[0].notes || "",
        createdAt: allPrescriptions[0].createdAt.toISOString(),
      } : null;

      const recentHistory = allPrescriptions.slice(0, 5).map(p => ({
        id: p.id.toString(),
        createdAt: p.createdAt.toISOString(),
        notes: p.notes,
        pd: p.pd ? String(p.pd) : "",
        addPower: p.addPower ? String(p.addPower) : "",
      }));

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
      rightEyeSph: rightEye.sphere?.toString(),
      rightEyeCyl: rightEye.cylinder?.toString(),
      rightEyeAxis: rightEye.axis ? parseInt(rightEye.axis, 10) : null,
      leftEyeSph: leftEye.sphere?.toString(),
      leftEyeCyl: leftEye.cylinder?.toString(),
      leftEyeAxis: leftEye.axis ? parseInt(leftEye.axis, 10) : null,
      addPower: data.addPower || rightEye.addPower || leftEye.addPower || null,
      pd: data.pd?.toString(),
      notes: data.notes,
    });
  }
}

export const customerService = new CustomerService();
