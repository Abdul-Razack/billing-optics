# UI Flow & Connection Analysis: billing-optics vs Optical CRM
> Analysed: 2026-08-28

---

## 1. NAVIGATION STRUCTURE

### billing-optics — Left Sidebar
```
┌─────────────────────────────┐
│  Optics ERP                 │  ← Fixed brand name
│─────────────────────────────│
│  Dashboard          /       │  ALL roles
│  Sales / Invoices  /invoices│  ALL roles
│  Customers ▼                │  ALL roles
│    All Customers   /customers│
│    Marketing Hub   /customers/marketing│
│    Visitors Log    /reports/visitors│
│    Offers & Coupons /customers/offers│  ADMIN only
│    Referral Network /customers/referrals│
│    Loyalty Program  /customers/loyalty│
│  Products          /products│  ALL roles
│  Purchases         /purchases│ ADMIN + OPTOMETRIST
│  Inventory         /inventory│ ADMIN + OPTOMETRIST
│  Prescriptions     /prescriptions│ ALL roles
│  Lab Jobs          /lab-jobs│  ALL roles
│  Vendors           /vendors │  ADMIN + OPTOMETRIST
│  Payments          /payments│  ALL roles
│  Reports           /reports │  ADMIN + OPTOMETRIST
│  Users             /users   │  ADMIN only
│  Custom Fields     /custom-fields│ ADMIN only
│─────────────────────────────│
│  Settings          /settings│  ADMIN only (pinned bottom)
└─────────────────────────────┘
```

### Optical CRM — Top Horizontal Menu
```
PRODUCTS | INVENTORY | PURCHASE | SALES | CUSTOMER | REPORTS | SMS | PRESCRIPTION | ACCOUNT
```
Each opens a dropdown of sub-pages. No sidebar. Page reloads on every navigation.

### Navigation Gap Summary
| Aspect | billing-optics | Optical CRM |
|--------|---------------|-------------|
| Layout | Left sidebar, always visible | Top menu, hover dropdowns |
| Active state | Highlighted with primary color | No active highlight |
| Mobile | Hamburger sheet (MobileNav) | Not mobile-friendly |
| Role filtering | Built-in per nav item | Not present |
| Sub-navigation | Collapsible groups (Customers) | Dropdown on hover |
| Missing items | **Lab Jobs** (no CRM equivalent) | **SMS, Appointments** (no ERP equivalent) |

---

## 2. COMPLETE ROUTE MAP — billing-optics

### Routes You Have
```
/                               Dashboard
/invoices                       Invoice list
/invoices/new                   Create invoice (legacy?)
/invoices/[id]                  Invoice detail
/orders                         Orders list
/orders/create                  ← POS / Create Order (main billing page)
/orders/[id]                    Order detail
/orders/[id]/edit               Edit order
/orders/analytics               Order analytics

/customers                      Customer list
/customers/new                  Add customer
/customers/[id]                 Customer profile (3 tabs)
/customers/[id]/edit            Edit customer
/customers/[id]/prescriptions   Customer prescriptions list
/customers/import               CSV bulk import
/customers/offers               Offers & Coupons
/customers/referrals            Referral network
/customers/loyalty              Loyalty program
/customers/marketing            Marketing hub

/products                       Product list
/products/create                Add product
/products/[id]                  Product detail
/products/[id]/edit             Edit product
/products/import                Bulk import products

/purchases                      Purchase list
/purchases/new                  Add purchase
/purchases/barcodes             Barcode printing from purchases
/purchases/exceptions           Purchase exceptions/adjustments

/inventory                      Inventory overview
/inventory/alerts               Low stock alerts
/inventory/history              Inventory movement history
/inventory/ledger               Inventory ledger
/inventory/stock                Stock overview

/prescriptions                  Prescription list (all customers)
/prescriptions/new              Add prescription
/prescriptions/[id]             Prescription detail
/prescriptions/[id]/edit        Edit prescription

/lab-jobs                       Lab jobs list
/lab-jobs/new                   Create lab job
/lab-jobs/import                Import lab jobs

/vendors                        Vendor list
/vendors/new                    Add vendor
/vendors/import                 Import vendors

/payments                       Payments list
/payments/new                   Add payment
/payments/[id]                  Payment detail
/payments/pending               Pending payments

/reports                        Reports hub
/reports/sales                  Sales report
/reports/customers              Customer report
/reports/inventory              Inventory report
/reports/daily-statement        Daily statement
/reports/visitors               Visitor log
/reports/export                 Export data

/users                          User management
/users/new                      Add user
/users/[id]                     User detail

/custom-fields                  Custom field definitions
/custom-fields/new              Add custom field
/custom-fields/[id]             Edit custom field

/audit-logs                     Audit trail
/settings                       Business settings
/settings/locations             Branch locations
/settings/product-attributes    Product attribute management
/export                         Data export
/import                         Data import
/database-maintenance           DB maintenance
/system-health                  System health check
/sales/bulk-invoice             Bulk invoice creation
```

