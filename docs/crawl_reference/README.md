# Optical CRM Crawl & Reference Specifications

This directory contains the collected reference specifications, live site inspection data, and gap analyses from the comprehensive crawl of **opticalcrm.com** (Optical CRM v4.0).

---

## Document Index

### 1. Master Reference Specifications
- **[`optical_crm_reference_spec.md`](./optical_crm_reference_spec.md)** (54 KB)  
  The complete master specification covering the full ERP system: Navigation tree, Master Settings (33+ sections), Products & Categories (7 product types), Inventory, Purchases, Sales & Billing, Clinical Prescriptions, and Accounting.
- **[`optical_crm_forms_verified.md`](./optical_crm_forms_verified.md)**  
  Directly captured form input fields, types, and dropdown options for optical products, stock entries, and transactions.
- **[`ui_flow_analysis.md`](./ui_flow_analysis.md)**  
  Analysis of the user interface workflows, modal dialogs, and navigation patterns observed in the reference system.

### 2. Category & Dynamic Attribute System (Core Focus)
- **[`category_gap_analysis.md`](./category_gap_analysis.md)**  
  Detailed comparative gap analysis for the **Category System**:
  - The 7 Master Categories: `Frame`, `Sunglasses`, `Lens`, `Contact Lens`, `Solution`, `Other`, `Non-Chargeable`.
  - The 125+ specialized optical attributes and pre-defined option lists (brands, shapes, materials, coatings, lens index, base curves, etc.).
- **[`category_system_report.md`](./category_system_report.md)**  
  Architecture breakdown of how categories and attributes dynamically drive product forms and stock filters.
- **[`data_structure_comparison.md`](./data_structure_comparison.md)**  
  Side-by-side database schema comparison between the reference system's EAV pattern and our system's tables.

### 3. Gap Analysis & Architecture Reports
- **[`full_gap_analysis.md`](./full_gap_analysis.md)**  
  End-to-end gap analysis across all business modules (Catalog, Purchases, Lens Grid, Lab Jobs, Customers, Invoicing).
- **[`gap_analysis_report.md`](./gap_analysis_report.md)**  
  Executive summary of functional gaps.
- **[`system_comparison.md`](./system_comparison.md)**  
  Feature-by-feature comparison matrix.
- **[`system_blueprint.md`](./system_blueprint.md)**  
  Architectural blueprint for aligning our billing optics system with production-grade optical ERP requirements.
- **[`audit_comparison_report.md`](./audit_comparison_report.md)**  
  Inventory auditing and stock movement comparison.
- **[`normalized_database_schema.md`](./normalized_database_schema.md)**  
  Normalized 3NF schema specifications preventing polymorphic leaks and financial discrepancies.
- **[`optical_erp_workflow_and_architecture.md`](./optical_erp_workflow_and_architecture.md)**  
  High-level workflow and business logic reference.
