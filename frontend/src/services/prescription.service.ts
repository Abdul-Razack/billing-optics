import { fetchClient } from "@/lib/api-client";
import { Prescription } from "@/types/prescription";

export class PrescriptionService {
  static async getPrescriptions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
  }): Promise<{ data: Prescription[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, value.toString());
        }
      });
    }
    
    const queryString = query.toString();
    const endpoint = queryString ? `/prescriptions?${queryString}` : "/prescriptions";
    
    const response = await fetchClient<{ success: boolean; data: { data: Prescription[]; total: number; page: number; totalPages: number } }>(endpoint);
    return response.data;
  }

  static async getPrescriptionById(id: number | string): Promise<Prescription> {
    const response = await fetchClient<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`);
    return response.data;
  }

  static async getPrescriptionsByCustomerId(customerId: number | string): Promise<Prescription[]> {
    const response = await fetchClient<{ success: boolean; data: Prescription[] }>(`/prescriptions/customer/${customerId}`);
    return response.data;
  }

  static async createPrescription(data: Partial<Prescription>): Promise<Prescription> {
    const response = await fetchClient<{ success: boolean; data: Prescription }>("/prescriptions", {
      method: "POST",
      data,
    });
    return response.data;
  }

  static async updatePrescription(id: number | string, data: Partial<Prescription>): Promise<Prescription> {
    const response = await fetchClient<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`, {
      method: "PUT",
      data,
    });
    return response.data;
  }
}