### Routes in Optical CRM — NOT in your system
```
❌ /sms                         SMS module
❌ /appointments                Appointment booking
❌ /account/expenses            Record expenses
❌ /account/vouchers            Accounting vouchers
❌ /account/payable             Account payable
❌ /account/receivable          Account receivable
❌ /account/statement           Account statements
❌ /account/pnl                 P&L and Balance Sheet
❌ /reports/gst-input           GST input report
❌ /reports/gst-output          GST output report
❌ /reports/closing-stock       Closing stock report
❌ /reports/pending-orders      Pending order report
❌ /reports/customer-dues       Customer dues & advance
❌ /reports/barcode             Barcode printing report
❌ /reports/damage-stock        Damaged stock write-off
```

---

## 3. PAGE-TO-PAGE CONNECTIONS (Data Flow Map)

### 3.1 Core Billing Flow — Your System
```
Customer List ──select──► Customer Profile (/customers/[id])
      │                           │
      │                           │ "Latest Prescription" shown (summary only)
      ▼                           ▼
Create Order (/orders/create) ◄── Prescriptions tab
      │
      ├── CustomerSelector ──search API──► customer record
      │
      ├── ProductOrderSelector ──search API──► product + stock check
      │       └── BarcodeScanner ──physical scan──► product lookup
      │
      ├── Offers Panel ──API──► active offers (% or fixed)
      │
      ├── PaymentSection (method + amount)
      │
      └── Submit ──POST /orders──►  Ledger event → inventory -qty
                                    Invoice created
                                    Payment recorded
                                    │
                              Success Screen
                                ├── Print Thermal Receipt [P]
                                ├── Print A4 Bill [F12]
                                ├── View Invoice [→]
                                └── Start New Order [ESC]
```

### 3.2 Core Billing Flow — Optical CRM
```
Customer List ──search──► Customer Profile
      │
      │ "Create New Order" quick action button
      ▼
Create New Order
      │
      ├── Customer mobile search → or Create New Customer INLINE
      │
      ├── Product rows: [Type] [Code autocomplete] [Qty] [Price] [Discount%] [Tax%]
      │
      ├── Prescription section EMBEDDED (when Lens/CL added)
      │
      ├── Delivery Date + Time
      │
      ├── Salesperson dropdown
      │
      ├── Advance Payment (partial ok)
      │
      └── [Save as Order] ──────────────────────► PENDING state
                │                                       │
                │                               (lab work, etc.)
                │                                       │
                │                               [Generate Invoice]
                │                                       │
          [Direct Invoice] ──────────────────────────────┤
                                                         ▼
                                                  Invoice + PDF
```

### 3.3 Customer Profile Connections Compared

**Your system (`/customers/[id]`) — 3 tabs:**
```
Customer Profile Header
  └── Action: Edit only

Stats: [Total Purchases] [Lifetime Value] [Last Visit] [Prescriptions count]

Tab: Overview
  ├── Contact info (phone, email, address)
  ├── Notes
  ├── Latest Prescription (SPH/CYL summary)
  └── Custom Fields

Tab: Invoices
  └── OrderTable ──click──► /orders/[id]

Tab: Prescriptions
  └── Rx list ──click──► /prescriptions/[id]
```

**Optical CRM — 10 sections (single scroll):**
```
Customer Header: Name | Mobile | Membership ID | Loyalty Pts | Balance | Total Spend
Quick Actions: [Edit] [Add Prescription] [Create New Order] [Send SMS] [Print Label]

Sections (all visible without tab switching):
1. Pending Orders → open orders not yet invoiced
2. Purchase History → completed invoices (with bill no, branch)
3. Sales Returns
4. Prescriptions → with Order No + Bill No linked on each row
5. Discount Coupons → active/used/expired
6. Loyalty Points Statement → earn/redeem history
7. Ledger (Dr/Cr) → per-transaction accounting
8. SMS History
9. Appointment History
```

**Missing on your customer profile:**
- ❌ No "Create New Order" button (even though URL supports `?customerId=`)
- ❌ No "Add Prescription" quick link
- ❌ No ledger/balance tab
- ❌ No loyalty points shown
- ❌ No pending orders section
- ❌ Prescriptions not linked to invoice numbers

---

