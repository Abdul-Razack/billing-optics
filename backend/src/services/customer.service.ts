import { CustomerRepository } from '../repositories/customer.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { db } from '../config/db';

export class CustomerService {
  async create(data: any) {
    const existing = await CustomerRepository.findAll(data.phone);
    if (existing.some((c: any) => c.phone === data.phone)) {
      throw { status: 400, message: 'Phone number already exists' };
    }
    const dbData = {
      fullName: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
      gender: data.gender,
      isActive: data.isActive ?? true,
    };
    return await CustomerRepository.create(dbData);
  }

  async getAll(search?: string) {
    return await CustomerRepository.findAll(search);
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
    if (data.name !== undefined) dbData.fullName = data.name;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.notes !== undefined) dbData.notes = data.notes;
    if (data.gender !== undefined) dbData.gender = data.gender;
    if (data.isActive !== undefined) dbData.isActive = data.isActive;

    return await CustomerRepository.update(id, dbData);
  }

  async addPrescription(customerId: number, data: any) {
    return await CustomerRepository.addPrescription({
      customerId,
      rightEyeSph: data.rightEyeSph?.toString(),
      rightEyeCyl: data.rightEyeCyl?.toString(),
      rightEyeAxis: data.rightEyeAxis,
      leftEyeSph: data.leftEyeSph?.toString(),
      leftEyeCyl: data.leftEyeCyl?.toString(),
      leftEyeAxis: data.leftEyeAxis,
      addPower: data.addPower?.toString(),
      pd: data.pd?.toString(),
      notes: data.notes,
      createdBy: data.createdBy,
    });
  }
}

export const customerService = new CustomerService();
