# Optical CRM — Verified Form Schemas (Session 2026-08-28)

> Crawl Session: 2026-08-28 | Status: In Progress

---

## N1. Add Inventory Form — Frame Product Type ✅ VERIFIED

**Access Path:** Inventory → Inventory Levels → Add New Inventory → Product Type = Frame

**KEY INSIGHT:** There is NO separate "Add Frame Master" form. The single **Add Inventory** form dynamically shows product-type-specific attribute fields based on the *Product Type* dropdown. All 7 product types share this same form with contextual fields.

### Top Section (Always Present)

| Field | Type | Notes |
|-------|------|-------|
| *Product Type | select | Frame, Sunglasses, Lens (Glass), Contact Lens, Solution, Other, Non-Chargeable, Repair |
| *Branch Name | select | All configured branches |
| *Tax Rule | select | Not Applicable, GST rates |
| Product Code | text | Manual or system-generated |

### Frame Attribute Fields (Row 1)
| Field | Type | Notes |
|-------|------|-------|
| Name | text | Frame model name |
| Brand | text | Free text (from Brand master) |
| Gender | text | Male / Female / Unisex / Kids |

### Frame Attribute Fields (Row 2)
| Field | Type | Notes |
|-------|------|-------|
| Color | text | Frame color |
| Size | text | Small / Medium / Large / numeric |
| Type | text | Full Rim / Half Rim / Rimless |
| Shape | text | Rectangular / Round / Square / Oval / Cat Eye |

### Frame Attribute Fields (Row 3)
| Field | Type | Notes |
|-------|------|-------|
| Material | text | Acetate / Metal / Titanium / TR90 |
| Temple Detail | text | e.g., 140mm |
| Bridge Size | text | e.g., 18mm |
| Quality | text | From Quality master (e.g., A+, A, B) |

### Inventory / Pricing Section (Common to ALL Product Types)
| Field | Type | Notes |
|-------|------|-------|
| *Quantity | number | Default = 0 |
| [Get Old Purchase Prices →] | button | Fetches previous purchase price |
| Purchase Rs | number | Cost price (0.00) |
| Retail Price | number | MRP (0.00) |
| Discounted Price | number | Selling price (0.00) |
| Track Inventory | radio Yes/No | Default: Yes |
| Allow Negative Inventory | radio Yes/No | Default: Yes |
| Barcode Options | radio | System Generated/Unique ● \| Common/Duplicate ○ \| Not Required ○ \| System Generated/Common ○ |
| Basic Price | number | Read-only calculated |
| Total Purchase Rs | number | Read-only (Qty × Purchase Rs) |
| Invoice Description | text | Optional |
| Total Purchase Amount | number | Grand total (read-only) |

**Submit:** Add Inventory → button

### Business Rules Confirmed
- BR-011: Contact Lens pricing is per box; system auto-calculates per-piece price
- BR-012: Product Type dropdown dynamically swaps the attribute fields section
- BR-013: Barcodes are generated at inventory addition time (not at product creation)
- BR-014: Track Inventory and Allow Negative Inventory default to Yes

---

## N2. Add Inventory — Lens (Glass) Product Type ❓ TODO
*Fields expected: SPH range, CYL range, AXIS, vision type (Single/Bifocal/Progressive), material, coating, index*

---

## N3. Add Inventory — Contact Lens Product Type ❓ TODO
*Fields expected: Base Curve (BC), Diameter (DIA), Water Content, Modality (Daily/Monthly), Validity Days, Power Type*

---

## N4. Sales → Create New Order ❓ TODO
*Full order workflow — customer selection, product lines, prescription, pricing, payment*

---

## Screenshots Captured (Session 2)
| File | Content |
|------|---------|
| after_frame_select_1787895421273.png | ✅ Add Inventory form with Frame fields fully visible |
| inventory_add_actions_1787895383673.png | Add Inventory page before product type selection |
| after_sunglasses_click_1787895246537.png | Sunglasses navigation test |
