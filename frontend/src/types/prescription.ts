export interface EyeMeasurement {
  sph?: string | null;
  cyl?: string | null;
  axis?: number | null;
  va?: string | null;
}

export type TestType = 'OLD_LENS' | 'AR_READING' | 'MANUAL_TESTING' | 'SPECTACLE';

export interface PrescriptionTest {
  id?: number;
  prescriptionId?: number;
  testType: TestType;
  
  rightEyeDv?: EyeMeasurement;
  rightEyeNv?: EyeMeasurement;
  rightEyeAdd?: string | null;
  rightEyePd?: string | null;

  leftEyeDv?: EyeMeasurement;
  leftEyeNv?: EyeMeasurement;
  leftEyeAdd?: string | null;
  leftEyePd?: string | null;
}

export interface Prescription {
  id: number;
  customerId: number;
  patientId?: number;
  doctorId?: number | null;
  
  prescriptionType: 'EYEWEAR' | 'CONTACT_LENS';
  cardDescription?: string | null;
  countInRecords: boolean;
  lensTypes: string[];
  notes?: string | null;

  tests: PrescriptionTest[];

  createdAt: string;
  updatedAt: string;
}
