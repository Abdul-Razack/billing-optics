import { fetchClient } from "@/lib/api-client";

export type AttributeInputType = "SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";

export interface ApiAttributeOption {
  id: number;
  attributeDefinitionId: number;
  value: string;
  isActive: boolean;
}

export interface ApiAttributeDefinition {
  id: number;
  categoryId: number;
  name: string;   // camelCase internal key, e.g. "frameColor"
  label: string;  // User-facing label, e.g. "Frame Color"
  inputType: AttributeInputType;
  isRequired: boolean;
  displayOrder: number;
  options: ApiAttributeOption[];
}

export const ProductAttributeService = {
  /** Get all attribute definitions (with their options) for a given category */
  getAttributesByCategory: async (categoryId: number): Promise<ApiAttributeDefinition[]> => {
    const response = await fetchClient<{ success: boolean; data: ApiAttributeDefinition[] }>(
      `/product-attributes/categories/${categoryId}/attributes`
    );
    return response.data;
  },

  /** Create a new attribute definition for a category */
  createAttributeDefinition: async (data: {
    categoryId: number;
    name: string;
    label: string;
    inputType: AttributeInputType;
    isRequired: boolean;
    displayOrder?: number;
  }): Promise<ApiAttributeDefinition> => {
    const response = await fetchClient<{ success: boolean; data: ApiAttributeDefinition }>(
      `/product-attributes/attributes`,
      { method: "POST", data }
    );
    return response.data;
  },

  /** Add a new option value to a SELECT-type attribute */
  createAttributeOption: async (
    attributeDefinitionId: number,
    value: string
  ): Promise<ApiAttributeOption> => {
    const response = await fetchClient<{ success: boolean; data: ApiAttributeOption }>(
      `/product-attributes/attributes/${attributeDefinitionId}/options`,
      { method: "POST", data: { value } }
    );
    return response.data;
  },

  /** Delete an attribute definition and all its options */
  deleteAttributeDefinition: async (id: number): Promise<void> => {
    await fetchClient(`/product-attributes/attributes/${id}`, { method: "DELETE" });
  },
};
