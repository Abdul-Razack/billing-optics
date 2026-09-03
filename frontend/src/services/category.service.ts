import { fetchClient } from "@/lib/api-client";

export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  parentId?: number | null;
  attributeSchema?: any;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const CategoryService = {
  getCategories: async (): Promise<ApiCategory[]> => {
    const response = await fetchClient<{ success: boolean, data: ApiCategory[] }>("/categories");
    return response.data;
  },

  createCategory: async (data: Partial<ApiCategory>): Promise<ApiCategory> => {
    const response = await fetchClient<{ success: boolean, data: ApiCategory }>("/categories", {
      method: "POST",
      data,
    });
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<ApiCategory>): Promise<ApiCategory> => {
    const response = await fetchClient<{ success: boolean, data: ApiCategory }>(`/categories/${id}`, {
      method: "PUT",
      data,
    });
    return response.data;
  },

  getCategory: async (id: number): Promise<ApiCategory> => {
    const response = await fetchClient<{ success: boolean, data: ApiCategory }>(`/categories/${id}`);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await fetchClient(`/categories/${id}`, { method: "DELETE" });
  }
};
