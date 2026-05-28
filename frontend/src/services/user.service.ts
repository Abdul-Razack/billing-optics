import { fetchClient } from "@/lib/api-client";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'OPTOMETRIST';
  isActive: boolean;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserResponse {
  records: User[];
  pagination: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export class UserService {
  static async getAll(query: UserQuery = {}): Promise<UserResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.role) params.append("role", query.role);
    if (query.isActive !== undefined) params.append("isActive", query.isActive.toString());

    const queryString = params.toString();
    const url = `/users${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchClient<{ success: boolean; data: UserResponse }>(url);
    if (!response.success) throw new Error("Failed to fetch users");
    return response.data;
  }

  static async getById(id: number): Promise<User> {
    const response = await fetchClient<{ success: boolean; data: User }>(`/users/${id}`);
    if (!response.success) throw new Error("Failed to fetch user");
    return response.data;
  }

  static async create(data: Partial<User> & { password?: string }): Promise<User> {
    const response = await fetchClient<{ success: boolean; data: User }>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) throw new Error("Failed to create user");
    return response.data;
  }

  static async update(id: number, data: Partial<User> & { password?: string }): Promise<User> {
    const response = await fetchClient<{ success: boolean; data: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) throw new Error("Failed to update user");
    return response.data;
  }

  static async updateStatus(id: number, isActive: boolean): Promise<User> {
    const response = await fetchClient<{ success: boolean; data: User }>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    if (!response.success) throw new Error("Failed to update user status");
    return response.data;
  }
}
