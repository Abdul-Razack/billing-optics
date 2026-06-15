import { fetchClient, ApiResponse } from "@/lib/api-client";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'OPTOMETRIST';
  isActive: boolean;
  preferences?: Record<string, any>;
  phone?: string;
  lastLogin?: string;
  permissions?: string[];
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
    
    const response = await fetchClient<ApiResponse<User[]>>(url);
    if (!response.success) throw new Error("Failed to fetch users");
    return {
      records: response.data,
      pagination: response.meta ? {
        totalRecords: response.meta.totalRecords,
        totalPages: response.meta.totalPages,
        currentPage: response.meta.currentPage,
        limit: response.meta.pageSize
      } : {
        totalRecords: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      }
    };
  }

  static async getById(id: number): Promise<User> {
    const response = await fetchClient<{ success: boolean; data: User }>(`/users/${id}`);
    if (!response.success) throw new Error("Failed to fetch user");
    return response.data;
  }

  static async create(data: Partial<User> & { password?: string }): Promise<User> {
    const res = await fetchClient<{ success: boolean; data: User }>("/users", {
      method: "POST",
      data,
    });
    if (!res.success) throw new Error("Failed to create user");
    return res.data;
  }

  static async update(id: number, data: Partial<User> & { password?: string }): Promise<User> {
    const res = await fetchClient<{ success: boolean; data: User }>(`/users/${id}`, {
      method: "PUT",
      data,
    });
    if (!res.success) throw new Error("Failed to update user");
    return res.data;
  }

  static async updateStatus(id: number, isActive: boolean): Promise<User> {
    const res = await fetchClient<{ success: boolean; data: User }>(`/users/${id}/status`, {
      method: "PATCH",
      data: { isActive },
    });
    if (!res.success) throw new Error("Failed to update user status");
    return res.data;
  }
}
