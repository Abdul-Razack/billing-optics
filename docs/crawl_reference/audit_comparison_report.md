# Structural Audit & Architectural Comparison Report

Based on the provided Structural Audit Report of the reference "Optical CRM" system, I have conducted a deep comparative analysis against our local `billing-optics` database schema and current UI representations. 

This document highlights areas of architectural alignment, explicitly achieved milestones, and remaining functional gaps.

> [!NOTE]
> As requested, this is a **read-only comparative report**. No code modifications have been made to the system while generating this document.

---

## 1. System Modularity & Domains

### Reference Architecture
The reference CRM utilizes five rigidly segregated modules: **AM (All Masters)**, **HO (Head Office)**, **LOM (Lab Order Management)**, **POS (Point of Sale)**, and **WH (Warehouse)**. This ensures front-line operations don't mutate master data.

### Our Architecture (`billing-optics`)
**Status: ✅ ALIGNED**
While built as a unified modern application rather than separate subdomains (e.g., `erp.opticalcrm.com`), our database and UI routing respect these boundaries structurally:
- **Master Data (AM)**: Managed via our `categories`, `productAttributes`, `users`, `locations`, `vendors` tables. 
- **Warehouse (WH)**: Handled via `inventoryLedger`, `stockBalances`, and most importantly, `stockTransfers` (which includes transit tracking).
- **POS / LOM**: Segregated into `invoices`, `salesOrders`, and `labJobs`.

---

## 2. Product Taxonomy & Master Data

### Reference Architecture
A complex, highly specialized category tree for Eyewear (Gender > Shape > Brand), Sunglasses, and Rx Lenses. Relies on dynamic config arrays rather than hardcoded DB columns to handle 80+ brands and shapes. 

### Our Architecture (`billing-optics`)
**Status: ✅ ALIGNED (with recent UI addition)**
- **Database**: We employ an **Entity-Attribute-Value (EAV)** pattern via `product_attribute_definitions` and `product_attribute_options`. This prevents a Cartesian explosion of SKUs.
- **UI**: The newly built **Category Attributes Manager** successfully implements this logic. It allows administrators to dynamically construct the exact hierarchy (Frames > Gender, Shape, Brand) using Dropdowns, Text, and Number inputs exactly as dictated by the reference AM Master.

> [!WARNING]
> **GAP IDENTIFIED: Lens Grid Matrix Ingestion**
> The reference system relies on a 2D "Lens Grid Purchase" matrix to plot Spherical (SPH) values on rows and Cylindrical (CYL) values on columns for bulk Rx Lens ingestion. We currently rely on flat `productVariants`. Creating a UI grid matrix for rapid bulk Rx lens purchasing/pricing is a major pending requirement for the `WH` and `POS` flows.

---

## 3. Clinical Data Flow (Prescription Lifecycle)

### Reference Architecture
Utilizes a 4-stage versioning matrix (Before Testing, After Testing, Manual, Final) to maintain an immutable clinical EHR record. Captures specialized Wearing Parameters (Wrap Angle, Segment Height, BVD, etc.) uniquely tied to the fitting order, not the core product.

### Our Architecture (`billing-optics`)
**Status: ✅ HIGHLY ALIGNED**
- **4-Stage Matrix**: Our `prescription_tests` table strictly tracks four distinct iterations: `'OLD_LENS'`, `'AR_READING'`, `'MANUAL_TESTING'`, and `'SPECTACLE'`. This is a 1-to-1 match with the reference documentation.
- **Transitory Wearing Parameters**: Our `prescriptions` table includes a `fitting_parameters` JSONB column that specifically stores `wrapAngle`, `segmentHeightRight`, `bvd`, `fdc`, etc. 
- **Architecture Note**: We correctly associate these physiological measurements with the *Prescription/Fitting*, rather than hardcoding them into the *Product/Item* table.

---

## 4. Multi-Store Stock Transfer Flow

### Reference Architecture
Requires a "two-way cryptographic or logical handshake". Stock dispatched by Branch A goes into a transit suspense ledger and is not available in Branch B until explicitly received via UI confirmation.

### Our Architecture (`billing-optics`)
**Status: ✅ ALIGNED**
- **Database**: Our `stock_transfers` table includes `from_location_id`, `to_location_id`, and critically, a `status` Enum (`'DRAFT'`, `'IN_TRANSIT'`, `'RECEIVED'`, `'PARTIALLY_RECEIVED'`). 
- **Logic Match**: Because inventory is tracked via `quantity_sent` vs `quantity_received`, stock in `'IN_TRANSIT'` status acts as the suspense ledger, perfectly mimicking the reference architecture's strict loss-prevention handshake.

---

## 5. Lab Order Management (LOM)

### Reference Architecture
Translates a POS transaction into a specific lab workflow queue: *Order Pending -> Sent for Fitting -> Received from Vendor -> Informed Customer*.

### Our Architecture (`billing-optics`)
**Status: ✅ ALIGNED**
- **Database**: We recently established the exact relationship chain bridging POS and LOM. A `lab_jobs` record is directly tied to an `invoice_item_id` and a `prescription_id`. 
- **Workflow Statuses**: Our enum matches the operational flow (PENDING, IN_PROGRESS, COMPLETED, DELIVERED). 
- **Gap**: We have not yet implemented the "Spectacle Order Form PDF Generation" for the Lab Technicians, though the underlying data (fitting parameters + prescription metrics) is fully staged in the database to generate this.

---

## Conclusion & Next Steps

Our database schema (`billing-optics`) demonstrates an **exceptionally high degree of parity** with the reference Optical CRM. The core architectural hurdles of optical software—namely, separating clinical EHR data from retail SKUs, and utilizing dynamic EAV structures for eyewear—are natively built into our current schema.

### Recommended Implementation Priorities:
1. **Lens Grid Matrix UI**: Building the 2D grid component for rapid ingestion and range-wise pricing of Rx Lenses (SPH vs CYL).
2. **Category Data Seeding**: Utilizing the Category Attributes Manager to programmatically seed the master data (Frames, Sunglasses, Lenses).
3. **Spectacle PDF Generation**: Formatting the data from `lab_jobs` and `prescriptions.fitting_parameters` into printable lab instruction sheets.
