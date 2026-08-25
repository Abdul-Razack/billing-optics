import { LabJobRepository } from '../repositories/labJob.repository';
import { AppError } from '../utils/errors';

export class LabJobService {
  async create(data: any) {
    const dbData = {
      jobTitle: data.jobTitle,
      invoiceId: data.invoiceId,
      // Wire the clinical chain FKs — these were silently dropped before
      invoiceItemId: data.invoiceItemId ? Number(data.invoiceItemId) : null,
      prescriptionId: data.prescriptionId ? Number(data.prescriptionId) : null,
      vendorId: data.vendorId || null,
      status: data.status || 'PENDING',
      notes: data.notes,
      expectedDate: data.expectedDate || null,
      sentDate: data.sentDate || null,
      receivedDate: data.receivedDate || null,
    };
    return await LabJobRepository.create(dbData);
  }

  async getAll(filters?: { search?: string; status?: string; vendorId?: number; invoiceId?: number; page?: number; limit?: number }) {
    return await LabJobRepository.findAll(filters || {});
  }

  async getById(id: number) {
    const job = await LabJobRepository.findById(id);
    if (!job) {
      throw new AppError(404, 'Lab Job not found');
    }
    return job;
  }

  async update(id: number, data: any) {
    const dbData: any = {};
    if (data.jobTitle !== undefined) dbData.jobTitle = data.jobTitle;
    if (data.vendorId !== undefined) dbData.vendorId = data.vendorId;
    if (data.status !== undefined) dbData.status = data.status;
    if (data.notes !== undefined) dbData.notes = data.notes;
    if (data.expectedDate !== undefined) dbData.expectedDate = data.expectedDate;
    if (data.sentDate !== undefined) dbData.sentDate = data.sentDate;
    if (data.receivedDate !== undefined) dbData.receivedDate = data.receivedDate;
    // Allow patching the clinical FKs on update as well
    if (data.invoiceItemId !== undefined) dbData.invoiceItemId = data.invoiceItemId ? Number(data.invoiceItemId) : null;
    if (data.prescriptionId !== undefined) dbData.prescriptionId = data.prescriptionId ? Number(data.prescriptionId) : null;

    return await LabJobRepository.update(id, dbData);
  }

  async delete(id: number) {
    const job = await LabJobRepository.findById(id);
    if (!job) {
      throw new AppError(404, 'Lab Job not found');
    }
    return await LabJobRepository.delete(id);
  }
}

export const labJobService = new LabJobService();


