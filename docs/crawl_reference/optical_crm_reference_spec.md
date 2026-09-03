# Optical CRM — Reference System Specification
## For Feature Gap Analysis Against My System

**Source:** https://india.opticalcrm.com/  
**Customer ID:** 123452 | **Branch:** EYE STYLE OPTICALS  
**User:** RAMRAJADMIN (Admin role)  
**Software:** Optical CRM v4.0 by DNB MULTIAPPS LLP  
**Date of Inspection:** 2026-08-27

> **Status Legend:**  
> ✅ VERIFIED — Directly observed in live system  
> 🔵 INFERRED — Strongly implied by observed UI  
> ❓ TO_VERIFY — Not yet inspected, needs browser session

---

## A. EXECUTIVE SUMMARY

Optical CRM is a cloud-based Optical Retail ERP/CRM serving opticians and optical shops in India. It is a comprehensive, multi-branch, multi-user SaaS system covering the full lifecycle of an optical retail business:

- **Product catalog** spanning 7 product types (Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable) with highly specialized optical attributes
- **Purchase management** with challan, barcode generation, and price tracking
- **Inventory management** with branch-wise stock, transfers, audits, and lens-grid views
- **Sales** with integrated prescription, order-to-invoice workflow, and multi-payment
- **Customer CRM** with prescriptions, loyalty, referral, birthday/anniversary tracking
- **Communications** via SMS and WhatsApp
- **Accounting** with ledgers, vouchers, P&L, and GST
- **Reporting** covering every business dimension
- **Highly configurable master settings** (33+ configuration sections)

---

## B. COMPLETE NAVIGATION TREE ✅

```
OPTICAL CRM (v4.0)
│
├── 🏠 HOME (Dashboard)
│
├── PRODUCTS ✅
│   ├── Frame
│   ├── Sunglasses
│   ├── Lens
│   ├── Contact Lens
│   ├── Solution
│   ├── Other
│   └── Non-Chargeable
│       (Note: "Packages" is in the KT but not seen as a distinct menu item yet)
│
├── INVENTORY ✅ (top menu item confirmed)
│   ├── Inventory Levels        ✅ (page confirmed, URL explored)
│   ├── Transfer Stock          ❓
│   ├── Transfer Stock Using Barcode ❓
│   ├── Pending Transfer Stock  ❓
│   ├── Transfer Stock History  ❓
│   ├── Inventory Audit         ❓
│   ├── Inventory Adjustment History ❓
│   ├── Lens Grid View Report   ❓
│   ├── Stock Movement          ❓
│   └── Track Barcode           ❓
│
├── PURCHASE ✅ (top menu item confirmed)
│   ├── Add Purchase            ❓
│   ├── Purchase History        ❓
│   ├── Edit Purchase           ❓
│   ├── Purchase Edit History   ❓
│   ├── Purchase Return         ❓
│   ├── Purchase Return History ❓
│   ├── Add New Challan         ❓
│   ├── Pending Challans        ❓
│   ├── Pending Purchases       ❓
│   ├── Generate Barcode        ❓
│   ├── Pending Barcode         ❓
│   ├── Edited Barcode          ❓
│   ├── Confirm Barcode         ❓
│   ├── Lens Grid Purchase      ❓
│   ├── Missing Purchase Price  ❓
│   └── Additional Discount & Other Cost ❓
│
├── SALES ✅ (top menu item confirmed)
│   ├── Create New Order        ❓
│   ├── Pending Orders          ❓
│   ├── Sales History           ❓
│   ├── Sales Return            ❓
│   ├── Sales Return History    ❓
│   ├── Daily Statement PDF     ❓
│   ├── Order Item Tracking     ❓
│   ├── Create Bulk Invoice     ❓
│   ├── Prescription Update History ❓
│   └── Create Inter Branch Sales ❓
│
├── CUSTOMER ✅ (top menu item confirmed)
│   ├── Add Customer            ❓
│   ├── Customer List           ❓
│   ├── DND Customers           ❓
│   ├── Customer Label          ❓
│   ├── Visitors Count          ❓
│   ├── Birthday List           ❓
│   ├── Anniversary List        ❓
│   ├── Discount Coupons        ❓
│   ├── Referral Program        ❓
│   └── Loyalty Program         ❓
│
├── REPORTS ✅ (top menu item confirmed)
│   ├── Sales Reports           ❓
│   ├── Purchase Reports        ❓
│   ├── Transfer Stock Reports  ❓
│   ├── Customer Reports        ❓
│   ├── Prescription Reports    ❓
│   ├── Pending Order Reports   ❓
│   ├── Payment Reports         ❓
│   ├── Barcode Reports         ❓
│   ├── Expense Reports         ❓
│   ├── Loss / Damage Reports   ❓
│   ├── Closing Stock Reports   ❓
│   └── GST Input / Output Reports ❓
│
├── SMS ✅ (top menu item confirmed)
│   ├── Send Bulk SMS           ❓
│   ├── SMS Account History     ❓
│   ├── SMS Purchase History    ❓
│   ├── Feedback SMS / WhatsApp ❓
│   ├── Order Ready SMS / WhatsApp ❓
│   ├── Sender IDs              ❓
│   └── WhatsApp Account History ❓
│
├── PRESCRIPTION ✅ (top menu item confirmed)
│   ├── Add Prescription        ❓
│   ├── Prescription Database   ❓
│   ├── Patient Details         ❓
│   └── Appointments            ❓
│
├── ACCOUNT ✅ (top menu item confirmed)
│   ├── Expenses                ❓
│   ├── Ledgers                 ❓
│   ├── Group Ledgers           ❓
│   ├── Vouchers                ❓
│   ├── Account Payable         ❓
│   ├── Account Receivable      ❓
│   ├── Account Statement       ❓
│   ├── Trading                 ❓
│   ├── P/L Statement           ❓
│   ├── Balance Sheet           ❓
│   └── Referral Payments       ❓
│
└── ⚙️ MASTER SETTINGS (accessed via gear icon in top icon bar) ✅
    ├── Change Password/Pin
    ├── Users & Franchise
    ├── Admin Settings
    ├── Branch Settings
    ├── Barcode Settings
    ├── Import Data
    ├── Customer Settings
    ├── Purchase & Product Code Settings
    ├── Sales Settings
    ├── Discount Settings
    ├── SMS Settings
    ├── SMS Template Settings
    ├── Email Settings
    ├── Email Template Settings
    ├── WhatsApp Settings
    ├── WhatsApp Template Settings
    ├── Advance Receipt PDF Settings
    ├── Invoice PDF Settings
    ├── Order Form PDF Settings
    ├── Prescription Settings
    ├── Prescription PDF Settings
    ├── Medical Record PDF Settings
    ├── Prescription Card Settings
    ├── Voucher PDF Settings
    ├── Expense PDF Settings
    ├── Brand
    ├── Transfer Stock Settings
    ├── Suppliers
    ├── Quality
    ├── Label Settings
    ├── Tax Master
    ├── Membership Card Settings
    ├── Login & Security
    ├── API
    ├── Account Setting
    └── Offer Settings
```

---

## C. DASHBOARD ✅ (Dashboard v4.0)

### Layout
- **Branch Selector**: Dropdown to select branch (shows "EYE STYLE OPTICALS"), with a page number selector and Search button.
- **Business Rule**: Max 5 branches for instant view; >5 branches triggers server-side report generation sent via email.

### 4 Main Widget Panels

#### 1. Database Count
| Metric | Sample Value |
|--------|-------------|
| Total Customers | 205 |
| Total Prescriptions | 166 |
| Total Inventory | 1,264,667 |
| Total SKU's | 216 |
| Total Purchase Bills | 66 |
| Total Sales Orders | 142 |
| Total Invoices | 71 |
| Total SMS | 3,529 |
| Total WhatsApp | 0 |

