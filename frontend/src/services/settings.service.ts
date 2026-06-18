import { fetchClient } from "@/lib/api-client";
import { CustomField } from "@/types/custom-field";

export interface CustomFieldDefinitions {
  products: CustomField[];
  customers: CustomField[];
}

export interface ApiSettings {
  id: number;
  businessName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  currency: string;
  timezone: string;
  printerSize: string;
  multiBranchEnabled: boolean;
  customFieldDefinitions: CustomFieldDefinitions;
  createdAt: string;
  updatedAt: string;
}

export const SettingsService = {
  getSettings: async (): Promise<ApiSettings> => {
    const response = await fetchClient<{ success: boolean; data: ApiSettings }>("/settings");
    return response.data;
  },
  
  updateSettings: async (data: Partial<ApiSettings>): Promise<ApiSettings> => {
    const response = await fetchClient<{ success: boolean; data: ApiSettings }>("/settings", {
      method: "PUT",
      data,
    });
    return response.data;
  }
};
