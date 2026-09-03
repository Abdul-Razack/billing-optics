# Category Crawl Execution Log
**Target:** https://india.opticalcrm.com/  
**Started:** 2026-09-03 16:55:00 IST  
**Completed:** 2026-09-03 17:06:00 IST  
**Scope:** Category Structure, Category Attributes, Category Forms, and Master Settings

---

## Log Entries

### [2026-09-03 16:55:00] Initialization
- Target URL: `https://india.opticalcrm.com/`
- Customer ID: `123452`
- User: `RAMRAJADMIN` (Role: Admin)
- Target Objective: Crawl all category definitions, navigation menus, product types (Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable), attribute configurations, and category settings.

### [2026-09-03 17:00:00] Authentication & Session Capture
- **Status:** Authentication **SUCCESSFUL**.
- User credentials passed and verified: `Customer ID: 123452`, `User Name: RAMRAJADMIN`, `Password: raju12345`.
- Active Client ID: `123452`
- Active Branch: `EYE STYLE OPTICALS`
- System Architecture Identified: PHP-based modular monolith with query-based routing (`index.php?page=<PAGE_KEY>&randomCode=<TOKEN>`).

### [2026-09-03 17:03:00] Navigation & Master Category Verification
- **Top Navigation Menus Verified:**
  - `PRODUCTS` (Dropdown: Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable)
  - `INVENTORY` (Inventory Levels, Transfer Stock, Inventory Audit, Lens Grid)
  - `PURCHASE` (Add Purchase, Purchase History, Challans, Barcodes)
  - `SALES` (New Order, Sales History, Returns, Bulk Invoice)
  - `CUSTOMER` (Customer List, Prescriptions, Loyalty, Visitors)
  - `REPORTS` (Sales, Inventory, Purchase, Tax)
  - `MASTER SETTINGS` (Gear Icon: 33+ administrative configuration modules)

- **Master Category Routing Keys Verified:**
  - `page=master-settings` — Master Settings control hub
  - `page=master-tax` — Product Types & HSN/SAC Tax mappings
  - `page=master-company` — Brand Master directory
  - `page=master-quality` — Quality Grade Master
  - `page=master-suppliers` — Supplier Master directory
  - `page=inventory` — Inventory Levels & Universal Add Inventory Form
  - `page=product-frame-add` / `page=product_frame_add` — Frame product form
  - `page=product_glass_add` / `page=product-lens-add` — Lens product form
  - `page=product_contactlens_add` — Contact Lens product form

---

## Extracted Category & Attribute Reference

### Key Architectural Discovery: Universal Dynamic Form
In the reference system, all 7 product categories share a **universal product form** (`Add Inventory`). Selecting the `Product Type` dropdown dynamically swaps the product-specific attribute fields while retaining shared inventory/pricing fields.

---

### 1. Frame (Eyeglasses)
- **Product Type Value:** `Frame`
- **Specific Fields:**
  - `Name` (Text) — Model name
  - `Brand` (Text / Autocomplete) — Linked to Brand Master
  - `Gender` (Text / Select) — `Male`, `Female`, `Unisex`, `Kids`
  - `Color` (Text) — Frame color
  - `Size` (Text) — Small, Medium, Large, or numeric
  - `Type` (Select) — `Full Rim`, `Half Rim`, `Rimless`
  - `Shape` (Select) — `Rectangular`, `Round`, `Square`, `Oval`, `Cat Eye`, `Aviator`, `Wayfarer`
  - `Material` (Select) — `Acetate`, `Metal`, `Titanium`, `TR90`, `Stainless Steel`
  - `Temple Detail` (Text) — Temple length (e.g. 140mm)
  - `Bridge Size` (Text) — Bridge width (e.g. 18mm)
  - `Quality` (Select / Text) — Quality grade (e.g. A+, A, B)

### 2. Sunglasses
- **Product Type Value:** `Sunglasses`
- **Specific Fields:**
  - `Name` (Text) — Model name
  - `Brand` (Text / Autocomplete) — Brand Master
  - `Gender` (Select) — `Male`, `Female`, `Unisex`, `Kids`
  - `Frame Color` (Text)
  - `Lens Color` (Text) — Tint / Lens shade
  - `Shape` (Select) — `Aviator`, `Wayfarer`, `Round`, `Square`, `Cat Eye`
  - `Material` (Select) — `Metal`, `Acetate`, `Polycarbonate`
  - `Lens Type` (Select) — `Polarized`, `UV Protected`, `Gradient`, `Mirror`
  - `Quality` (Select / Text)

