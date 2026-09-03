# Gap Analysis: billing-optics vs. Optical CRM

This report details the gaps between the current implementation of your `billing-optics` system (based on its database schema) and the fully-featured Optical CRM reference specification.

## 1. High-Level Architectural Gaps

| Area | Current System (`billing-optics`) | Reference CRM | Gap Severity |
|------|-----------------------------------|---------------|--------------|
| **Multi-Tenancy** | Single-tenant (no tenant or branch IDs in tables). | Multi-tenant and Multi-branch (Customer ID + Branch selection). | 🔴 HIGH |
| **Data Models** | Flat product model with JSONB `attributes`. | Highly typed products (Frame vs Lens vs CL). | 🟡 MEDIUM |
| **Sales Flow** | Direct to Invoice (`invoices` table). | Order → Invoice separation (Advance receipts, order tracking). | 🔴 HIGH |

## 2. Detailed Gap Checklist (From Reference Spec)

### Authentication & Authorization
- ❌ **C-002 Tenant Isolation:** No `tenant_id` or `branch_id` present in your `users` or `settings` schema.
- ✅ **C-001 Multi-role:** Your system supports `ADMIN`, `CASHIER`, `OPTOMETRIST`.
- ❓ **C-003/004 2FA/Captcha:** Need to check frontend implementation, but not in DB schema.

### Dashboard & Analytics
- ❌ **C-005 Branch Selector:** Not supported by current schema.
- 🟡 **C-006 - C-017 Analytics:** Basic counts (Customers, Invoices) are possible via SQL counts, but specialized metrics like "Missing Purchase Price", "Pending Barcodes", or "Visitors Count" are not supported by the underlying schema. 

### Products & Catalog
- 🟡 **C-018 - C-024 Product Types (Frame, Lens, CL):** Your system handles these as generic `products` linked to `categories`, using a JSONB `attributes` field. Optical CRM has highly specific workflows and likely dedicated relational fields for optical attributes (e.g., SPH/CYL grids for lenses).
- ❌ **C-025 Packages/Bundles:** No table for product bundles/kits.
- ✅ **C-026/027 Product Codes:** Supported via `sku` and `barcode` fields.

### Inventory Management
- ❌ **C-034 Stock Transfer:** Your `inventoryLedger` only supports `movementType` of `PURCHASE`, `SALE`, `RETURN`, `ADJUSTMENT`. There is no `TRANSFER` type or multi-branch inventory tracking.
- ❌ **C-038 Inventory Audit:** No tables for stock audits/physical counts.
- ❌ **C-040 Lens Grid View:** No schema support for a matrix/grid view of lens inventory based on SPH/CYL.
- ❌ **C-042 Barcode Lifecycle:** `products` has a barcode, but no tables for barcode printing queues, pending labels, or tracking individual serialized items.

### Purchasing
- ❌ **C-048 Challan Management:** No tables for delivery challans.
- ❌ **C-056 Missing Purchase Price:** Your `products.costPrice` exists, but there's no workflow for "purchase arrived without invoice".
- 🟡 **C-043 Purchase History:** You track purchases via `inventory_ledger` and `movementType = 'PURCHASE'`, but lack a dedicated `purchases` or `purchase_orders` table to track vendor, invoice number, and tax per purchase event.

### Sales & Orders
- ❌ **C-058 - C-064 Order Management:** You only have `invoices` and `invoiceItems`. Optical CRM separates "Pending Orders" from "Invoices" and tracks "Order Item Status".
- ❌ **C-063 Daily Statement PDF:** You don't have settings or fields for generating end-of-day statements.
- ❌ **C-067 Inter-Branch Sales:** Impossible without branch schema.

### Customer CRM
- ❌ **C-072 - C-077 Advanced CRM:** No fields for tracking Birthdays/Anniversaries, no tables for Discount Coupons, Referral Programs, or Loyalty Points. Your `customers` table is very basic (Name, Phone, Email, Gender, Address).

### Prescriptions
- 🟡 **C-078 Prescription Fields:** Your `prescriptions` table has basic fields (`rightEyeSph`, `rightEyeCyl`, `rightEyeAxis`, `leftEyeSph`, `leftEyeCyl`, `leftEyeAxis`, `addPower`, `pd`). It is **missing**: 
  - `PRISM` (Prism correction)
  - `NV` / `DV` (Near Vision / Distance Vision specifics)
  - `BC` (Base Curve - Contact Lenses)
  - `DIA` (Diameter - Contact Lenses)

### SMS & Communications
- ❌ **C-095 - C-100 SMS Integration:** Completely missing. No templates, message logs, or API gateway configurations in the schema.

### Accounting & Finance
- ❌ **C-101 - C-111 Accounting Ledger:** Completely missing. No tables for Expenses, Account Payables/Receivables, Vouchers, or P&L Statements. You only have customer payments tied to invoices.

### Master Settings
- ❌ **C-112 - C-122 Master Settings:** Your `settings` table is a single row with basic info. Optical CRM has 36 distinct configuration modules (PDF templates, SMS templates, Tax Masters, Barcode rules, etc.).

## 3. Recommended Next Steps for `billing-optics`

If the goal is to match Optical CRM's feature set, the following architectural upgrades are required:

1. **Multi-Branch Support:** Add a `branches` table and link `users`, `customers`, `invoices`, and `inventory_ledger` to it.
2. **Order vs. Invoice Separation:** Create an `orders` table to handle advance payments and job tracking before final invoicing.
3. **Dedicated Accounting Module:** Introduce tables for `expenses`, `expense_categories`, and general `ledgers`.
4. **Enhanced Prescription Model:** Expand the `prescriptions` table to cover Contact Lens specific parameters and Prisms.
5. **Purchase Order Module:** Create dedicated `purchases` and `purchase_items` tables with vendor relations, rather than just adjusting inventory quantities.
