import { CustomField } from "@/types/custom-field";

export const MOCK_CUSTOM_FIELDS: CustomField[] = [
  {
    id: "cf_1",
    name: "Lens Material",
    key: "lens_material",
    type: "DROPDOWN",
    entityTarget: "PRODUCT",
    placeholder: "Select material",
    isRequired: true,
    options: ["CR-39", "Polycarbonate", "Trivex", "High Index", "Glass"],
    isActive: true,
    createdAt: "2023-01-10T10:00:00Z"
  },
  {
    id: "cf_2",
    name: "Frame Color",
    key: "frame_color",
    type: "COLOR",
    entityTarget: "PRODUCT",
    isRequired: false,
    defaultValue: "#000000",
    isActive: true,
    createdAt: "2023-01-11T14:30:00Z"
  },
  {
    id: "cf_3",
    name: "Patient Age Group",
    key: "patient_age_group",
    type: "DROPDOWN",
    entityTarget: "CUSTOMER",
    placeholder: "Select age group",
    isRequired: false,
    options: ["Child (0-12)", "Teen (13-19)", "Adult (20-60)", "Senior (60+)"],
    isActive: true,
    createdAt: "2023-02-15T09:15:00Z"
  },
  {
    id: "cf_4",
    name: "Medical History Notes",
    key: "medical_history",
    type: "TEXTAREA",
    entityTarget: "CUSTOMER",
    placeholder: "Any existing eye conditions (e.g., Glaucoma, Cataracts)...",
    isRequired: false,
    isActive: true,
    createdAt: "2023-03-22T11:45:00Z"
  },
  {
    id: "cf_5",
    name: "Warranty Months",
    key: "warranty_months",
    type: "NUMBER",
    entityTarget: "PRODUCT",
    placeholder: "12",
    isRequired: false,
    defaultValue: "12",
    isActive: true,
    createdAt: "2023-04-05T16:20:00Z"
  },
  {
    id: "cf_6",
    name: "Included Accessories",
    key: "included_accessories",
    type: "MULTI_SELECT",
    entityTarget: "PRODUCT",
    placeholder: "Select accessories",
    isRequired: false,
    options: ["Case", "Cleaning Cloth", "Screwdriver Tool", "Strap"],
    isActive: true,
    createdAt: "2023-05-10T10:30:00Z"
  }
];
