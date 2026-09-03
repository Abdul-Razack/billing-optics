# Deep Gap Analysis: billing-optics vs Optical CRM
> Analysed: 2026-08-28 | Your System: Next.js + Drizzle/PostgreSQL | Reference: india.opticalcrm.com

---

## EXECUTIVE SUMMARY

| Dimension | billing-optics | Optical CRM | Verdict |
|-----------|---------------|-------------|---------|
| Core billing / POS | ✅ Strong | ✅ Strong | **Parity** |
| Architecture / Code quality | ✅ Modern, event-sourced | ⚠️ Legacy PHP | **Your advantage** |
| Optical-specific product fields | ⚠️ Generic `attributes` JSONB | ✅ Typed fields per product type | **Gap** |
| Order/Invoice workflow | ⚠️ Direct invoice only | ✅ Pending Order + Direct Invoice | **Gap** |
| Customer profile depth | ⚠️ Minimal | ✅ 10-section rich profile | **Gap** |
| Prescription integration | ⚠️ Standalone only | ✅ Linked to orders + contacts | **Gap** |
| Multi-branch | ❌ Missing | ✅ Full | **Gap** |
| Lab Jobs | ✅ Present (schema exists) | ❌ Not found in CRM | **Your advantage** |
| Barcode handling | ✅ Scan-to-cart | ✅ 4 barcode modes | **Parity** |
| Offers/Promotions | ✅ Present | ⚠️ Only coupon codes | **Your advantage** |
| Loyalty Points | ❌ Missing | ✅ Points + statement | **Gap** |
| SMS / WhatsApp | ❌ Missing | ✅ Full SMS module | **Gap** |
| Appointments | ❌ Missing | ✅ Full appointment system | **Gap** |
| Reports depth | ⚠️ Basic (4 reports) | ✅ 25 reports | **Gap** |
| Accounting / Ledger | ✅ Event-sourced ledger | ✅ Double-entry vouchers | **Different approach** |
| Sales Returns | ✅ Schema exists | ✅ Present | **Parity** |
| Stock Transfers | ✅ Schema exists | ✅ Present | **Parity** |
| Inventory Audit | ✅ Schema exists | ✅ Present | **Parity** |
| User Roles | ⚠️ 3 roles only | ✅ Staff + Franchise hierarchy | **Gap** |

---

## 1. PRODUCT / INVENTORY MODULE

### 1.1 Product Data Model

**Optical CRM approach:**  
The `Add Inventory` form is a single, smart form that dynamically changes attribute fields based on `Product Type`. Each type has purpose-built fields:

| Product Type | Unique Fields |
|-------------|---------------|
| Frame | Name, Brand, Gender, Color, Size, Type (Full/Half/Rimless), Shape, Material, Temple Detail, Bridge Size, Quality |
| Lens (Glass) | Details, Brand, Color, Material, Coating, Design, Index (1.50/1.56/1.67), SPH, CYL, Addition, Axis, Consider As Pair |
| Contact Lens | Product Name, Brand, Color, Number, CT (Center Thickness), Type, Materials, Modality, Validity Days, WC (Water Content), Dk/t (Permeability), Quality, SPH, CYL, Addition, Axis, BC (Base Curves), DIA (Diameter), Power Type, Batch No, Mfg Date, Expiry Date, No of Boxes, Pieces Per Box |
| Sunglasses | Similar to Frame |
| Solution | Minimal fields |

