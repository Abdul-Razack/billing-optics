export type FieldType = "TEXT" | "NUMBER" | "DROPDOWN" | "CHECKBOX" | "TEXTAREA" | "DATE" | "COLOR" | "MULTI_SELECT";
export type EntityTarget = "PRODUCT" | "CUSTOMER";

export interface CustomField {
  id: string;
  name: string;
  key: string; // Unique identifier for the field (e.g., 'lens_material')
  type: FieldType;
  entityTarget: EntityTarget;
  placeholder?: string;
  isRequired: boolean;
  defaultValue?: string;
  options?: string[]; // Array of strings for DROPDOWN or MULTI_SELECT
  isActive: boolean;
  createdAt: string;
}
