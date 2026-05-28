import { PrescriptionRepository } from '../repositories/prescription.repository';

export class PrescriptionService {
  static async getPrescriptions(params: any) {
    return await PrescriptionRepository.getPrescriptions(params);
  }

  static async getPrescriptionById(id: number) {
    return await PrescriptionRepository.getPrescriptionById(id);
  }

  static async getPrescriptionsByCustomerId(customerId: number) {
    return await PrescriptionRepository.getPrescriptionsByCustomerId(customerId);
  }

  static async createPrescription(data: any) {
    return await PrescriptionRepository.createPrescription(data);
  }

  static async updatePrescription(id: number, data: any) {
    return await PrescriptionRepository.updatePrescription(id, data);
  }
}
