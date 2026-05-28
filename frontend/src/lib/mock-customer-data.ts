import { Customer, CustomerCustomField } from "@/types/customer";

export const MOCK_CUSTOMER_FIELDS: CustomerCustomField[] = [
  { id: "cf_prefBrand", name: "Preferred Brand", type: "dropdown", options: ["Ray-Ban", "Oakley", "Zeiss", "Acuvue", "None"], required: false },
  { id: "cf_faceShape", name: "Face Shape", type: "dropdown", options: ["Round", "Oval", "Square", "Heart", "Diamond"], required: false },
  { id: "cf_loyalty", name: "Loyalty Member", type: "checkbox", required: false },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust_1",
    fullName: "John Doe",
    phone: "+1 555-0100",
    email: "john.doe@example.com",
    address: "123 Main St, Springfield, IL 62701",
    notes: "Prefers evening appointments.",
    stats: {
      totalPurchases: 5,
      lastPurchaseDate: "2023-10-15",
      totalSpent: 1250.50,
    },
    customFields: {
      cf_prefBrand: "Ray-Ban",
      cf_faceShape: "Oval",
      cf_loyalty: true,
    }
  },
  {
    id: "cust_2",
    fullName: "Jane Smith",
    phone: "+1 555-0101",
    email: "jane.smith@example.com",
    address: "456 Oak Ave, Springfield, IL 62702",
    stats: {
      totalPurchases: 1,
      lastPurchaseDate: "2023-11-02",
      totalSpent: 200.00,
    },
    customFields: {
      cf_faceShape: "Round",
    }
  },
  {
    id: "cust_3",
    fullName: "Robert Johnson",
    phone: "+1 555-0102",
    address: "789 Pine Ln, Springfield, IL 62703",
    notes: "Requires high-index lenses.",
    stats: {
      totalPurchases: 12,
      lastPurchaseDate: "2023-11-20",
      totalSpent: 4500.00,
    },
    customFields: {
      cf_prefBrand: "Zeiss",
      cf_loyalty: true,
    }
  },
  {
    id: "cust_4",
    fullName: "Emily Davis",
    phone: "+1 555-0103",
    email: "emily.d@example.com",
    stats: {
      totalPurchases: 0,
      totalSpent: 0,
    }
  },
  {
    id: "cust_5",
    fullName: "Michael Wilson",
    phone: "+1 555-0104",
    email: "m.wilson@example.com",
    address: "321 Cedar Blvd, Springfield, IL 62704",
    stats: {
      totalPurchases: 3,
      lastPurchaseDate: "2023-09-05",
      totalSpent: 850.75,
    },
    customFields: {
      cf_prefBrand: "Oakley",
      cf_faceShape: "Square",
      cf_loyalty: false,
    }
  }
];

export const MOCK_PRESCRIPTIONS = [
  { id: "rx_1", customerId: "cust_1", date: "2023-10-15", doctor: "Dr. Smith", od_sph: "-1.50", od_cyl: "-0.50", od_axis: "180", os_sph: "-1.25", os_cyl: "0", os_axis: "0" },
  { id: "rx_2", customerId: "cust_3", date: "2023-11-20", doctor: "Dr. Jones", od_sph: "-4.50", od_cyl: "-1.00", od_axis: "90", os_sph: "-4.75", os_cyl: "-0.75", os_axis: "85" },
];

export const MOCK_INVOICES = [
  { id: "inv_1", customerId: "cust_1", date: "2023-10-15", total: 350.00, status: "PAID" },
  { id: "inv_2", customerId: "cust_2", date: "2023-11-02", total: 200.00, status: "PENDING" },
  { id: "inv_3", customerId: "cust_3", date: "2023-11-20", total: 650.00, status: "PAID" },
];