**Your system (`products` table):**
```
name, sku, barcode, categoryId, description, costPrice, sellingPrice,
gstPercent, minStockAlert, isActive, attributes (JSONB)
```
All optical-specific fields land in `attributes JSONB` with no enforced schema. This means:
- ❌ No field validation for SPH range, BC, DIA, etc.
- ❌ No typed querying (can't filter lenses by index)
- ❌ No Contact Lens batch/expiry tracking
- ❌ No "Consider As Pair" for lenses
- ❌ No per-box vs per-piece pricing for Contact Lens

**Gap severity: 🔴 CRITICAL**

**Recommended Fix:**
Add a `productType` enum column and a typed `opticalAttributes` JSONB or separate child tables per type:
```sql
ALTER TABLE products ADD COLUMN product_type VARCHAR(50);
-- Then store typed schema per type in attributes:
-- Frame: {brand, gender, color, size, frameType, shape, material, templeDetail, bridgeSize, quality}
-- Lens: {material, coating, design, index, sph, cyl, addition, axis, isPairwise}
-- ContactLens: {modality, validityDays, waterContent, permeability, bc, dia, powerType, batchNo, mfgDate, expiryDate, noOfBoxes, piecesPerBox}
```

---

### 1.2 Pricing Model

**Optical CRM:**
- `Purchase Rs` (cost) 
- `Retail Price` (MRP)
- `Discounted Price` (actual selling price)
- Three separate prices on every product
- Contact Lens pricing is per-box, system auto-calculates per-piece

**Your system:**
- `costPrice` (in paise)
- `sellingPrice` (in paise)
- No separate `retailPrice` (MRP) field
- No per-box/per-piece split

**Gap severity: 🟡 MEDIUM**  
Missing MRP field means you can't show "was Rs X, now Rs Y" discounting to customers or compute correct discount % against MRP.

---

### 1.3 Barcode Options

**Optical CRM:** 4 barcode modes per product:
1. System Generated / Unique (each item gets its own barcode)
2. Common / Duplicate (same barcode on multiple items of same SKU)
3. Not Required
4. System Generated / Common

**Your system:** Single `barcode` field per product (unique).

**Gap severity: 🟡 MEDIUM** — The "Common/Duplicate" mode is important for frames where multiple pieces of the same model share one barcode.

---

### 1.4 Track Inventory / Negative Inventory Flags

**Optical CRM:** Per-product toggles — `Track Inventory (Yes/No)` and `Allow Negative Inventory (Yes/No)`.

**Your system:** No per-product inventory tracking toggle. All products tracked equally.

**Gap severity: 🟡 MEDIUM** — Useful for services/repairs (Non-Chargeable type) that shouldn't deduct from stock.

---

## 2. SALES / ORDER WORKFLOW

### 2.1 Order States — Critical Gap

**Optical CRM workflow:**
```
Create New Order
   ↓
[Option A] Save as Pending Order → Delivery/Lab work → Generate Invoice
[Option B] Direct Invoice → Immediate billing
```

**Your system workflow:**
```
Create Order → Complete Checkout → Invoice (immediate)
```

**Gap: Missing "Pending Order" state.** This is fundamental to optics:
- A customer orders prescription lenses → frame is ordered → lab job sent → item collected days later → THEN invoice
- Your system forces immediate invoicing with no "order pending" intermediate state
- Optical CRM's `Pending Order Report` shows all open orders awaiting fulfilment

**Gap severity: 🔴 CRITICAL**

Your schema has `labJobs.ts` which suggests this was partially designed for, but there's no UI or `orders` table separate from `invoices`.

**Recommended Fix:**
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, READY, INVOICED, CANCELLED
  customer_id BIGINT,
  expected_delivery DATE,
  notes TEXT,
  invoice_id BIGINT REFERENCES invoices(id) -- null until invoiced
);
```

---

### 2.2 Order Form — UI Flow Comparison

| Feature | billing-optics | Optical CRM |
|---------|---------------|-------------|
| Customer selection | Phone/name search | Mobile search + inline create |
| Walk-in customers | ✅ Supported | ✅ Supported |
| Product search | Name/SKU text search + barcode scan | Product Code autocomplete + type filter |
| Barcode scan to cart | ✅ Global hardware scanner hook | ✅ Barcode entry on product search |
| Per-line discount | ❌ Missing | ✅ Per-line Discount % field |
| Per-line tax | Auto from product | Auto from Tax Rule (per type) |
| Embedded prescription | ❌ Not in order form | ✅ Prescription fields embedded |
| Delivery date | ❌ Missing | ✅ Date + time picker |
| Salesperson field | ❌ Missing | ✅ Selectable from staff list |
| Cart draft save | ✅ localStorage draft | ❌ Not present |
| F-key hotkeys | ✅ F2/F4/F8/F10 | ❌ Not present |
| Offers/Promotions | ✅ Configurable offers engine | ❌ Only coupon codes |
| Live preview sidebar | ✅ Sticky right panel | ❌ Not present |

**Your UI advantages:** Cart draft persistence, F-key POS shortcuts, sticky live preview, offers engine  
**Your UI gaps:** Per-line discount, embedded prescription, delivery date, salesperson

---

### 2.3 Payment

**Optical CRM:**
- Payment recorded at time of order (advance)
- Separate "balance payment" can be recorded later from customer profile ledger
- Split payments not explicitly shown (one mode per transaction)
- Payment modes: CASH / CARD / UPI / CHEQUE / ONLINE

**Your system:**
- Single payment at checkout (one method, one amount)
- `paymentMethodEnum`: CASH / CARD / UPI / BANK_TRANSFER
- `referenceNumber` for non-cash
- Partial payment supported (balance tracked via `paymentStatus`)

**Gap:** Missing CHEQUE as a payment mode, missing split payment (e.g., Rs 1000 cash + Rs 500 UPI).

---

## 3. CUSTOMER MODULE

### 3.1 Customer Data Model

**Optical CRM customer fields:**
- Full Name, Mobile No 1, Mobile No 2, Email, Address, Date of Birth, Anniversary
- Membership ID (for loyalty)
- Gender
- Notes/Remarks

**Your `customers` table:**
```
fullName, phone, email, gender, address, notes, customFields (JSONB)
```

**Gaps:**
- ❌ No `dateOfBirth` or `anniversary` field (useful for SMS campaigns)
- ❌ No `mobile2` (secondary contact)
- ❌ No membership/loyalty ID column
- ❌ No `customerCode` or display ID (Optical CRM shows customer ID like #233)

**Gap severity: 🟡 MEDIUM**

---

### 3.2 Customer Profile — What's Present vs Missing

**Optical CRM customer profile has 10 sections:**

| Section | Your System |
|---------|-------------|
| Profile header (KPIs: total spend, balance, loyalty pts) | ⚠️ Basic — no spend KPI on profile |
| Pending Order Items table | ❌ Missing (no pending order state) |
| Purchase/Sales History table | ✅ Invoice list exists |
| Sales Return Items | ✅ Schema exists |
| Prescriptions (all, linked to orders) | ⚠️ Exists but not linked to orders |
| Discount Coupons | ❌ Missing |
| Loyalty Point Statement | ❌ Missing |
| Ledger Statement (Dr/Cr per transaction) | ⚠️ Ledger exists but not surfaced on profile |
| SMS History | ❌ Missing |
| Appointment History | ❌ Missing |

**Quick action buttons from profile:**
- Optical CRM: Edit, Add Prescription, Create New Order, Send SMS, Print Label
- Your system: Edit only (presumed)

---

### 3.3 Loyalty Points System

**Optical CRM:**
- Points earned per purchase (configurable rate)
- Points redeemable as discount
- Full loyalty statement on customer profile
- Points shown on customer header card

**Your system:** No loyalty system at all.

**Gap severity: 🟡 MEDIUM** — Very common expectation in Indian retail optics.

---

## 4. PRESCRIPTION MODULE

### 4.1 Prescription Data Model

**Optical CRM prescription schema (per eye row, multiple rows per visit):**

| Field Group | Fields |
|-------------|--------|
| Both eyes (DV / NV / ADD rows) | SPH, CYL, AXIS, PD, VA, PRISM |
| Contact Lens specific (DV / NV / ADD rows) | SPH, CYL, AXIS, BC (Base Curve), DIA (Diameter) |
| Checkboxes | Constant Use, Progressive, Bifocal, Reading, Distance |
| Header | Branch, Order No, Bill No, Patient Name, Doctor, Date |

**Your `prescriptions` table:**
```
rightEyeSph, rightEyeCyl, rightEyeAxis, leftEyeSph, leftEyeCyl, leftEyeAxis,
addPower, pd, notes, customerId, createdBy
```

**Critical gaps:**
- ❌ No VA (Visual Acuity) fields
- ❌ No PRISM fields
- ❌ No Contact Lens prescription fields (BC, DIA per eye)
- ❌ No vision type flags (Constant Use, Progressive, Bifocal, etc.)
- ❌ No `patientName` (prescription can be for family member, not just account holder)
- ❌ No `doctorId` / `doctorName` linked to prescription
- ❌ No linkage to Order/Invoice (which order triggered this prescription?)
- ❌ No separate NV (Near Vision) row — only one set of SPH/CYL/AXIS

**Gap severity: 🔴 CRITICAL** for an optics business

**Recommended additions to `prescriptions` table:**
```sql
-- Distance Vision (DV)
right_eye_va VARCHAR(20),     -- Visual Acuity e.g. "6/6"
right_eye_prism NUMERIC(5,2),
left_eye_va VARCHAR(20),
left_eye_prism NUMERIC(5,2),