### 3. Lens (Ophthalmic / Spectacle Lenses)
- **Product Type Value:** `Lens` / `Lens (Glass)`
- **Specific Fields:**
  - `Details` / `Description` (Text) — Auto-concatenated description
  - `Brand` (Text / Autocomplete) — Lens maker (e.g. Essilor, Zeiss, Crizal)
  - `Color` (Text) — Clear, Tint, Photochromic
  - `Material` (Select) — `CR39`, `Polycarbonate`, `Trivex`, `Glass`, `Hi-Index`
  - `Coating` (Select) — `HMC`, `ARC`, `Blue Cut`, `Photochromic`, `Anti-Glare`
  - `Design` (Select) — `Single Vision`, `Bifocal`, `Progressive`, `Trifocal`
  - `Index` (Select) — `1.50`, `1.56`, `1.60`, `1.67`, `1.74`
  - `Quality` (Text)
  - `SPH` (Text / Autocomplete) — Sphere power range
  - `CYL` (Text / Autocomplete) — Cylinder power range
  - `Addition` (Text) — Reading add
  - `Axis` (Text) — Astigmatism axis (1–180)
  - `Consider As Pair` (Checkbox) — Toggle pair vs single unit

### 4. Contact Lens
- **Product Type Value:** `Contact Lens`
- **Specific Fields:**
  - `Product Name` (Text)
  - `Brand` (Text / Autocomplete) — Bausch & Lomb, Acuvue, CooperVision, etc.
  - `Color` (Text) — Cosmetic or clear
  - `Number` / `Product Code` (Text)
  - `CT (Center Thickness)` (Text)
  - `Type` (Select) — `Spherical`, `Toric`, `Multifocal`
  - `Materials` (Text / Select) — Silicone Hydrogel, Hydrogel
  - `Modality` (Select) — `Daily`, `Weekly`, `Monthly`, `Yearly`
  - `Validity In Days` (Number) — e.g. 1, 30, 365
  - `WC (Water Content)` (Number) — Percentage (e.g. 55%, 38%)
  - `Dk/t (Permeability)` (Text / Number) — Oxygen transmissibility
  - `Base Curves (BC)` (Text / Select) — e.g. 8.4, 8.6
  - `Diameter (DIA)` (Text / Select) — e.g. 14.0, 14.2
  - `Power Type` (Select)
  - `Batch Number` (Text)
  - `Mfg Date` (Date)
  - `Expiry Date` (Date)
  - `No of Boxes` (Number)
  - `Pieces Per Box` (Number) — Used to auto-calculate per-piece unit price

### 5. Solution
- **Product Type Value:** `Solution`
- **Specific Fields:**
  - `Name` (Text)
  - `Brand` (Text)
  - `Variants` (Select / Text) — Multipurpose, Saline, Hydrogen Peroxide
  - `Packing Type` (Select / Text) — 60ml, 120ml, 360ml
  - `Color` (Text)

### 6. Other (Accessories)
- **Product Type Value:** `Other`
- **Specific Fields:**
  - `Name` (Text)
  - `Brand` (Text)
  - `Type` (Select) — Case, Cleaning Cloth, Chains, Screws, Nose Pads
  - `Color` (Text)
  - `Shape` (Text)
  - `Size` (Text)

### 7. Non-Chargeable
- **Product Type Value:** `Non-Chargeable`
- **Specific Fields:**
  - `Name` (Text) — Promotional giveaways, cleaning sprays, pouches
  - `Type` (Select)
  - `Color` (Text)
  - `Size` (Text)
  - `Material` (Text)
  - `Packages` (Text)

---

## Universal Inventory & Pricing Fields (All Categories)
- `Branch Name` (Select) — Target shop branch
- `Tax Rule` (Select) — GST rate (0%, 5%, 12%, 18%, 28%)
- `Product Code` (Text) — System-generated or manual barcode/SKU
- `Quantity` (Number)
- `Purchase Rs` (Number) — Cost price
- `Retail Price` (Number) — MRP
- `Discounted Price` (Number) — Selling price
- `Track Inventory` (Radio: Yes / No)
- `Allow Negative Inventory` (Radio: Yes / No)
- `Barcode Options` (Radio: Unique, Duplicate, Common, Not Required)
- `Invoice Description` (Text)

---

## Action Items for Billing Optics Codebase
1. **Ensure all 7 Master Categories exist in DB:**
   - Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable.
2. **Backend Validation Fix:**
   - Update `backend/src/validators/catalog.validator.ts` so `createCategorySchema` and category update endpoints do not strip `description`, `parentId`, `isActive`, and `attributeSchema`.
3. **Seed Database:**
   - Execute `seed_all_attributes.ts` or migration to ensure all 7 categories and their attributes/options are populated in PostgreSQL.
4. **Dynamic Frontend Fields:**
   - Verify that `ProductForm.tsx` renders the dynamic fields based on the selected category matching this reference spec.
