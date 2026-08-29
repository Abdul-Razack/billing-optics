import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { customers } from './customers';
import { patients } from './patients';
import { doctors } from './doctors';
import { users } from './users';

// Main prescription entity linking visit metadata
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  doctorId: integer('doctor_id').references(() => doctors.id, { onDelete: 'set null' }),

  prescriptionType: varchar('prescription_type', { length: 50 }).default('EYEWEAR'),
  cardDescription: varchar('card_description', { length: 255 }),
  countInRecords: boolean('count_in_records').default(true),
  /** Name of actual patient — may differ from account holder (e.g. family member) */
  patientName: varchar('patient_name', { length: 255 }),

  lensTypes: jsonb('lens_types').$type<string[]>(), // Constant Use, Reading Wear, etc.
  notes: text('notes'),

  /**
   * Stores physical fitting measurements recorded by the optician.
   * Captured from the "Add Wearing Parameters" step in POS.
   * All values are optional — recorded only when the optician measures them.
   *
   * Shape:
   * {
   *   fittingHeightRight: number | null,   // Vertical distance (mm) from lens bottom to right pupil center
   *   fittingHeightLeft:  number | null,   // Same for left eye
   *   segmentHeightRight: number | null,   // Height of bifocal/trifocal dividing line (right)
   *   segmentHeightLeft:  number | null,   // Height of bifocal/trifocal dividing line (left)
   *   progressiveLength:  number | null,   // Corridor length (mm) for progressive lenses
   *   wrapAngle:          number | null,   // Curvature angle of frame face (degrees)
   *   inclination:        number | null,   // Pantoscopic tilt (degrees)
   *   bvd:                number | null,   // Back Vertex Distance (mm) — cornea to back of lens
   *   readingDistance:    number | null,   // Optimal near-vision focal distance (cm)
   *   fdc:                number | null,   // Frame Distance Center (mm)
   *   headCapeEyeRatio:   number | null,   // Postural compensation for habitual head rotation
   * }
   */
  fittingParameters: jsonb('fitting_parameters').$type<{
    fittingHeightRight: number | null;
    fittingHeightLeft: number | null;
    segmentHeightRight: number | null;
    segmentHeightLeft: number | null;
    progressiveLength: number | null;
    wrapAngle: number | null;
    inclination: number | null;
    bvd: number | null;
    readingDistance: number | null;
    fdc: number | null;
    headCapeEyeRatio: number | null;
  }>(),

  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// A single prescription can have multiple test readings (OLD_LENS, AR_READING, MANUAL_TESTING, SPECTACLE)
export const prescriptionTests = pgTable('prescription_tests', {
  id: serial('id').primaryKey(),
  prescriptionId: integer('prescription_id').notNull().references(() => prescriptions.id, { onDelete: 'cascade' }),
  
  testType: varchar('test_type', { length: 50 }).notNull(), // 'OLD_LENS', 'AR_READING', 'MANUAL_TESTING', 'SPECTACLE'
  
  // Right Eye (OD) Distance
  rightEyeDvSph: varchar('r_dv_sph', { length: 10 }),
  rightEyeDvCyl: varchar('r_dv_cyl', { length: 10 }),
  rightEyeDvAxis: integer('r_dv_axis'),
  rightEyeDvVa: varchar('r_dv_va', { length: 20 }),

  // Right Eye (OD) Near
  rightEyeNvSph: varchar('r_nv_sph', { length: 10 }),
  rightEyeNvCyl: varchar('r_nv_cyl', { length: 10 }),
  rightEyeNvAxis: integer('r_nv_axis'),
  rightEyeNvVa: varchar('r_nv_va', { length: 20 }),

  // Right Eye Add, PD & PRISM
  rightEyeAdd: varchar('r_add', { length: 10 }),
  rightEyePd: varchar('r_pd', { length: 10 }),
  rightEyePrism: varchar('r_prism', { length: 20 }),
  /** Contact Lens: Base Curve (right eye) */
  rightEyeBc: varchar('r_bc', { length: 10 }),
  /** Contact Lens: Diameter (right eye) */
  rightEyeDia: varchar('r_dia', { length: 10 }),

  // Left Eye (OS) Distance
  leftEyeDvSph: varchar('l_dv_sph', { length: 10 }),
  leftEyeDvCyl: varchar('l_dv_cyl', { length: 10 }),
  leftEyeDvAxis: integer('l_dv_axis'),
  leftEyeDvVa: varchar('l_dv_va', { length: 20 }),

  // Left Eye (OS) Near
  leftEyeNvSph: varchar('l_nv_sph', { length: 10 }),
  leftEyeNvCyl: varchar('l_nv_cyl', { length: 10 }),
  leftEyeNvAxis: integer('l_nv_axis'),
  leftEyeNvVa: varchar('l_nv_va', { length: 20 }),

  // Left Eye Add, PD & PRISM
  leftEyeAdd: varchar('l_add', { length: 10 }),
  leftEyePd: varchar('l_pd', { length: 10 }),
  leftEyePrism: varchar('l_prism', { length: 20 }),
  /** Contact Lens: Base Curve (left eye) */
  leftEyeBc: varchar('l_bc', { length: 10 }),
  /** Contact Lens: Diameter (left eye) */
  leftEyeDia: varchar('l_dia', { length: 10 }),
});