-- Near Vision (NV)
nv_right_sph NUMERIC(5,2),
nv_right_cyl NUMERIC(5,2),
nv_right_axis INTEGER,
nv_left_sph NUMERIC(5,2),
nv_left_cyl NUMERIC(5,2),
nv_left_axis INTEGER,

-- Contact Lens
cl_right_bc NUMERIC(4,2),   -- Base Curve
cl_right_dia NUMERIC(4,2),  -- Diameter
cl_left_bc NUMERIC(4,2),
cl_left_dia NUMERIC(4,2),

-- Vision Type Flags
is_constant_use BOOLEAN,
is_progressive BOOLEAN,
is_bifocal BOOLEAN,
is_reading BOOLEAN,
is_distance BOOLEAN,

-- Linkage
patient_name VARCHAR(255),   -- Can differ from customer
doctor_id BIGINT,
invoice_id BIGINT,          -- Which order triggered this rx
```

---

### 4.2 Prescription-to-Order Linkage

**Optical CRM:** Prescription columns on Customer Profile show `Order No` and `Bill No` — each prescription is linked back to the sale that required it.

**Your system:** Prescriptions are completely standalone — no foreign key to invoices.

**Gap severity: 🔴 CRITICAL** — Without this linkage, you can't:
- Pre-fill lens order with customer's last prescription
- Show prescription history on invoice PDF
- Trace which glasses a prescription was used for

---

## 5. MULTI-BRANCH (FRANCHISE) SYSTEM

**Optical CRM:**
- Every entity (product, inventory, purchase, sale) belongs to a `Branch`
- Users are assigned to branches or "All Branch"
- Stock transfers between branches
- Branch-filtered reports
- Franchise user type with limited access

**Your system:**
- `locations.ts` schema exists but not wired into any core flow
- No `branchId` / `locationId` on products, invoices, purchases

**Gap severity: 🔴 CRITICAL** if client has >1 location. Retrofitting multi-branch later is painful.

---

## 6. PURCHASE MODULE

### 6.1 Purchase Form Comparison

| Field | billing-optics | Optical CRM |
|-------|---------------|-------------|
| Supplier | `vendors.ts` schema | Supplier Name autocomplete + inline create |
| Purchase Bill No | ✅ Present | ✅ Present |
| Branch | ❌ Not in purchase | ✅ Branch Name on every purchase |
| Date | ✅ Present | ✅ Present |
| Tax Rule | ❌ Global only | ✅ Per purchase (Include/Exclude/N.A.) |
| Product rows | `purchaseItems.ts` | ✅ Dynamic row table |
| Retail Price override | ❌ Missing | ✅ Can update selling price on purchase |
| Round-off | ❌ Missing | ✅ ±Round Off field |
| Draft / Save | ❌ Missing | ✅ "Save As Draft" + pending challan |
| Purchase Adjustment | ✅ `purchaseAdjustments.ts` | Not explicitly found |

**Gap severity: 🟡 MEDIUM**

---

## 7. REPORTS

### 7.1 Report Coverage Comparison

| Report | billing-optics | Optical CRM |
|--------|---------------|-------------|
| Sales Report | ✅ | ✅ |
| Customer Report | ✅ | ✅ |
| Low Stock Report | ✅ | ✅ (as Inventory Report) |
| Inventory Stock Movement | ✅ (ledger) | ✅ |
| Purchase Report | ✅ | ✅ |
| GST Input Report | ❌ | ✅ |
| GST Output Report | ❌ | ✅ |
| Pending Order Report | ❌ | ✅ |
| Customer Dues & Advance | ❌ | ✅ |
| Barcode Report (print) | ❌ | ✅ |
| Closing Stock Report | ❌ | ✅ |
| Loss / Damage Report | ❌ | ✅ |
| Order Tracking Report | ❌ | ✅ |
| Pending Purchase Challan | ❌ | ✅ |
| Prescription Records | ❌ | ✅ |
| Eye Testing Records | ❌ | ✅ |
| Customer Visits Report | ❌ | ✅ |
| Appointment Records | ❌ | ✅ |
| Login/Audit Report | ✅ (auditLogs) | ✅ |
| Referral Payments | ❌ | ✅ |
| Expenses Report | ❌ | ✅ |
| Payment Report | ⚠️ Basic | ✅ |

**Gap: 12 of 25 Optical CRM reports don't exist in your system.**  
**Gap severity: 🟡 MEDIUM** — Most critical missing: GST reports, Customer Dues, Pending Orders.

---

## 8. ACCOUNTING / LEDGER

### Approach Comparison

**Your system — Event-Sourced Immutable Ledger (modern, superior):**
- `ledger_events` table: every financial event is an immutable append
- `ledger_snapshots`: periodic state snapshots
- `customer_balances_view`: real-time materialized balance
- Hash-chained entries (tamper-evident)

**Optical CRM — Traditional Double-Entry:**
- Vouchers (Sales, Receipt, Payment)
- Dr/Cr per transaction
- Running balance per ledger
- Account Payable / Receivable views

**Assessment:** Your ledger architecture is technically **superior** — it's tamper-evident and auditable. However, you need to surface it better in the UI (customer profile ledger tab is missing, account statements not exposed to admin).

---

## 9. MISSING MODULES (Not Present in billing-optics at All)

### 9.1 SMS / WhatsApp Module ❌
**Optical CRM has:**
- Send SMS from customer profile
- SMS History tab on customer
- SMS types (Order ready, Birthday, Appointment reminder, Balance due)
- WhatsApp integration (green icon in top bar)

**Impact:** In Indian retail optics, SMS notifications ("Your glasses are ready") are expected by customers.

---

### 9.2 Appointment / Eye Testing Module ❌
**Optical CRM has:**
- Book appointments with date, time, doctor, patient, branch
- Appointment history on customer profile
- Eye Testing Records report

**Impact:** Optometry practices see patients by appointment. Without this, your system is billing-only, not practice management.

---

### 9.3 Loyalty / Membership Module ❌
**Optical CRM has:**
- Points earned per Rs spent
- Points redeemable as discounts
- Membership ID per customer
- Loyalty statement tab on profile
- Coupon code generation and redemption

**Impact:** Loyalty programs drive repeat visits — a significant expectation.

---

### 9.4 Discount Coupons ❌
**Optical CRM has:**
- Generate coupon codes for customers
- Minimum order value for coupon
- Expiry dates
- Status tracking (Active / Used / Expired)

**Your system:** Has an `Offers` engine but no customer-specific coupon codes.

---

### 9.5 Expenses Module ❌
**Optical CRM has:** Record operational expenses (rent, salary, utilities) with vouchers tracked in accounting.

---

## 10. ARCHITECTURAL COMPARISON

### 10.1 Where billing-optics Wins

| Advantage | Details |
|-----------|---------|
| **Modern stack** | Next.js 14, TypeScript, Drizzle ORM vs legacy PHP |
| **Event-sourced ledger** | Tamper-evident, hash-chained vs simple Dr/Cr |
| **Idempotent checkout** | `requestId` + session key prevents double-billing |
| **POS hotkeys** | F2/F4/F8/F10 — keyboard-driven POS for speed |
| **Cart draft persistence** | localStorage draft survives browser refresh |
| **Lab Jobs module** | Schema for optical lab tracking (not in CRM) |
| **Offers/Promotions engine** | Configurable %, fixed, product/category-specific offers |
| **Custom Fields** | Dynamic field definitions via settings |
| **Barcode scanner hook** | Global hardware scanner integration |
| **Sales Returns** | Schema and service exist |
| **Stock Transfers** | Schema exists |
| **Inventory Audit** | Schema exists |

### 10.2 Where Optical CRM Wins

| Advantage | Details |
|-----------|---------|
| **Optical product fields** | Typed per-type attributes (Frame/Lens/CL) |
| **Pending Order state** | Order → Lab Job → Invoice flow |
| **Customer profile depth** | 10 tabs with full history |
| **Multi-branch** | Everything is branch-scoped |
| **SMS / WhatsApp** | Integrated communication |
| **Appointments** | Full appointment booking |
| **Loyalty points** | Points earn/redeem system |
| **25 reports** | Comprehensive coverage |
| **Prescription depth** | VA, PRISM, CL fields, NV, linked to orders |
| **Per-line discount** | Discount % on each order line |
| **Pending challan** | Purchase draft state |

---

## 11. PRIORITY ROADMAP (What to Build Next)

### 🔴 P0 — Critical (Must-Have for Optics)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Typed optical product attributes (Frame/Lens/CL fields) | M | Very High |
| 2 | Pending Order state (Order → Invoice flow) | L | Very High |
| 3 | Prescription — add VA, PRISM, NV, Contact Lens fields | M | Very High |
| 4 | Prescription → Order linkage | S | Very High |
| 5 | Contact Lens: per-box/per-piece pricing | S | High |

### 🟡 P1 — High Priority

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 6 | Multi-branch support | XL | High |
| 7 | GST Input/Output reports | M | High |
| 8 | Customer profile — ledger tab | S | High |
| 9 | Customer profile — pending orders tab | S | High |
| 10 | MRP field on products (3rd price point) | S | Medium |
| 11 | Per-line discount on order | S | High |
| 12 | Delivery date on orders | S | Medium |
| 13 | Salesperson field on orders | S | Medium |

### 🟢 P2 — Medium Priority

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 14 | SMS notifications (Order Ready, Balance Due) | M | High |
| 15 | Loyalty points system | L | Medium |
| 16 | Appointment booking module | L | Medium |
| 17 | Customer dues / advance report | S | Medium |
| 18 | Purchase: Save As Draft | S | Medium |
| 19 | Date of Birth / Anniversary on customer | S | Low |
| 20 | Coupon code generation | M | Medium |

### 🔵 P3 — Low Priority / Nice to Have

| # | Feature | Effort |
|---|---------|--------|
| 21 | Expenses module | M |
| 22 | Closing stock / period-end reports | M |
| 23 | Loss/Damage stock write-off | S |
| 24 | Login audit report UI | S |
| 25 | WhatsApp integration | L |

---

## 12. UI / UX COMPARISON

| UI Dimension | billing-optics | Optical CRM |
|-------------|---------------|-------------|
| Design system | Modern — shadcn/ui, dark mode | Legacy — plain HTML tables |
| Navigation | Sidebar + breadcrumbs | Horizontal top menu bar |
| Mobile | Responsive (Next.js) | Not optimised for mobile |
| POS speed | ✅ Hotkeys, barcode, scan | ⚠️ No hotkeys |
| Forms | React Hook Form + Zod validation | Plain PHP forms |
| Real-time | Instant cart totals, live preview | Page reloads |
| Print | Thermal receipt + A4 bill PDF | PDF generation server-side |
| Accessibility | ⚠️ Not audited | ⚠️ Not audited |

**Your UI is significantly more modern and faster.** The gap is in feature coverage, not UI quality.

---

*End of gap analysis. All findings based on live crawl of india.opticalcrm.com and direct code inspection of billing-optics.*