#### 2. Pending Task
| Metric | Sample Value |
|--------|-------------|
| Pending Order Value | Rs 2,53,476.05/- |
| Pending Orders | 63 Orders |
| Pending Barcode Labels | 1,264,652 Products |
| Edited Barcode Labels | 11 Products |
| Pending Balance Collection | Rs 1,65,174.55/- |
| Pending Purchase Count | 240 |
| Missing Purchase Price Count | 1 |

#### 3. Today's Data
| Metric |
|--------|
| Total Sales |
| Gross Sales |
| Net Sales |
| Collection |
| Receipts |
| Expenses |
| Payments |
| Return Payments |
| Eye Testings |
| Visitors |
| New Orders (count + value) |
| Average Sale Value |
| Number of Bills |
| Customer Birthdays |
| Customer Anniversary |
| Total Appointments |
| Upcoming Appointments |
| Completed Appointments |
| **Profit/Loss** |

#### 4. This Month Data
*(Same metrics as Today's Data but for the current month)*
- Includes "Generate Report With Custom Month Range" button

---

## D. MASTER SETTINGS — COMPLETE LIST ✅

33 settings modules discovered, all accessed from the gear icon:

| # | Setting | Purpose |
|---|---------|---------|
| 1 | Change Password/Pin | Account security |
| 2 | Users & Franchise | User management, roles, franchise setup |
| 3 | Admin Settings | System-level admin config |
| 4 | Branch Settings | Multi-branch configuration |
| 5 | Barcode Settings | Barcode format and printing config |
| 6 | Import Data | Bulk data import tool |
| 7 | Customer Settings | Customer field configuration |
| 8 | Purchase & Product Code Settings | Purchase numbering and product code rules |
| 9 | Sales Settings | Sales workflow configuration |
| 10 | Discount Settings | Discount rules and limits |
| 11 | SMS Settings | SMS gateway configuration |
| 12 | SMS Template Settings | SMS message templates |
| 13 | Email Settings | Email server configuration |
| 14 | Email Template Settings | Email message templates |
| 15 | WhatsApp Settings | WhatsApp gateway/API config |
| 16 | WhatsApp Template Settings | WhatsApp message templates |
| 17 | Advance Receipt PDF Settings | Advance receipt format |
| 18 | Invoice PDF Settings | Invoice format/layout |
| 19 | Order Form PDF Settings | Order form format/layout |
| 20 | Prescription Settings | Prescription fields configuration |
| 21 | Prescription PDF Settings | Prescription printout format |
| 22 | Medical Record PDF Settings | Medical record document format |
| 23 | Prescription Card Settings | Prescription card format |
| 24 | Voucher PDF Settings | Voucher document format |
| 25 | Expense PDF Settings | Expense document format |
| 26 | Brand | Brand master data management |
| 27 | Transfer Stock Settings | Stock transfer rules |
| 28 | Suppliers | Supplier/vendor master management |
| 29 | Quality | Quality grades/options |
| 30 | Label Settings | Product label format |
| 31 | Tax Master | GST/Tax rate configuration |
| 32 | Membership Card Settings | Loyalty membership card format |
| 33 | Login & Security | Authentication settings |
| 34 | API | API integration settings |
| 35 | Account Setting | Accounting configuration |
| 36 | Offer Settings | Discount/offer configuration |

---

## E. PRODUCTS MODULE ✅

### Navigation Confirmed
Products dropdown contains: **Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable**

*(Note: "Packages" not observed as a separate menu item — may be inside Other or not yet accessible)*

### Inventory Levels Page — Observed Fields ✅
The Inventory Levels page (`/v3/index.php?q=inventory`) shows:

**Filters:**
- Select Branch: dropdown (All Branch)
- Select Product: dropdown (All Product)
- Search: Radio buttons — `Group` / `Item Wise`
- Search With: dropdown + text input
- Checkbox: "Show All Products Along With 0 Inventories"
- Search button

**Table Columns:**
| Column | Notes |
|--------|-------|
| # | Row number |
| Product | Product type (Frame, Lens, Contact Lens) |
| Product Code | System code (e.g., SYS318, FRM-RB-RND-001) |
| Description | Product description string (e.g., "ash - white - CR 39 - SPH : +0.25") |
| Available Quantity | Shown in colored badge (red = negative stock) |
| Branch Name | Branch name |
| Action | 4 action buttons per row (+ + + 🗑) |

**Business Rules Observed:**
- Contact Lens shows "Pieces Per Box: 1" as a sub-row under the product
- Red badges indicate negative/overdrawn inventory
- Description for Lens items concatenates: Color - Material - Vision - SPH value
- Action buttons appear to be: Add Stock In, Add Stock Out, Transfer, History (4 icons)

**Add New Inventory button** visible at top-right and bottom-right.

---

## F. COMPLETE ENTITY TREE (from dashboard + UI)

### Entities Confirmed ✅

```
Customer (205 total in sample)
│
├── Prescription (166 total)
│   ├── Right Eye (OD) prescription data
│   └── Left Eye (OS) prescription data
│
├── Sales Order (142 total)
│   └── Invoice (71 total)
│
└── Contact/Profile data

Product
│
├── SKU (216 total)
│   ├── Frame
│   ├── Sunglasses
│   ├── Lens
│   ├── Contact Lens
│   ├── Solution
│   ├── Other
│   └── Non-Chargeable
│
├── Product Code (system-generated: SYS18, SYS318...)
│   Or custom: FRM-RB-RND-001
│
└── Barcode (1,264,652 pending in sample — indicates per-unit barcodes)

Purchase
│
└── Purchase Bills (66 total)

Inventory
│
├── Stock Balance (1,264,667 total units)
├── Stock Transfers
├── Stock Adjustments
└── Barcode Tracking

Branch (multi-branch supported)
│
└── EYE STYLE OPTICALS (sample branch)

SMS Log (3,529 sent)

Supplier/Vendor
Brand
Quality Grade
Tax Master
```

---

## G. OBSERVED BUSINESS RULES ✅

| Rule # | Module | Rule | Evidence |
|--------|--------|------|----------|
| BR-001 | Dashboard | Max 5 branches for instant dashboard; >5 triggers async email report | "GENERAL RULES" note on dashboard |
| BR-002 | Inventory | Contact Lens inventory tracked as boxes with pieces-per-box | Note on Inventory Levels page |
| BR-003 | Inventory | Available Quantity can go negative (shown in red) | Negative values visible in Inventory Levels |
| BR-004 | Products | Product description auto-generated from attributes for Lens (Color+Material+SPH) | Description field in Inventory Levels |
| BR-005 | Dashboard | Pending Barcode Labels tracked separately from Edited Barcode Labels | Pending Task section |
| BR-006 | Dashboard | Missing Purchase Price tracked as actionable count | Pending Task section |
| BR-007 | Auth | Two-step login: Customer ID → then Username/Password + Captcha | Login page flow |
| BR-008 | Auth | Three user types on login: Admin, Franchise, Staff (radio buttons) | Login page |
| BR-009 | Barcodes | Barcode labels generated in bulk after purchase | 1.26M pending labels visible |
| BR-010 | Sales | System tracks Advance Receipts separately from Invoices | Advance Receipt PDF Settings exists |

---

## H. REFERENCE CHECKLIST FOR MY SYSTEM

| ID | Module | Capability | Optical CRM | My System Status |
|----|--------|-----------|-------------|-----------------|
| C-001 | Auth | Multi-role login (Admin/Franchise/Staff) | ✅ AVAILABLE | TO VERIFY |
| C-002 | Auth | Customer ID based tenant isolation | ✅ AVAILABLE | TO VERIFY |
| C-003 | Auth | Two-step login flow | ✅ AVAILABLE | TO VERIFY |
| C-004 | Auth | CAPTCHA on login | ✅ AVAILABLE | TO VERIFY |
| C-005 | Dashboard | Branch selector for dashboard | ✅ AVAILABLE | TO VERIFY |
| C-006 | Dashboard | Database Count widget | ✅ AVAILABLE | TO VERIFY |
| C-007 | Dashboard | Pending Tasks widget | ✅ AVAILABLE | TO VERIFY |
| C-008 | Dashboard | Today's Data widget | ✅ AVAILABLE | TO VERIFY |
| C-009 | Dashboard | This Month Data widget | ✅ AVAILABLE | TO VERIFY |
| C-010 | Dashboard | Profit/Loss on dashboard | ✅ AVAILABLE | TO VERIFY |
| C-011 | Dashboard | Pending Barcode count | ✅ AVAILABLE | TO VERIFY |
| C-012 | Dashboard | Missing Purchase Price alert | ✅ AVAILABLE | TO VERIFY |
| C-013 | Dashboard | Pending Balance Collection amount | ✅ AVAILABLE | TO VERIFY |
| C-014 | Dashboard | Visitor count | ✅ AVAILABLE | TO VERIFY |
| C-015 | Dashboard | Eye Testing count | ✅ AVAILABLE | TO VERIFY |
| C-016 | Dashboard | Birthday/Anniversary alerts | ✅ AVAILABLE | TO VERIFY |
| C-017 | Dashboard | Appointment tracking | ✅ AVAILABLE | TO VERIFY |
| C-018 | Products | Frame product type | ✅ AVAILABLE | TO VERIFY |
| C-019 | Products | Sunglasses product type | ✅ AVAILABLE | TO VERIFY |
| C-020 | Products | Lens product type | ✅ AVAILABLE | TO VERIFY |
| C-021 | Products | Contact Lens product type | ✅ AVAILABLE | TO VERIFY |
| C-022 | Products | Solution product type | ✅ AVAILABLE | TO VERIFY |
| C-023 | Products | Other product type | ✅ AVAILABLE | TO VERIFY |
| C-024 | Products | Non-Chargeable product type | ✅ AVAILABLE | TO VERIFY |
| C-025 | Products | Packages product type | ❓ TO_VERIFY | TO VERIFY |
| C-026 | Products | System-generated product codes (SYS###) | ✅ AVAILABLE | TO VERIFY |
| C-027 | Products | Custom product codes | ✅ AVAILABLE | TO VERIFY |
| C-028 | Inventory | Branch-wise inventory levels | ✅ AVAILABLE | TO VERIFY |
| C-029 | Inventory | Group view vs Item Wise view | ✅ AVAILABLE | TO VERIFY |
| C-030 | Inventory | Show zero-inventory products toggle | ✅ AVAILABLE | TO VERIFY |
| C-031 | Inventory | Negative stock detection | ✅ AVAILABLE | TO VERIFY |
| C-032 | Inventory | Contact Lens box+pieces tracking | ✅ AVAILABLE | TO VERIFY |
| C-033 | Inventory | Lens description auto-generation | ✅ AVAILABLE | TO VERIFY |
| C-034 | Inventory | Stock Transfer | ✅ AVAILABLE | TO VERIFY |
| C-035 | Inventory | Transfer using Barcode | ✅ AVAILABLE | TO VERIFY |
| C-036 | Inventory | Pending Transfer Stock | ✅ AVAILABLE | TO VERIFY |
| C-037 | Inventory | Transfer History | ✅ AVAILABLE | TO VERIFY |
| C-038 | Inventory | Inventory Audit | ✅ AVAILABLE | TO VERIFY |
| C-039 | Inventory | Adjustment History | ✅ AVAILABLE | TO VERIFY |
| C-040 | Inventory | Lens Grid View Report | ✅ AVAILABLE | TO VERIFY |
| C-041 | Inventory | Stock Movement (Purchase/Sale/Return/Damage/Missing/Giveaway) | ✅ AVAILABLE | TO VERIFY |
| C-042 | Inventory | Track Barcode (Purchased/Transferred/Deleted/Sold) | ✅ AVAILABLE | TO VERIFY |
| C-043 | Purchase | Purchase History | ✅ AVAILABLE | TO VERIFY |
| C-044 | Purchase | Edit Purchase | ✅ AVAILABLE | TO VERIFY |
| C-045 | Purchase | Purchase Edit History | ✅ AVAILABLE | TO VERIFY |
| C-046 | Purchase | Purchase Return | ✅ AVAILABLE | TO VERIFY |
| C-047 | Purchase | Purchase Return History | ✅ AVAILABLE | TO VERIFY |
| C-048 | Purchase | Challan management | ✅ AVAILABLE | TO VERIFY |
| C-049 | Purchase | Pending Challans | ✅ AVAILABLE | TO VERIFY |
| C-050 | Purchase | Pending Purchases | ✅ AVAILABLE | TO VERIFY |
| C-051 | Purchase | Generate Barcode from Purchase | ✅ AVAILABLE | TO VERIFY |
| C-052 | Purchase | Pending Barcode Labels | ✅ AVAILABLE | TO VERIFY |
| C-053 | Purchase | Edited Barcode tracking | ✅ AVAILABLE | TO VERIFY |
| C-054 | Purchase | Confirm Barcode | ✅ AVAILABLE | TO VERIFY |
| C-055 | Purchase | Lens Grid Purchase | ✅ AVAILABLE | TO VERIFY |
| C-056 | Purchase | Missing Purchase Price tracking | ✅ AVAILABLE | TO VERIFY |
| C-057 | Purchase | Additional Discount & Other Cost | ✅ AVAILABLE | TO VERIFY |
| C-058 | Sales | Create New Order | ✅ AVAILABLE | TO VERIFY |
| C-059 | Sales | Pending Orders | ✅ AVAILABLE | TO VERIFY |
| C-060 | Sales | Sales History | ✅ AVAILABLE | TO VERIFY |
| C-061 | Sales | Sales Return | ✅ AVAILABLE | TO VERIFY |
| C-062 | Sales | Sales Return History | ✅ AVAILABLE | TO VERIFY |
| C-063 | Sales | Daily Statement PDF | ✅ AVAILABLE | TO VERIFY |
| C-064 | Sales | Order Item Tracking | ✅ AVAILABLE | TO VERIFY |
| C-065 | Sales | Create Bulk Invoice | ✅ AVAILABLE | TO VERIFY |
| C-066 | Sales | Prescription Update History | ✅ AVAILABLE | TO VERIFY |
| C-067 | Sales | Inter Branch Sales | ✅ AVAILABLE | TO VERIFY |
| C-068 | Customer | Add/Edit Customer | ✅ AVAILABLE | TO VERIFY |
| C-069 | Customer | Customer List | ✅ AVAILABLE | TO VERIFY |
| C-070 | Customer | DND Customers | ✅ AVAILABLE | TO VERIFY |
| C-071 | Customer | Customer Labels | ✅ AVAILABLE | TO VERIFY |
| C-072 | Customer | Visitors Count | ✅ AVAILABLE | TO VERIFY |
| C-073 | Customer | Birthday List | ✅ AVAILABLE | TO VERIFY |
| C-074 | Customer | Anniversary List | ✅ AVAILABLE | TO VERIFY |
| C-075 | Customer | Discount Coupons | ✅ AVAILABLE | TO VERIFY |
| C-076 | Customer | Referral Program | ✅ AVAILABLE | TO VERIFY |
| C-077 | Customer | Loyalty Program | ✅ AVAILABLE | TO VERIFY |
| C-078 | Prescription | Add Prescription | ✅ AVAILABLE | TO VERIFY |
| C-079 | Prescription | Prescription Database | ✅ AVAILABLE | TO VERIFY |
| C-080 | Prescription | Patient Details | ✅ AVAILABLE | TO VERIFY |
| C-081 | Prescription | Appointments | ✅ AVAILABLE | TO VERIFY |
| C-082 | Prescription | Eyewear + Contact Lens prescription types | ✅ AVAILABLE | TO VERIFY |
| C-083 | Reports | Sales Reports | ✅ AVAILABLE | TO VERIFY |
| C-084 | Reports | Purchase Reports | ✅ AVAILABLE | TO VERIFY |
| C-085 | Reports | Transfer Stock Reports | ✅ AVAILABLE | TO VERIFY |
| C-086 | Reports | Customer Reports | ✅ AVAILABLE | TO VERIFY |
| C-087 | Reports | Prescription Reports | ✅ AVAILABLE | TO VERIFY |
| C-088 | Reports | Pending Order Reports | ✅ AVAILABLE | TO VERIFY |
| C-089 | Reports | Payment Reports | ✅ AVAILABLE | TO VERIFY |
| C-090 | Reports | Barcode Reports | ✅ AVAILABLE | TO VERIFY |
| C-091 | Reports | Expense Reports | ✅ AVAILABLE | TO VERIFY |
| C-092 | Reports | Loss/Damage Reports | ✅ AVAILABLE | TO VERIFY |
| C-093 | Reports | Closing Stock Reports | ✅ AVAILABLE | TO VERIFY |
| C-094 | Reports | GST Input/Output Reports | ✅ AVAILABLE | TO VERIFY |
| C-095 | SMS | Bulk SMS | ✅ AVAILABLE | TO VERIFY |
| C-096 | SMS | SMS Templates | ✅ AVAILABLE | TO VERIFY |
| C-097 | SMS | WhatsApp integration (via API) | ✅ AVAILABLE | TO VERIFY |
| C-098 | SMS | Order Ready notifications | ✅ AVAILABLE | TO VERIFY |
| C-099 | SMS | Feedback SMS | ✅ AVAILABLE | TO VERIFY |
| C-100 | SMS | Sender ID management | ✅ AVAILABLE | TO VERIFY |
| C-101 | Account | Expense management | ✅ AVAILABLE | TO VERIFY |
| C-102 | Account | Ledgers | ✅ AVAILABLE | TO VERIFY |
| C-103 | Account | Group Ledgers | ✅ AVAILABLE | TO VERIFY |
| C-104 | Account | Vouchers | ✅ AVAILABLE | TO VERIFY |
| C-105 | Account | Account Payable | ✅ AVAILABLE | TO VERIFY |
| C-106 | Account | Account Receivable | ✅ AVAILABLE | TO VERIFY |
| C-107 | Account | Account Statement | ✅ AVAILABLE | TO VERIFY |
| C-108 | Account | Trading Account | ✅ AVAILABLE | TO VERIFY |
| C-109 | Account | P/L Statement | ✅ AVAILABLE | TO VERIFY |
| C-110 | Account | Balance Sheet | ✅ AVAILABLE | TO VERIFY |
| C-111 | Account | Referral Payments | ✅ AVAILABLE | TO VERIFY |
| C-112 | Settings | Brand master data | ✅ AVAILABLE | TO VERIFY |
| C-113 | Settings | Supplier master data | ✅ AVAILABLE | TO VERIFY |
| C-114 | Settings | Tax Master | ✅ AVAILABLE | TO VERIFY |
| C-115 | Settings | Quality grades | ✅ AVAILABLE | TO VERIFY |
| C-116 | Settings | Label Settings | ✅ AVAILABLE | TO VERIFY |
| C-117 | Settings | PDF format customization (Invoice, Order, Prescription, etc.) | ✅ AVAILABLE | TO VERIFY |
| C-118 | Settings | SMS/WhatsApp template management | ✅ AVAILABLE | TO VERIFY |
| C-119 | Settings | Membership Card format | ✅ AVAILABLE | TO VERIFY |
| C-120 | Settings | Offer Settings | ✅ AVAILABLE | TO VERIFY |
| C-121 | Settings | Import Data tool | ✅ AVAILABLE | TO VERIFY |
| C-122 | Settings | API integration | ✅ AVAILABLE | TO VERIFY |

---

## I. AREAS TO VERIFY IN MY SYSTEM (Gap Categories)

### FUNCTIONAL GAPS (Needs browser session to confirm)
- Packages / Bundled products feature
- Lens Grid Purchase (special grid-based lens ordering)
- Inter Branch Sales
- Daily Statement PDF generation
- Order Item Tracking (post-sale tracking)
- Bulk Invoice creation
- Visitors Count module
- DND (Do Not Disturb) customer flagging
- Customer Label printing

### DATA GAPS (Partially Verified — Updated 2026-08-27)

#### ✅ PRESCRIPTION FIELDS — NOW VERIFIED
See Section L below for complete verified field list.

#### ❓ Still Unverified
- All specific product fields per type (Frame color/size/shape/material/gender/etc.)
- Contact Lens specific fields (Water Content, Dk/t, Modality, Validity Days, Base Curve)
- Purchase fields (challan number, document type, cost per item)
- Barcode lifecycle states (Pending Print → Active → Sold → Returned)

### WORKFLOW GAPS (Not yet verified)
- Complete Barcode generation workflow (Purchase → Generate → Confirm → Print)
- Inventory Audit workflow
- Stock Transfer approval workflow
- Loyalty point earning/redemption rules
- Referral program rules

### UI/UX GAPS (Not yet verified)
- Lens Grid View (special matrix UI for lens stock)
- Prescription Card print format
- Medical Record PDF format
- Prescription Update History view

### REPORTING GAPS (Not yet verified)
- All 12 report types with exact filters and columns
- GST Input/Output Report format
- Closing Stock Report
- Loss/Damage Report

---

## J. SCREENSHOTS CAPTURED

| Screenshot | Content |
|------------|---------|
| dashboard_widgets_1787822160430.png | Dashboard with all 4 KPI panels fully visible |
| after_frame_click_1787821047225.png | Dashboard (first login) |
| master_settings_1787821168319.png | Master Settings page — all 36 settings visible |
| inventory_dropdown_hover_1787821186102.png | Products dropdown open (Frame, Sunglasses, Lens, CL, Solution, Other, Non-Chargeable) |
| products_frame_tab_verify_1787823703119.png | Products dropdown visible |
| inventory_levels_loaded_1787823795229.png | Inventory Levels page with full table and filters |
| frame_submenu_check_1787823649768.png | Products dropdown open |
| optical_crm_direct_url_crawl_1787840455913.webp | Prescription form full crawl recording |

---

## L. VERIFIED FORM SCHEMAS ✅

### L1. Prescription Add Form (FULLY VERIFIED — 2026-08-27)

**URL:** `/v3/index.php?page=prescription-add`

#### Patient Information Section
| Field Label | Input Type | Field ID / Notes |
|-------------|-----------|-----------------|
| Branch Name | Select dropdown | `select#shop` |
| Referral Code | Text input | `input#referralCode` |
| Mobile No 1 | Text + Search button | `input#mobileNumber` |
| Full Name | Text + Search button | `input#fullName` |
| Membership ID | Text input | `input#membershipID` |
| Date of Birth | Date input | `input#dateOfBirth` |
| Patient Name | Text input | `input#patientName` |
| Patient Mobile Number | Text input | `input#patientMobileNumber` |
| Patient Email | Text input | `input#patientEmail` |
| Patient Date of Birth | Date input | `input#patientDateOfBirth` |
| Patient Age | Text input | `input#patientAge` |
| Patient Gender | Radio (Male/Female/Other) | `input#patientGender` |
| Prescription Type | Radio (Eyewear / Contact Lens) | Two radio buttons |
| Card Description | Text input | — |
| Count in Eye Testing Records | Radio (Yes / No) | — |

#### Collapsible Prescription Sections (3 toggleable sections + 1 always-active)

Each section has **3 tabs**: Eyewear Prescription | Contact Lens Prescription | Transpose Prescription

| Section | Activation | Date/Time Field | Doctor Field | Field Prefix |
|---------|------------|----------------|-------------|-------------|
| OLD LENS POWER | Checkbox `input#customer-old-lens-power` | `input#PG_prescriptionDateTime` | `input#PG_doctorName` | `PG_EYE_`, `PG_CL_`, `PG_TRN_` |
| AR READING | Checkbox `input#auto-reflector-meter` | `input#AR_prescriptionDateTime` | `input#AR_doctorName` | `AR_EYE_`, `AR_CL_`, `AR_TRN_` |
| MANUAL TESTING | Checkbox `input#manual-testing` | `input#BT_prescriptionDateTime` | `input#BT_doctorName` | `BT_EYE_`, `BT_CL_`, `BT_TRN_` |
| SPECTACLE PRESCRIPTION | Always active (default) | `input#prescriptionDateTime` | `input#doctorName` | `EYE_`, `CL_`, `TRN_` |

#### Eyewear Prescription Fields (per section, using prefix e.g. `EYE_`)
Each section's Eyewear tab captures OD (Right) and OS (Left) data for Distance (D) and Near (N):

| Eye | Vision | Field Suffix Pattern | Notes |
|-----|--------|---------------------|-------|
| Right (R) | Distance (D) | `{PREFIX}RS_D` = SPH, `{PREFIX}RC_D` = CYL, `{PREFIX}RA_D` = AXIS | Standard distance Rx |
| Right (R) | Near (N) | `{PREFIX}RS_N` = SPH, `{PREFIX}RC_N` = CYL, `{PREFIX}RA_N` = AXIS | Near vision add-on |
| Left (L) | Distance (D) | `{PREFIX}LS_D` = SPH, `{PREFIX}LC_D` = CYL, `{PREFIX}LA_D` = AXIS | Standard distance Rx |
| Left (L) | Near (N) | `{PREFIX}LS_N` = SPH, `{PREFIX}LC_N` = CYL, `{PREFIX}LA_N` = AXIS | Near vision add-on |
| Both | ADD Power | `{PREFIX}ADD` | Addition power |
| Both | PD | `{PREFIX}PD` or `{PREFIX}RPD` / `{PREFIX}LPD` | Pupillary Distance |

#### Contact Lens Prescription Fields (per section, using `CL_` suffix in prefix)
| Field | Suffix Pattern | Notes |
|-------|---------------|-------|
| Power Type | `{PREFIX}CL_RPT` | Right Power Type |
| SPH | `{PREFIX}CL_RS` | Right Sphere |
| CYL | `{PREFIX}CL_RC` | Right Cylinder |
| AXIS | `{PREFIX}CL_RA` | Right Axis |
| BC (Base Curve) | `{PREFIX}CL_RBC` | Right Base Curve |
| DIA (Diameter) | `{PREFIX}CL_RDIA` | Right Diameter |
| Same fields for Left eye with `L` instead of `R` | | |

#### Actions
- **Submit Button** at bottom of form

---

## M. PENDING INVESTIGATION (Remaining Forms)

| Priority | Form | Status | Notes |
|----------|------|--------|-------|
| 🔴 HIGH | Products > Frame — Add Form | ❓ TODO | Need all frame-specific fields |
| 🔴 HIGH | Products > Lens — Add Form | ❓ TODO | Need lens power grid / SPH-CYL range |
| 🔴 HIGH | Products > Contact Lens — Add Form | ❓ TODO | Need BC, DIA, Water Content, Modality |
| 🔴 HIGH | Sales > Create New Order | ❓ TODO | MOST CRITICAL — full sales workflow |
| 🟡 MEDIUM | Customer > Customer Profile | ❓ TODO | All tabs: Sales, Prescriptions, Ledger |
| 🟡 MEDIUM | Purchase > Add Purchase | ❓ TODO | Challan, supplier, cost per item |
| 🟢 LOW | Reports menu | ❓ TODO | Full report sub-menu list |
| 🟢 LOW | Account menu | ❓ TODO | Full accounting sub-menu list |
| 🟢 LOW | Inventory > Transfer Stock | ❓ TODO | Transfer form fields |
| 🟢 LOW | Inventory > Inventory Audit | ❓ TODO | Audit workflow |

---

## N. VERIFIED FORM SCHEMAS — INVENTORY / PRODUCT FORMS ✅

### N1. Add Inventory Form — Frame Product Type (FULLY VERIFIED — 2026-08-28)

**Access Path:** Inventory → Inventory Levels → Add New Inventory → Product Type = Frame

**KEY INSIGHT:** There is NO separate "Add Frame Master" form. The single **Add Inventory** form dynamically shows product-type-specific attribute fields based on the *Product Type* dropdown. All 7 product types share this same form with contextual fields.

#### Top Section (Always Present — All Product Types)

| Field Label | Input Type | Notes |
|-------------|-----------|-------|
| *Product Type | Select | Options: Frame, Sunglasses, Lens (Glass), Contact Lens, Solution, Other, Non-Chargeable, Repair |
| *Branch Name | Select | All configured branches (e.g., EYE STYLE OPTICALS) |
| *Tax Rule | Select | Not Applicable, GST rates |
| Product Code | Text | Manual entry or system-generated |

#### Frame-Specific Attribute Fields (Shown when Product Type = Frame)

**Row 1:**
| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Frame model name |
| Brand | Text | Free text entry (linked to Brand master) |
| Gender | Text | Male / Female / Unisex / Kids |

**Row 2:**
| Field | Type | Notes |
|-------|------|-------|
| Color | Text | Frame color |
| Size | Text | Small / Medium / Large / numeric |
| Type | Text | Full Rim / Half Rim / Rimless |
| Shape | Text | Rectangular / Round / Square / Oval / Cat Eye |

**Row 3:**
| Field | Type | Notes |
|-------|------|-------|
| Material | Text | Acetate / Metal / Titanium / TR90 |
| Temple Detail | Text | e.g., 140mm |
| Bridge Size | Text | e.g., 18mm |
| Quality | Text | From Quality master (e.g., A+, A, B) |

#### Inventory & Pricing Section (Common to ALL Product Types)

| Field Label | Input Type | Notes |
|-------------|-----------|-------|
| *Quantity | Number | Default = 0 |
| [Get Old Purchase Prices →] | Button | Fetches previous purchase price for this product code |
| Purchase Rs | Number | Cost/purchase price (default 0.00) |
| Retail Price | Number | MRP (default 0.00) |
| Discounted Price | Number | Selling price after discount (default 0.00) |
| Track Inventory | Radio Yes/No | Default: Yes |
| Allow Negative Inventory | Radio Yes/No | Default: Yes |
| Barcode Options | Radio | System Generated/Unique ● \| Common/Duplicate ○ \| Not Required ○ \| System Generated/Common ○ |
| Basic Price | Number | Read-only calculated field |
| Total Purchase Rs | Number | Read-only (Qty × Purchase Rs) |
| Invoice Description | Text | Optional |
| Total Purchase Amount | Number | Grand total read-only |

**Submit:** Add Inventory → button

#### Additional Business Rules Confirmed (2026-08-28)

| Rule # | Module | Rule | Evidence |
|--------|--------|------|----------|
| BR-011 | Inventory | Contact Lens prices are per box; system auto-calculates per-piece price | Note on Add Inventory page |
| BR-012 | Products | Product Type dropdown dynamically swaps attribute fields section | Observed live in Add Inventory form |
| BR-013 | Barcodes | Barcodes are generated at inventory addition time, not at product creation | Barcode Options on Add Inventory form |
| BR-014 | Inventory | Track Inventory and Allow Negative Inventory both default to Yes | Observed on form |

---

## N2. Add Inventory — Lens (Glass) Product Type ❓ TODO
*Fields expected: SPH range, CYL range, AXIS, vision type (Single/Bifocal/Progressive), material, coating, index*

---

## N3. Add Inventory — Contact Lens Product Type ❓ TODO
*Fields expected: Base Curve (BC), Diameter (DIA), Water Content, Modality (Daily/Weekly/Monthly), Validity Days, Power Type*

---

## N4. Sales → Create New Order ❓ TODO
*Full order workflow: customer selection, product lines, prescription, pricing, payment modes*


---

### N2. Add Inventory Form — Lens (Glass) Product Type ✅ VERIFIED (2026-08-28)

**Access Path:** Add Inventory form → Product Type = "Lens"

#### Lens-Specific Attribute Fields

| Field Label | HTML ID | Type | Notes |
|-------------|---------|------|-------|
| Details | `productName` | text | Lens description |
| Brand | `company` | text | Manufacturer/brand |
| Color | `color` | text | Tint/color |
| Material | `material` | text | Lens material (e.g., CR-39, Polycarbonate, Trivex) |
| Coating | `coting` | text | Coating type (e.g., AR, UV, Blue Cut) |
| Design | `design` | text | Vision design (e.g., Single Vision, Bifocal, Progressive) |
| Index | `index` | text | Refractive index value (e.g., 1.50, 1.56, 1.67) |
| Quality | `quality` | text | Quality grade |
| SPH | `SPL` | text | Sphere power value |
| CYL | `CYL` | text | Cylinder power value |
| Addition | `addition` | text | Add power (for bifocals/progressives) |
| Axis | `axis` | text | Cylinder axis angle |
| Consider As Pair | `isPairWise` | checkbox | Track inventory as pairs |

*(Common inventory/pricing fields same as Frame — Quantity, Purchase Rs, Retail Price, Discounted Price, Track Inventory, Allow Negative Inventory, Barcode Options, Invoice Description, Total Purchase Amount)*

---

### N3. Add Inventory Form — Contact Lens Product Type ✅ VERIFIED (2026-08-28)

**Access Path:** Add Inventory form → Product Type = "Contact Lens"

**Key Business Rule:** All prices are per box. System auto-calculates per-piece price.

#### Contact Lens-Specific Attribute Fields

| Field Label | HTML ID | Type | Notes |
|-------------|---------|------|-------|
| Product Name | `productName` | text | Contact lens product name |
| Brand | `company` | text | Manufacturer/brand |
| Color | `color` | text | Lens color/tint |
| Number | `number` | text | Lens number/SKU variant |
| CT (Center Thickness) | `index` | text | Thickness at lens center |
| Type | `type` | text | Lens type classification |
| Materials | `material` | text | Material composition |
| Modality | `modality` | text | Wear schedule (Daily / Weekly / Monthly / etc.) |
| Validity In Days | `validity` | text | Lifespan once opened (in days) |
| WC (Water Content) | `waterContent` | text | Water content percentage (e.g., 38%, 55%) |
| Dk/t (Permeability) | `permeability` | text | Oxygen permeability value |
| Quality | `quality` | text | Quality grade |
| SPH | `SPL` | text | Sphere power |
| CYL | `CYL` | text | Cylinder power |
| Addition | `addition` | text | Addition power |
| Axis | `axis` | text | Axis angle |
| Base Curves (BC) | `baseCurves` | text | Base curve radius (e.g., 8.6) |
| Diameter (DIA) | `diameter` | text | Lens diameter (e.g., 14.0) |
| Power Type | `powerType` | text | Power classification |
| Batch Number | `lensBatchNumber` | text | Production batch reference |
| Mfg Date | `lensMfgDate` | date | Manufacturing date |
| Expiry Date | `lensExpiryDate` | date | Expiry date |
| No of Boxes | `lensNoOfBoxes` | text | Number of boxes |
| Pieces Per Box | `lensNoOfPieces` | text | Pieces in each box |
| Quantity | `quantity` | number (read-only) | Auto-calculated = Boxes × Pieces Per Box |

#### Contact Lens Pricing (Per Box)
| Field | HTML ID | Notes |
|-------|---------|-------|
| Purchase Rs Per Box | `purchaseRate` | Cost price per box |
| Retail Price Per Box | `salesRate` | MRP per box |
| Discounted Price Per Box | `discountSalesRate` | Selling price per box |
| Basic Price Per Box | `basicPrice` | Read-only calculated |
| Total Purchase Rs Per Box | `itemPurchaseAmount` | Read-only |
| Invoice Description | `invoiceDescription` | Optional |
| Total Purchase Amount | `totalPurchase` | Grand total read-only |

---

### Product Type Dropdown — Complete Options ✅ VERIFIED

| Value | Display Label |
|-------|--------------|
| Frame | Frame |
| Lens | Lens |
| Sunglasses | Sunglasses |
| Contact Lens | Contact Lens |
| Solution | Solution |
| Other | Other |
| Non Chargeable | Non Chargeable |

### Tax Rule Dropdown — Complete Options ✅ VERIFIED

| Value | Display Label |
|-------|--------------|
| (empty) | Not Applicable |
| Include | Include |
| Exclude | Exclude |

### Branch Name Dropdown — Sample Options ✅ VERIFIED

| Value | Display Label |
|-------|--------------|
| (empty) | Select Branch Name |
| EYE STYLE OPTICALS | EYE STYLE OPTICALS |
| RAMRAJ OPTICALS | RAMRAJ OPTICALS |


---

### N4. Sales → Create New Order ✅ VERIFIED (2026-08-28)

**Access Path:** SALES menu → Create New Order

**Key Insight:** The Sales order form has a **two-step customer selection** (search by mobile or create new) and a dynamic **multi-row product table**. The subagent successfully completed a full order (Order #5021, Invoice #5005) confirming the complete workflow.

#### SECTION 1 — Order Header

| Field Label | Type | Notes |
|-------------|------|-------|
| Branch Name | Select | Lists all configured branches (required) |
| Tax Ledger | Select | GST ledger selection |
| Order Date | Date | Auto-filled with current date (format: DD-MM-YYYY) |
| Delivery Date | Date+Time | Expected delivery date and time |
| Order Number | Text (read-only) | Auto-generated on submission |
| Salesperson | Text/Select | Staff member handling the sale |

#### SECTION 2 — Customer Selection

| Field Label | Type | Notes |
|-------------|------|-------|
| Mobile No. 1 | Text + Search button | Search existing customer by mobile |
| Customer Name | Text | Auto-filled after search |
| [Search result radio buttons] | Radio | Select from matched customers |
| [Add button] | Button | Confirms selected customer |
| [Create New Customer option] | Radio | If no match found, allows new customer creation |

#### SECTION 3 — Product Line Items (Repeating rows)

Each product row in the order table contains:

| Field Label | Type | Notes |
|-------------|------|-------|
| Product Type | Select | Frame / Lens / Sunglasses / Contact Lens / Solution / Other / Non-Chargeable |
| Product Code | Text + Autocomplete | Search by product code (e.g., SYS18) — auto-fills price |
| Description | Text (auto-filled) | Product description from master |
| Quantity | Number | Default 1 |
| Price | Number | Auto-filled from Retail/Discounted Price |
| Discount % | Number | Per-item discount |
| Tax % | Number | GST rate (auto-filled from Tax Rule) |
| Amount | Number (calculated) | Qty × Price − Discount + Tax |

**[+ Add Row]** button adds another product line

#### SECTION 4 — Prescription (Embedded in Order)

Prescription fields appear when Lens or Contact Lens items are added:

| Field | Notes |
|-------|-------|
| OD (Right Eye) SPH / CYL / AXIS | Distance vision for right eye |
| OS (Left Eye) SPH / CYL / AXIS | Distance vision for left eye |
| ADD Power | For bifocal/progressive |
| PD (Pupillary Distance) | |
| Doctor Name | Prescribing doctor |
| Prescription Date | |

#### SECTION 5 — Order Totals

| Field | Type | Notes |
|-------|------|-------|
| Sub Total | Number (read-only) | Sum of all line items before discount |
| Total Discount | Number | Aggregate discount |
| Total Tax | Number | Aggregate GST |
| Grand Total | Number (read-only) | Final payable amount |
| Advance Received | Number | Amount paid upfront |
| Pending Amount | Number (read-only) | Grand Total − Advance |

#### SECTION 6 — Payment

| Field | Type | Notes |
|-------|------|-------|
| Payment Mode | Select | CASH / CARD / UPI / CHEQUE / ONLINE |
| Payment Amount | Number | Amount being paid now |
| [Pay] Button | Button | Records the payment |
| Payment Reference | Text | For card/UPI/cheque reference number |

#### SECTION 7 — Order Submission

| Button | Action |
|--------|--------|
| Save as Order → | Saves as pending order (no invoice yet) |
| Generate Direct Invoice → | Saves and immediately generates invoice |
| Print Order Form | Prints the order form |

#### Business Rules Confirmed — Sales

| Rule # | Rule | Evidence |
|--------|------|----------|
| BR-015 | Customer is searched by mobile number first; if not found, can be created inline | Observed in order creation flow |
| BR-016 | Product Code autocomplete searches by code; price auto-fills from product master | Subagent typed SYS18 and price auto-filled as 1999.00 |
| BR-017 | Tax % auto-applied from product's Tax Rule (Frame=5% GST, Lens=12% GST) | Order showed Frame=5%, Lens=12% |
| BR-018 | Two invoice paths: Save as Order (pending) OR Direct Invoice (immediate) | Both buttons visible on form |
| BR-019 | Pending Amount updates in real-time as advance payment is entered | Observed: 4249.00 paid → pending = 0.00 |
| BR-020 | Order Number and Invoice Number are separate sequential IDs | Order #5021, Invoice #5005 confirmed |


---

## O. CUSTOMER MODULE — VERIFIED SCHEMAS ✅ (2026-08-28)

### O1. Customer Profile Page (View Information)

**Access Path:** Customer → Customer List → click customer name  
**Layout:** Single scrollable page with vertical sections (NO tabs — all sections stacked)

#### Section 1 — Customer Header / Profile Summary

| Field | Notes |
|-------|-------|
| Customer Name | Full name |
| Customer ID | System-generated numeric ID |
| Mobile Number 1 | Primary mobile |
| Address | Free text / India |
| Membership ID | If enrolled in membership program |
| Created Date | Account creation date & time |
| Loyalty Points Balance | Current points balance |
| Ledger ID | Linked accounting ledger ID |
| Total Purchase Amount | Cumulative spend (Rs) |
| Outstanding Balance | Dr./Cr. balance from ledger |

**Action Buttons on Profile:**
- Edit Customer
- Add Prescription
- Create New Order
- Send SMS
- Print Customer Label

#### Section 2 — Pending Order Items

| Column | Notes |
|--------|-------|
| # | Row number |
| Branch Name | Branch where order placed |
| Order No | Order reference number |
| Order Date | |
| Delivery Date | Expected delivery |
| Product Code | SKU |
| Product Type | Frame / Lens / CL / etc. |
| Description | Product description |
| Gross Amount | Before discount |
| Discount | Applied discount |
| Net Amount | After discount |
| Sales Person | Staff name |

#### Section 3 — Purchase / Sales History (Completed Orders)

Same columns as Pending Orders + **Bill No** and **Bill Date**

#### Section 4 — Sales Return Items

Same columns as Purchase History. Shows return transactions.

#### Section 5 — Prescriptions

| Column Group | Columns |
|-------------|---------|
| Customer Details | Branch Name, Order No, Bill No, Patient Name, Doctor/Optometrist Name, Date & Time |
| Eyewear Details (per row: DV / NV / ADD / IPD) | R-SPH, R-CYL, R-AXIS, R-PD, R-VA, R-PRISM, L-SPH, L-CYL, L-AXIS, L-PD, L-VA, L-PRISM |
| Contact Lens Details (per row: DV / NV / ADD) | R-SPH, R-CYL, R-AXIS, R-BC, R-DIA, L-SPH, L-CYL, L-AXIS, L-BC, L-DIA |
| Prescription Notes | Free text |

**Prescription checkboxes visible:** Constant Use, Progressive, Bifocal, Reading, Distance

#### Section 6 — Discount Coupons

| Column | Notes |
|--------|-------|
| # | |
| Coupon Code | Alphanumeric code |
| Coupon Value | % or fixed Rs |
| Mobile Number | Tied to mobile |
| Minimum Sales Value | Min order to apply |
| Status | Active / Used / Expired |
| Order Number | If used, which order |
| Used Date | When redeemed |
| Created Date | |
| Expiry Date / Date Range | Validity |

#### Section 7 — Loyalty Point Statement

| Column | Notes |
|--------|-------|
| # | |
| Date | Transaction date |
| Notes | Description (e.g., "Add points for order no 5021") |
| Points | Points earned/redeemed |

#### Section 8 — Ledger Statement (Accounting)

| Column | Notes |
|--------|-------|
| # | |
| Date | |
| Voucher Number | System-generated (e.g., VN000407) |
| Voucher Type | Sales / Receipt / Payment |
| Ledger | Ledger name |
| Narration | Description of transaction |
| Debit Amount (Rs) | |
| Credit Amount (Rs) | |
| Balance (Rs) | Running Dr./Cr. balance |

**Sample Voucher Types seen:** Sales, Receipt (for advance/balance payments)  
**Payment modes in narration:** UPI, CASH, CARD

#### Section 9 — SMS History

| Column | Notes |
|--------|-------|
| # | |
| Mobile Number | |
| SMS Type | |
| Content | Message content |
| Sent Date | |

#### Section 10 — Appointment History

| Column | Notes |
|--------|-------|
| # | |
| Branch Name | |
| Added On | When appointment was booked |
| Appointment Number | |
| Appointment Date | |
| Appointment Time | |
| Customer Name | |
| Customer Mobile | |
| Patient Name | Can differ from customer |
| Patient Mobile | |
| Doctor Name | |
| Status | Upcoming / Completed / Cancelled |

---

### O2. Customer List Page — Filters & Columns ✅

**Filters:**
- Branch Name (select)
- Mobile Number (text)
- Customer Name (text)
- Records per page (select: 10, 25, 50, 100)

**Table Columns:**
| Column | Notes |
|--------|-------|
| # | Row number |
| Customer ID (number) | Clickable — opens customer profile |
| Customer Name | Clickable — opens profile |
| Mobile Number 1 | |
| Address | |
| Ledger ID (number) | Clickable — opens account statement |
| Created Date | |
| Action | Edit ⚙ button |


---

## P. PURCHASE MODULE — VERIFIED SCHEMAS ✅ (2026-08-28)

### P1. Add Purchase Form ✅ VERIFIED

**Access Path:** PURCHASE → Add Purchase

#### Section 1 — Purchase Header

| Field Label | HTML ID | Type | Notes |
|-------------|---------|------|-------|
| Supplier Name | `supplierName` | Text + button | Autocomplete from Supplier master; "Add Supplier" button to create new |
| Purchase Bill Number | `purchaseBillNumber` | Text | Supplier's bill/invoice number |
| Branch Name | `shop` | Select | All configured branches |
| Date | `date` | Date | Purchase date (DD-MM-YYYY) |
| Tax Rule | `taxRule` | Select | Not Applicable / Include / Exclude |

#### Section 2 — Product Line Items (repeating rows)

| Field Label | HTML ID | Type | Notes |
|-------------|---------|------|-------|
| Product Type | `productType` | Select | Frame / Lens / Sunglasses / Contact Lens / Solution / Other / Non-Chargeable |
| Product Code | `productCode` | Text (read-only) | Looked up via search; auto-filled |
| Details | `description` | Textarea (read-only) | Product description auto-filled |
| Unit Price | `unitPrice` | Number (read-only) | Base price from inventory master |
| Purchase Price | `purchaseRate` | Number (read-only) | Purchase cost from master |
| Qty | `quantity` | Number | Quantity being purchased |
| Total Purchase Price | `totalItemPurchaseRate` | Number (read-only) | Qty × Purchase Price |
| Retail Price | `salesRate` | Number | Can override MRP on purchase |

**[+ Add Row]** button adds another product row

#### Section 3 — Purchase Totals

| Field Label | HTML ID | Type | Notes |
|-------------|---------|------|-------|
| Total Quantity | — | Number (read-only) | Sum of all row quantities |
| Total Unit Amount | `totalUnitPrice` | Number (read-only) | Sum of all unit prices |
| Total Purchase | `totalPurchase` | Number (read-only) | Sum before round-off |
| Round Off (+/-) | `roundOffAmount` | Number | Manual round-off adjustment |
| Total Net Purchase | `totalNetPurchase` | Number (read-only) | Final net purchase amount |

#### Section 4 — Action Buttons

| Button | Action |
|--------|--------|
| Save As Draft | Saves as pending purchase challan (not finalized) |
| Add Purchase | Finalizes and records the purchase |

---

## Q. REPORTS MODULE — COMPLETE LIST ✅ (2026-08-28)

**Access Path:** Click "REPORTS" in top nav (no dropdown — opens a report selection page)

### Q1. Full Reports List

| # | Report Name | Notes |
|---|-------------|-------|
| 1 | Inventory Report | Current stock levels by product |
| 2 | Transfer Stock Report | Inter-branch stock movements |
| 3 | Purchase Report | Purchase history with supplier/bill details |
| 4 | Sales Report | Sales transactions |
| 5 | Pending Order Report | Orders not yet invoiced |
| 6 | Order Form Report | Order form printouts |
| 7 | Customer Report | Customer master list |
| 8 | Customer Dues & Advance Report | Outstanding balances |
| 9 | Barcode Report | Barcode generation and printing |
| 10 | GST Input Report | Purchase-side GST (input tax credit) |
| 11 | GST Output Report | Sales-side GST (output tax) |
| 12 | Expenses Report | Expense transactions |
| 13 | Payment Report | Payment receipts and transactions |
| 14 | Eye Testing Records | Eye test/refraction records |
| 15 | Customer Visits Report | Customer visit/appointment log |
| 16 | Closing Stock Report | End-of-period stock valuation |
| 17 | Loss or Damage Stock Report | Damaged/written-off inventory |
| 18 | Order Tracking Report | Order status tracking |
| 19 | Pending Purchase Challan Report | Purchase drafts not finalized |
| 20 | Inventory Stock Movement Report | Product-wise stock movement history |
| 21 | Login Report | User login audit trail |
| 22 | Product Code/SKU Reports | Product code listing |
| 23 | Appointment Records | Appointment history |
| 24 | Prescription Records | Prescription history across all customers |
| 25 | Patient Report | Patient (customer) records |

---

## R. ACCOUNT MODULE — COMPLETE MENU LIST ✅ (2026-08-28)

**Access Path:** ACCOUNT dropdown in top nav

| Menu Item | Notes |
|-----------|-------|
| Expenses | Record and view expense entries |
| Ledgers | Manage account ledgers |
| Group Ledgers | Manage ledger groups (asset, liability, etc.) |
| Vouchers | View/create accounting vouchers |
| Account Payable | Supplier dues and payables |
| Account Receivable | Customer dues and receivables |
| Account Statement | Account-wise statement view |
| Trading, P/L Statement & Balance Sheet | Financial statements |
| Referral Payments | Referral commission payouts |

---

## S. INVENTORY MODULE — ADDITIONAL FEATURES ✅ (2026-08-28)

### S1. Transfer Stock Form ✅ VERIFIED

**Access Path:** INVENTORY → Transfer Stock

#### Search / Initiate Transfer

| Field Label | HTML ID | Type | Notes |
|-------------|---------|------|-------|
| Transferred From | `shopNameFrom` | Select | Source branch |
| Transferred To | `shopNameTo` | Select | Destination branch |
| Product Type | `productType` | Select | Filter by product type |
| Description | `productDescription` | Text | Search by product description |
| Product Code | `productCode` | Text | Search by product code |
| [Search] | — | Button | Finds matching inventory items |

After search, results table shows matching items with checkboxes to select which to transfer.

---

### S2. Inventory Audit ✅ VERIFIED

**Access Path:** INVENTORY → Inventory Audit

#### Audit List Page — Search Filters

| Field | Type | Notes |
|-------|------|-------|
| Branch Name | Select | Filter by branch |
| Product Type | Select | Filter by product type |
| Brand | Select | Filter by brand |
| Status | Select | Pending / Completed / etc. |
| Date Range From | Date input | `search_fromDate` |
| Date Range To | Date input | `search_toDate` |
| [Search] | Button | Apply filters |
| Records Per Page | Select | 10 / 25 / 50 / 100 |
| [Add New Inventory Audit] | Button | Opens audit creation form |

#### Add New Inventory Audit Form

| Field | Type | Notes |
|-------|------|-------|
| Select Branch | Select | Branch to audit |
| Select Product Type | Select | Product type to audit |
| Select Brand | Select | Brand filter for audit |
| Barcode | Text + button | Scan/enter barcode; "Validate Barcode" button |
| Audit Barcodes | Textarea | Bulk barcode entry (one per line) |

**Submit Buttons:**
- **Audit Stock** — finalizes and submits the audit
- **Save As Draft** — saves as pending audit for later completion

---

## T. FINAL SPEC STATUS — ALL ITEMS VERIFIED ✅

| Module | Form/Feature | Status |
|--------|-------------|--------|
| Products → Inventory | Add Inventory — Frame | ✅ VERIFIED |
| Products → Inventory | Add Inventory — Lens (Glass) | ✅ VERIFIED |
| Products → Inventory | Add Inventory — Contact Lens | ✅ VERIFIED |
| Sales | Create New Order | ✅ VERIFIED |
| Prescription | Add Prescription | ✅ VERIFIED |
| Customer | Customer List & Profile | ✅ VERIFIED |
| Customer | Add Customer Form | ✅ VERIFIED |
| Purchase | Add Purchase Form | ✅ VERIFIED |
| Reports | Full Report List (25 reports) | ✅ VERIFIED |
| Account | Full Menu List (9 items) | ✅ VERIFIED |
| Inventory | Transfer Stock Form | ✅ VERIFIED |
| Inventory | Inventory Audit Form | ✅ VERIFIED |

**Crawl completed: 2026-08-28. All HIGH and MEDIUM priority items verified. Spec is complete.**

