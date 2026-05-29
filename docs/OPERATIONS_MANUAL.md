# Optics ERP - Operational Handbook & Architecture Guide

## 1. System Architecture Overview

The Optics ERP is a monolithic, highly decoupled Point of Sale (POS) application optimized for offline-resilience and real-time operations.

### Stack
- **Frontend**: Next.js 14 (App Router, Client Components) with TailwindCSS & `shadcn/ui`.
- **Backend**: Express.js with TypeScript, running on Node.js.
- **Database**: PostgreSQL manipulated via Drizzle ORM.
- **State Management**: React `useState` & `useEffect` augmented by robust `localStorage` caching for draft orders.

### Core Philosophy
1. **Idempotency**: All critical checkout operations rely on `requestId` mechanisms. A single UI click loop or dropped network response will never result in duplicated invoices or payments.
2. **Draft Resilience**: Cashiers build carts entirely in the browser (`localStorage`). A crash or accidental refresh never loses the cart. 
3. **Optimistic Error Boundaries**: If a draft state becomes corrupted, standard React Error Boundaries catch the failure and present "Soft Refresh" or "Hard Reset" options rather than a blank white screen.

## 2. Cashier Operations & Workflows

### Checkout & Billing
1. Navigate to **Sales / Invoices > New Invoice**.
2. **Customer Selection**: Search for an existing customer or create a new one inline.
   - *Pro Tip*: Navigating from a customer's profile via "Create Invoice" will automatically pass their `customerId` in the URL and pre-fill the session.
3. **Cart Building**: Add items via product search or manual entry.
4. **Checkout**: 
   - Apply global or line-item discounts.
   - Register payments (Cash, Card, UPI).
   - If the payment is less than the total, the system automatically flags the invoice as `PARTIAL` or `UNPAID`.
5. **Idempotent Safety**: Clicking "Submit" rapidly will not create duplicate invoices. The system generates a single unique session ID (`SESS-[timestamp]`) per attempt.

### Unpaid / Partial Payment Follow-up
1. Navigate to the specific order from **Sales / Invoices**.
2. Click **Record Payment**.
3. Enter the remaining amount and submit. The invoice status automatically shifts to `PAID` once the balance reaches zero.
4. *Important Note*: The payment entry modal resets cleanly after each successful payment, ensuring the UI never locks up during sequential payments.

## 3. Inventory Ledger & Stock Movement

1. All stock additions, sales, and manual adjustments are heavily tracked in the `inventoryLedger` table.
2. A sale automatically inserts a `STOCK_OUT` ledger entry for each physical product in the cart.
3. **Auditing**: Owners can navigate to **Inventory > Ledger** to view a real-time, chronological history of all product movements, mapped directly to the `InventoryService.getHistory()` backend endpoint.

## 4. Operational Recovery & Troubleshooting

### White Screen / UI Freeze
If a cashier encounters a frozen UI or blank screen (usually caused by malformed `localStorage` drafts from previous sessions):
1. The global Error Boundary will intercept the crash.
2. The cashier should click **Hard Reset POS State**. This purges all local drafts and forces a clean reload without losing any database records.

### Network Drops During Checkout
If the WiFi drops the exact moment a cashier clicks "Submit":
1. The frontend will retry automatically or display a timeout error.
2. Because of the `requestId` header, clicking "Submit" again when the network returns is perfectly safe and will not double-charge the customer.

## 5. Developer Handoff & Maintenance

### Known Limitations
- The application currently relies on synchronous DB queries. Extremely large datasets (1M+ rows) in the customer search drop-down might require pagination/virtualization in future updates.
- The `/reports` dashboard currently displays some mock UI placeholders. Accurate reporting KPIs are available directly on the main Dashboard (`/`).

### Adding New Features
When adding new workflows, strictly adhere to the established pattern:
1. Define the Drizzle schema in `backend/src/db/schema`.
2. Expose the `Repository` and `Controller` in the backend.
3. Map the endpoint in the frontend `Service` (e.g., `inventory.service.ts`).
4. Avoid using `MOCK_` arrays for production features, as this creates audit blind spots.
