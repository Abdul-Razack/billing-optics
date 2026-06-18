import { Prescription } from "@/types/prescription";

export const MOCK_PRESCRIPTIONS: any[] = [
  {
    id: "rx_1",
    customerId: "cust_1", // John Doe
    rightEye: {
      sphere: "-1.50",
      cylinder: "-0.50",
      axis: "180",
      addPower: "+1.25",
    },
    leftEye: {
      sphere: "-1.75",
      cylinder: "-0.25",
      axis: "175",
      addPower: "+1.25",
    },
    pd: "64",
    notes: "Patient reports slight blurriness at night. Recommend anti-reflective coating.",
    createdBy: "Dr. Smith",
    createdAt: "2023-10-15T09:30:00Z",
    isActive: true,
  },
  {
    id: "rx_2",
    customerId: "cust_2", // Jane Smith
    rightEye: {
      sphere: "+2.00",
      cylinder: "",
      axis: "",
    },
    leftEye: {
      sphere: "+2.25",
      cylinder: "-0.50",
      axis: "90",
    },
    pd: "31/31.5",
    notes: "Reading glasses only.",
    createdBy: "Dr. Adams",
    createdAt: "2023-11-02T14:15:00Z",
    isActive: true,
  },
  {
    id: "rx_3",
    customerId: "cust_1", // John Doe (older prescription)
    rightEye: {
      sphere: "-1.25",
      cylinder: "-0.50",
      axis: "180",
    },
    leftEye: {
      sphere: "-1.50",
      cylinder: "-0.25",
      axis: "170",
    },
    pd: "64",
    notes: "First time wearer.",
    createdBy: "Dr. Smith",
    createdAt: "2022-05-10T11:00:00Z",
    isActive: false, // Superseded by rx_1
  }
];
