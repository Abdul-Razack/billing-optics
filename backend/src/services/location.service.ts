import { LocationRepository } from '../repositories/location.repository';
import { AppError } from '../utils/errors';

export class LocationService {
  async create(data: any) {
    const existing = await LocationRepository.findAll({ search: data.code });
    if (existing.data.some((l: any) => l.code === data.code)) {
      throw new AppError(400, 'Location code already exists');
    }
    
    const dbData = {
      name: data.name,
      code: data.code,
      address: data.address,
      contactNumber: data.contactNumber,
      isActive: data.isActive ?? true,
    };

    return await LocationRepository.create(dbData);
  }

  async getAll(filters: { search?: string; isActive?: boolean; page?: number; limit?: number }) {
    return await LocationRepository.findAll(filters);
  }

  async getById(id: number) {
    const location = await LocationRepository.findById(id);
    if (!location) {
      throw new AppError(404, 'Location not found');
    }
    return location;
  }

  async update(id: number, data: any) {
    const location = await LocationRepository.findById(id);
    if (!location) {
      throw new AppError(404, 'Location not found');
    }

    if (data.code && data.code !== location.code) {
      const existing = await LocationRepository.findAll({ search: data.code });
      if (existing.data.some((l: any) => l.code === data.code && l.id !== id)) {
        throw new AppError(400, 'Location code already exists');
      }
    }

    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.code !== undefined) dbData.code = data.code;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.contactNumber !== undefined) dbData.contactNumber = data.contactNumber;
    if (data.isActive !== undefined) dbData.isActive = data.isActive;

    return await LocationRepository.update(id, dbData);
  }

  async delete(id: number) {
    const location = await LocationRepository.findById(id);
    if (!location) {
      throw new AppError(404, 'Location not found');
    }
    // Could check if branch has related sales before deleting, 
    // but DB constraints might restrict it anyway.
    return await LocationRepository.delete(id);
  }
}

export const locationService = new LocationService();