### 3.4 Prescription Flow — The Broken Connection

**Your system:**
```
/prescriptions/new
  └── customerId (manually filled)
  └── eye fields (SPH/CYL/AXIS/ADD/PD only)
  └── ⚠️ NO invoiceId linkage
  └── ⚠️ NOT pre-filled from order form

/orders/create
  └── ⚠️ NO prescription pre-fill
  └── ⚠️ NO prescription created when lens sold

/customers/[id] → Prescriptions tab
  └── list ──click──► /prescriptions/[id]
  └── ⚠️ No "which order was this for?" column
```

**Optical CRM:**
```
/orders/create → Prescription section EMBEDDED
  └── Auto-fetches customer's last prescription
  └── Prescription saved WITH order reference
  └── Shown on customer profile with Order No + Bill No
```

**This is the most critical broken connection in your system.**

---

### 3.5 Lab Job Flow — Currently Disconnected
```
Current state:
/lab-jobs ──► list
/lab-jobs/new ──► form (standalone, not linked to order)

Should be:
/orders/[id] ──► [Send to Lab] button ──► /lab-jobs/new?orderId=X
                                                    │
                                            Lab job created (linked to order)
                                                    │
                                            Lab completes → status: READY
                                                    │
                                            Notification → [Generate Invoice]
                                                    │
                                            /invoices/[id] created
```

---

## 4. STACK CONNECTION DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Next.js 14)                  │
│                                                         │
│  Page Component                                         │
│    └── useFetch(url) hook                               │
│          └── fetchClient (lib/api-client.ts)            │
│                └── fetch('/api/...')                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────────┐
│                   EXPRESS BACKEND                        │
│                                                         │
│  Middleware chain:                                       │
│    authMiddleware (JWT verify)                          │
│    → roleMiddleware (ADMIN/CASHIER/OPTOMETRIST)         │
│    → rateLimiter                                        │
│    → router                                             │
│         └── Controller                                  │
│                └── Service (business logic)             │
│                       └── Repository (DB queries)       │
│                              └── Drizzle ORM            │
│                                     └── PostgreSQL      │
│                                                         │
│  Special: checkout.engine.ts                            │
│    └── Ledger (event-sourcing)                          │
│          └── ledger_events (append-only)                │
│          └── ledger_snapshots (periodic state)          │
│          └── materialized views:                        │
│               invoices_view                             │
│               inventory_view                            │
│               customer_balances_view                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. BROKEN / WEAK CONNECTIONS (Priority Fixes)

| # | Connection | Current State | Fix Needed |
|---|-----------|--------------|------------|
| 1 | Prescription → Order | ❌ No link | Add `prescriptionId` FK to invoices; embed rx in order form |
| 2 | Customer Profile → New Order | ❌ No button | Add "New Invoice" button → `/orders/create?customerId=X` |
| 3 | Customer Profile → Ledger | ❌ Missing tab | Add Ledger tab showing Dr/Cr statement |
| 4 | Lab Job → Order | ❌ Disconnected | Lab job needs `orderId` FK; order detail needs "Send to Lab" action |
| 5 | Order → Delivery Date | ❌ Not on form | Add delivery date field on order creation |
| 6 | Order → Salesperson | ❌ Missing | Add salesperson field (staff selector) |
| 7 | Lens Order → Prescription pre-fill | ❌ Missing | When lens added to cart, check customer rx and offer pre-fill |
| 8 | Sales/Invoices vs Orders nav | ⚠️ Confusing dupe | Merge into one nav item |
| 9 | Inventory Alert → New Purchase | ❌ No CTA | Add "Create Purchase" from low stock alert |
| 10 | Customer create → inline in Order | ❌ Requires navigation | Inline create in CustomerSelector when no match found |

---

## 6. WHAT'S WORKING WELL (Keep As-Is)

| Flow | Status |
|------|--------|
| POS hotkeys (F2/F4/F8/F10/F12) | ✅ Unique advantage — fast checkout |
| Cart draft to localStorage | ✅ Unique advantage — survives refresh |
| Barcode scanner → cart | ✅ Global hook, works seamlessly |
| Offers engine (% + fixed, product/category) | ✅ More powerful than CRM's coupons |
| Event-sourced ledger | ✅ Tamper-evident, auditable |
| Idempotent order submission | ✅ Prevents double-billing |
| Print (Thermal + A4 from same page) | ✅ Both formats with hotkeys |
| Role-based nav filtering | ✅ Clean RBAC in sidebar |
| Product custom attributes per category | ✅ Configurable without code changes |

---

*Analysis complete. All findings from direct code inspection of billing-optics.*
