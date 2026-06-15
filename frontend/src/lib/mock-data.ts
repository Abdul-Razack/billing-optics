import { Product, Category } from "@/types/product";
import { CustomField } from "@/types/custom-field";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_1", name: "Frames", description: "Spectacle frames", isActive: true },
  { id: "cat_2", name: "Lenses", description: "Ophthalmic lenses", isActive: true },
  { id: "cat_3", name: "Contact Lenses", description: "Daily and monthly contacts", isActive: true },
  { id: "cat_4", name: "Accessories", description: "Cases, cleaning solutions", isActive: true },
];

export const MOCK_CUSTOM_FIELDS: CustomField[] = [
  { key: "key", entityTarget: "PRODUCT" as any, isActive: true, createdAt: "2024-01-01", id: "cf_shape", name: "Shape", type: "DROPDOWN", options: ["Round", "Square", "Aviator", "Cat Eye", "Rectangle"], isRequired: false },
  { key: "key", entityTarget: "PRODUCT" as any, isActive: true, createdAt: "2024-01-01", id: "cf_material", name: "Material", type: "DROPDOWN", options: ["Metal", "Plastic", "Titanium", "Wood"], isRequired: true },
  { key: "key", entityTarget: "PRODUCT" as any, isActive: true, createdAt: "2024-01-01", id: "cf_color", name: "Color", type: "TEXT", isRequired: true },
  { key: "key", entityTarget: "PRODUCT" as any, isActive: true, createdAt: "2024-01-01", id: "cf_lensType", name: "Lens Type", type: "DROPDOWN", options: ["Single Vision", "Bifocal", "Progressive"], isRequired: false },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Ray-Ban Aviator Classic",
    sku: "RB3025",
    barcode: "805289126577",
    categoryId: "cat_1",
    description: "Classic aviator sunglasses with gold frame and green lenses.",
    costPrice: 85.00,
    sellingPrice: 150.00,
    gstPercent: 12,
    minStockAlert: 10,
    currentStock: 45,
    isActive: true,
    stockStatus: "IN_STOCK",
    customFields: {
      cf_shape: "Aviator",
      cf_material: "Metal",
      cf_color: "Gold",
    },
  },
  {
    id: "prod_2",
    name: "Acuvue Oasys 1-Day",
    sku: "ACV-O1D",
    barcode: "733905872144",
    categoryId: "cat_3",
    description: "Daily disposable contact lenses, 30 pack.",
    costPrice: 20.00,
    sellingPrice: 35.00,
    gstPercent: 5,
    minStockAlert: 20,
    currentStock: 5,
    isActive: true,
    stockStatus: "LOW_STOCK",
  },
  {
    id: "prod_3",
    name: "Zeiss Progressive Light",
    sku: "ZSS-PRG-L",
    categoryId: "cat_2",
    description: "Premium progressive lenses.",
    costPrice: 120.00,
    sellingPrice: 250.00,
    gstPercent: 12,
    minStockAlert: 5,
    currentStock: 0,
    isActive: false,
    stockStatus: "OUT_OF_STOCK",
    customFields: {
      cf_lensType: "Progressive",
    }
  },
  {
    id: "prod_4",
    name: "Oakley Holbrook",
    sku: "OKL-HOL",
    barcode: "888392110294",
    categoryId: "cat_1",
    description: "Square plastic frame, matte black.",
    costPrice: 65.00,
    sellingPrice: 130.00,
    gstPercent: 12,
    minStockAlert: 15,
    currentStock: 32,
    isActive: true,
    stockStatus: "IN_STOCK",
    customFields: {
      cf_shape: "Square",
      cf_material: "Plastic",
      cf_color: "Matte Black",
    },
  },
  {
    id: "prod_5",
    name: "Microfiber Cleaning Cloth",
    sku: "ACC-MCC",
    categoryId: "cat_4",
    costPrice: 0.50,
    sellingPrice: 5.00,
    gstPercent: 5,
    minStockAlert: 100,
    currentStock: 500,
    isActive: true,
    stockStatus: "IN_STOCK",
  },
];
