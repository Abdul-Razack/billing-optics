import { fetchClient } from "@/lib/api-client";

export interface ApiProduct {
  id: number;
  categoryId: number;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  costPrice: number;
  mrp?: number; // MRP / retail price (optional)
  sellingPrice: number;
  gstPercent: number;
  minStockAlert: number;
  stock?: number;
  isActive: boolean;
  productType?: string; // FRAME | LENS | CONTACT_LENS | SUNGLASSES | SOLUTION | OTHER
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
    const response = await fetchClient<{ success: boolean, data: ApiProduct }>("/products", {
      method: "POST",
      data,
    });
    return response.data;
  },

  updateProduct: async (id: number, data: Partial<ApiProduct>): Promise<ApiProduct> => {
    const response = await fetchClient<{ success: boolean, data: ApiProduct }>(`/products/${id}`, {
      method: "PUT",
      data,
    });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await fetchClient(`/products/${id}`, { method: "DELETE" });
  }
};
