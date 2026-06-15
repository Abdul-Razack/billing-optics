import { VendorRepository } from '../repositories/vendor.repository';
import { AppError } from '../utils/errors';

export class VendorService {
  async create(data: any) {
    const dbData = {
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      isActive: data.isActive ?? true,
    };
    return await VendorRepository.create(dbData);
  }

  async getAll(filters?: { search?: string; isActive?: boolean; page?: number; limit?: number }) {
    return await VendorRepository.findAll(filters || {});
  }

  async getById(id: number) {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) {
      throw new AppError(404, 'Vendor not found');
    }
    return vendor;
  }

  async update(id: number, data: any) {
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.contactPerson !== undefined) dbData.contactPerson = data.contactPerson;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.isActive !== undefined) dbData.isActive = data.isActive;

    return await VendorRepository.update(id, dbData);
  }

  async delete(id: number) {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) {
      throw new AppError(404, 'Vendor not found');
    }
    return await VendorRepository.delete(id);
  }
}

export const vendorService = new VendorService();
