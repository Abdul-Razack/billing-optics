import { CustomerRepository } from '../repositories/customer.repository';

export class CustomerService {
  async create(data: any) {
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

  async getAll() {
    return await CustomerRepository.findAll();
  }

  async getById(id: number) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    const prescriptions = await CustomerRepository.findPrescriptionsByCustomerId(id);
    return {
      ...customer,
      prescriptions,
    };
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
