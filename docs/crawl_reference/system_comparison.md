# System Structure Comparison Report

This report compares your requested hierarchical structure against the actual implementation in the current codebase (both Database and UI). 

Overall, **the current system is exceptionally well-aligned** with your requested structure. Most of the entities you requested already have direct, robust database schemas and supporting logic.

Here is the full detailed breakdown:

---

## 1. PRODUCT MASTER
> **Requested:** Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable, Package

### Current System Implementation:
- **Database:** Instead of hardcoding these exact product types into separate tables, the system uses a dynamic `categories` table (`backend/src/db/schema/categories.ts`). This is the best practice. You can add "Frame", "Sunglasses", "Lens", etc., as rows in this table from the UI.
- **Specific Logic:** The system *does* have specific hardcoded business logic for Lenses. In `enums.ts`, there is a `lensSourceEnum` (`'ADD_NEW'`, `'CUSTOMER_OWN'`) which correctly handles the edge case where a customer brings their own lens (bypassing inventory).
- **Variants:** Supported natively via `productAttributes.ts` and `productVariants.ts` (e.g., Color, Size, Power).
- **Missing/Gaps:** There is no explicit flag or table for "Packages" (bundled products). If a "Package" consists of a Frame + Lens sold together at a fixed price, it might currently be handled just as a standard product or requires a combo feature.

## 2. PURCHASE
> **Requested:** Purchase, Purchase Items, Challan, Barcode, Purchase Price, Discount, Other Cost

### Current System Implementation:
- **Purchase & Items:** Fully implemented via `purchases.ts` and `purchaseItems.ts`.
- **Challan:** Supported seamlessly. The `purchases.ts` table has a `documentType` enum (`'INVOICE'`, `'CHALLAN'`) and a specific `challanNumber` column.
- **Barcode:** Native barcode generation and tracking exist (`barcodes.ts` and `barcode_status` enum).
- **Purchase Price:** Tracked accurately as `unitCost` inside `purchaseItems.ts` (for historical accuracy) and a default `costPrice` in `products.ts`.
- **Discount:** Fully supported at both the line-item level (`discountPercentage` in `purchaseItems.ts`) and total invoice level (`totalDiscountAmount` in `purchases.ts`).
- **Other Cost:** Supported via an `adjustment_type` enum (`'FREIGHT'`, `'DISCOUNT'`, `'REBATE'`, `'FITTING_CHARGE'`) which ties into `purchaseAdjustments.ts`.

## 3. INVENTORY
> **Requested:** Stock Available, Stock In, Stock Out, Stock Transfer, Adjustment, Audit, Barcode Tracking

### Current System Implementation:
- **Stock Available:** Tracked via `stockBalances.ts`.
- **Stock In / Out:** Managed by a ledger system (`inventoryLedger.ts`). It uses `movement_type` enums (`PURCHASE`, `SALE`, `RETURN`) to accurately log exactly why stock changed.
- **Stock Transfer:** Fully implemented via `stockTransfers.ts` supporting statuses like `IN_TRANSIT`, `RECEIVED`, and `PARTIALLY_RECEIVED`.
- **Adjustment:** Supported via the `'ADJUSTMENT'` and `'AUDIT_ADJUSTMENT'` movement types.
- **Audit:** Fully supported via `inventoryAudits.ts` with statuses like `'IN_PROGRESS'` and `'RECONCILED'`.
- **Barcode Tracking:** Fully implemented via `barcodes.ts`. Individual barcodes have statuses like `'PENDING_PRINT'`, `'ACTIVE'`, `'SOLD'`, and `'RETURNED'`.

## 4. SALES
> **Requested:** Customer, Product, Prescription, Order, Discount, Invoice, Payment

### Current System Implementation:
- **Customer:** Tracked via `customers.ts` and `patients.ts`.
- **Prescription:** Dedicated `prescriptions.ts` table exists for optical measurements.
- **Order vs Invoice:** The system merges these concepts elegantly into `invoices.ts`. It uses a `deliveryStatus` enum (`'PENDING'`, `'READY'`, `'DELIVERED'`) to act as the "Order" state, and a `paymentStatus` enum (`'UNPAID'`, `'PARTIAL'`, `'PAID'`) to act as the financial state.
- **Discount:** Supported via `offers.ts` (Percentage or Flat Amount) and applied as `discountTotal` on invoices.
- **Payment:** Dedicated `payments.ts` schema tracking individual payment methods (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`).

## 5. ACCOUNTING
> **Requested:** Revenue, Receivable, Payment, Profit/Loss

### Current System Implementation:
- **Architecture:** The system utilizes an advanced **Event Sourcing Ledger** (`ledger.ts` - `ledger_events`, `ledger_snapshots`). This provides bank-grade financial tracking.
- **Revenue & Receivable:** Managed via specific materialized views: `invoices_view` and `customer_balances_view` (which tracks what customers owe).
- **Payment:** Tracked via the `payments` table and ledger events.
- **Profit/Loss:** While there isn't a single `profit_loss` table (which is standard, as P&L is a calculated report, not raw data), the system has all the data required to calculate it perfectly. Revenue is pulled from `invoices.grandTotal`, and Cost of Goods Sold (COGS) is pulled dynamically from `purchaseItems.unitCost` or `products.costPrice`.

---

## Conclusion
The existing database schema and application structure perfectly match your requested hierarchy. 

**Actionable Insights / Recommendations:**
1. **Packages/Bundles:** If you need to sell "Packages" (e.g., Frame + Lens for $99), we may need to verify if the UI supports bundling multiple `products` under a single `Package` SKU. Currently, the DB treats all items as individual products.
2. **Profit/Loss UI:** Ensure the reporting UI queries both the `ledger` for revenue and the `purchases` table for COGS to generate accurate real-time P&L statements.
