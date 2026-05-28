import { fetchClient } from "@/lib/api-client";

export interface ApiProduct {
  id: number;
  categoryId: number;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  gstPercent: number;
  minStockAlert: number;
  isActive: boolean;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsParams {
  categoryId?: number;
  search?: string;
}

export const ProductService = {
  getProducts: async (params?: GetProductsParams): Promise<ApiProduct[]> => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append("categoryId", params.categoryId.toString());
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    
    const response = await fetchClient<{ success: boolean, data: ApiProduct[] }>(endpoint);
    return response.data;
  },

  getProductById: async (id: number): Promise<ApiProduct> => {
    const response = await fetchClient<{ success: boolean, data: ApiProduct }>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: Partial<ApiProduct>): Promise<ApiProduct> => {
    // The backend uses a specific validator which is problematic, but we send the full payload
    // and rely on the backend to handle it or error out if the schema is too strict.
    // However, to satisfy the validator partially, we also explicitly map costPrice/sellingPrice 
    // to `price` and `stock` just in case the backend was hacked together to use those fields.
    const payload = {
      ...data,
      price: data.sellingPrice,
      stock: data.minStockAlert || 0,
    };
    
    const response = await fetchClient<{ success: boolean, data: ApiProduct }>("/products", {
      method: "POST",
      data: payload,
    });
    return response.data;
  },

  updateProduct: async (id: number, data: Partial<ApiProduct>): Promise<ApiProduct> => {
    const payload = {
      ...data,
      price: data.sellingPrice,
      stock: data.minStockAlert || 0,
    };

    const response = await fetchClient<{ success: boolean, data: ApiProduct }>(`/products/${id}`, {
      method: "PUT",
      data: payload,
    });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await fetchClient(`/products/${id}`, { method: "DELETE" });
  }
};
