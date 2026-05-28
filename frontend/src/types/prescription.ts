export interface EyeMeasurement {
  sphere: string; // Stored as string to handle "+1.50" or "-2.00" explicitly
  cylinder: string;
  axis: string;
  addPower?: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  rightEye: EyeMeasurement;
  leftEye: EyeMeasurement;
  pd: string; // Pupillary Distance, e.g. "62" or "31/31"
  notes?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}
