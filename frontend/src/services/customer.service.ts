import { fetchClient } from "@/lib/api-client";
import { ApiCustomer } from "@/types/customer";

export class CustomerService {
  static async getCustomers(search?: string): Promise<ApiCustomer[]> {
    const url = search ? `/customers?search=${encodeURIComponent(search)}` : "/customers";
    const response = await fetchClient<{ success: boolean; data: ApiCustomer[] }>(url);
    if (!response.success) throw new Error("Failed to fetch customers");
    return response.data;
  }

  static async getCustomerById(id: number): Promise<ApiCustomer> {
    const response = await fetchClient<{ success: boolean; data: ApiCustomer }>(`/customers/${id}`);
    if (!response.success) throw new Error("Failed to fetch customer");
    return response.data;
  }

  static async createCustomer(data: any): Promise<ApiCustomer> {
    const response = await fetchClient<{ success: boolean; data: ApiCustomer }>("/customers", {
      method: "POST",
      data,
    });
    if (!response.success) throw new Error("Failed to create customer");
    return response.data;
  }

  static async updateCustomer(id: number, data: any): Promise<ApiCustomer> {
    const response = await fetchClient<{ success: boolean; data: ApiCustomer }>(`/customers/${id}`, {
      method: "PUT",
      data,
    });
    if (!response.success) throw new Error("Failed to update customer");
    return response.data;
  }
}
