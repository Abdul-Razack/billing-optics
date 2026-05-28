import { fetchClient } from "@/lib/api-client";

export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
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

  deleteCategory: async (id: number): Promise<void> => {
    await fetchClient(`/categories/${id}`, { method: "DELETE" });
  }
};
