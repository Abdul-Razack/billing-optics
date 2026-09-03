# Optical ERP: Missing Workflows & Architecture Assessment

Based on your current inventory-heavy system, here is the operational workflow you need to build to complete the ERP. We also assess whether this requires database changes or a UI redesign.

> [!IMPORTANT]
> **Quick Answer:** You **do not** need to throw away or redesign your existing inventory screens. However, you **will** need to add several new Database tables and build new UI screens for the Point of Sale (POS) and Patient Management.

---

## 1. The Missing Optical Workflow (End-to-End)

To run an optical shop, the software must handle the following sequence. Your system currently only handles the "Inventory" part of Step 3.

### Step 1: Reception & Patient Registration (CRM)
*   **Action:** A customer walks into the shop.
*   **Workflow:** The receptionist searches for their phone number. If they are new, a new Customer Profile is created. If returning, their history is pulled up.

### Step 2: Eye Testing (EMR / Clinical)
*   **Action:** The customer goes to the Optometrist.
*   **Workflow:** The Optometrist enters the new prescription (Sph, Cyl, Axis, ADD, PD, Vision) into the system.

### Step 3: Product Selection (Inventory Integration)
*   **Action:** The customer selects a frame, lenses, or sunglasses.
*   **Workflow:** The salesman selects the items from your *existing* inventory system (`products_frames`, `products_glass`, etc.) and adds them to a digital "Cart".

### Step 4: Billing & Point of Sale (POS)
*   **Action:** The customer pays for the order.
*   **Workflow:** The system calculates the total, applies discounts, takes an advance payment, generates an Invoice Number, and prints a receipt.

### Step 5: Lab Processing & Order Tracking
*   **Action:** The glasses need to be manufactured/fitted.
*   **Workflow:** A "Lab Job" ticket is generated. Staff updates the status: *Sent to Lab -> Processing -> Received from Lab -> Ready for Delivery*. Automatic SMS is sent to the customer when "Ready".

### Step 6: Delivery
*   **Action:** Customer picks up the glasses.
*   **Workflow:** Final pending payment is collected, and the order status is marked as "Delivered".

---

## 2. Do you need to add anything to the Database?

> [!WARNING]
> **Yes, significant Database Additions are required.** Your current DB is perfectly structured for Products, but it currently lacks the tables to handle people, money, and time.

You will need to create the following new tables (or similar):

*   **`customers`**: To store name, phone, email, age, and address.
*   **`prescriptions`**: To store the clinical eye testing data linked to the `customer_id`.
*   **`invoices` / `orders`**: To track the transaction (invoice number, total amount, tax, discount, advance paid, pending balance).
*   **`order_items`**: A bridge table linking the `invoice_id` to your existing inventory tables (e.g., linking to `products_frames` ID or `products_glass` ID).
*   **`lab_jobs`**: To track the status of the physical glasses being made.
*   **`payments`**: To track multiple payment transactions (e.g., Paid $50 advance in Cash today, paid $100 balance via Card tomorrow).

---

## 3. Do you need a UI Redesign?

> [!TIP]
> **No full redesign is needed.** You can keep your existing Master Settings and Product UI exactly as they are. You just need to **ADD** new sections.

**What you need to build (UI-wise):**
1.  **A Global Navigation Sidebar:** You need a menu that separates modules logically:
    *   Dashboard
    *   POS / Billing (New)
    *   Patients / Customers (New)
    *   Lab Orders (New)
    *   Inventory (Your existing pages)
    *   Master Settings (Your existing pages)
2.  **The POS Screen:** This should be a fresh, highly optimized "Checkout" screen. It needs a search bar to scan barcodes or search products, a cart summary, and a payment modal.
3.  **Customer Profile Dashboard:** A single page showing a customer's details, past prescriptions, and previous bills.
