# Category System — Gap Analysis Report
### opticalcrm.com (Reference) vs. billing-optics (Our System)

---

## EXECUTIVE SUMMARY

The good news: our architecture is **fundamentally sound** and already has the right foundations.
The bad news: **the foundations are empty**. The schema exists, but is not seeded, not connected to the UI, and has no validation logic.

The reference system (opticalcrm.com) uses a **flat DB + EAV (Entity-Attribute-Value) pattern** — exactly what we have. The key difference is they have **fully populated it** with all 7 categories, their 125+ attributes, and all option values (colors, shapes, brands, etc.). We have the table structures, but they are empty and the UI does not use them yet.

---

## 1. CATEGORY STRUCTURE COMPARISON

### Reference System (opticalcrm.com)
- **7 master product categories** at the root level (flat)
- Sub-categories (Men's, Women's, Kids, etc.) are **NOT** real DB categories — they are **gender attribute filters** rendered as virtual navigation links
- Lens sub-types (Single Vision, Progressive, etc.) are **lens type attributes** on the Lens category, not standalone categories

### Our System (billing-optics)
- Currently seeds only **2 categories**: `Frames` and `Lenses`
- The `productAttributeDefinitions` table exists but is **completely empty** — not seeded
- The `productVariants` table exists but is **not wired up** to any UI

### Category Mapping

| # | opticalcrm Name    | Our DB Name   | Status       | Notes                                    |
|---|--------------------|---------------|--------------|------------------------------------------|
| 1 | Frames (Eyeglasses)| `Frames`      | ✅ Exists    | Seeded, but no attributes defined        |
| 2 | Sunglasses         | ❌ Missing    | 🔴 **GAP**   | Not in seed, not in DB                   |
| 3 | Lenses (Spectacle) | `Lenses`      | ✅ Exists    | Seeded, but no attributes defined        |
| 4 | Contact Lenses     | ❌ Missing    | 🔴 **GAP**   | Not in seed, not in DB                   |
| 5 | Solutions          | ❌ Missing    | 🔴 **GAP**   | Not in seed, not in DB                   |
| 6 | Other              | ❌ Missing    | 🔴 **GAP**   | Not in seed, not in DB                   |
| 7 | Non-Chargeable     | ❌ Missing    | 🔴 **GAP**   | Not in seed, not in DB                   |

> [!CAUTION]
> **5 out of 7 master categories are completely missing** from our seed data. This means any product form will only show 2 options in the category dropdown.

---

## 2. ATTRIBUTE SYSTEM COMPARISON

### Reference System Architecture
The reference system uses a full **EAV model** with:
- Each product type has a defined set of **attribute definitions** (name, label, input type)
- Each SELECT attribute has a **pre-populated list of options** (colors, brands, shapes, etc.)
- When a user picks a category in POS, conditional rendering shows only that category's attribute fields

### Our System Architecture

We have the **exact same schema** already built:

```
productAttributeDefinitions  →  productAttributeOptions
(e.g., "frameColor", SELECT)     (e.g., "Black", "Blue", "Grey")
```

**BUT — the tables are completely empty.** No attribute definitions, no options.

### Attribute Gap by Category

#### 🔴 FRAMES — Attributes Missing from Our System

| Attribute      | Input Type | Options (from reference)                                                       |
|----------------|------------|--------------------------------------------------------------------------------|
| Frame Color    | SELECT     | Black, Blue, Grey, Havana, Tortoise, Silver, Transparent, Wine, Green, etc.   |
| Frame Shape    | SELECT     | Aviator, Oval, Rectangle, Square, Wayfarer, Feather Light                      |
| Frame Material | SELECT     | Acetate, Metal, Nylon, Plastic, Polycarbonate, Stainless Steel                 |
| Frame Gender   | SELECT     | Male, Female, Kids, Unisex                                                     |
| Frame Brand    | SELECT     | Armani Exchange, Burberry, Gucci, Oakley, VOGUE, Zeiss, Vincent Chase, etc.   |
| Frame Size A   | NUMBER     | Horizontal lens width (box measurement)                                        |
| Frame Size B   | NUMBER     | Vertical lens height (box measurement)                                         |
| Frame Size C   | NUMBER     | Bridge width                                                                   |
| Frame Size D   | NUMBER     | Total frame width                                                               |
| Frame Size ED  | NUMBER     | Effective Diameter (critical for lab cutouts)                                  |
| Frame Type     | SELECT     | Full Rim, Half Rim, Rimless                                                    |

#### 🔴 LENSES — Attributes Missing from Our System

| Attribute        | Input Type | Options / Notes                                              |
|------------------|------------|--------------------------------------------------------------|
| Lens Vision Type | SELECT     | Single Vision, Progressive, Bifocal, Trifocal, Computer      |
| Lens SPH (R/L)   | NUMBER     | Spherical power (clinical prescription field)                |
| Lens CYL (R/L)   | NUMBER     | Cylindrical power                                            |
| Lens AXIS (R/L)  | NUMBER     | Astigmatism axis (1–180 degrees)                             |
| Lens ADD (R/L)   | NUMBER     | Addition power (for progressive/bifocal)                     |
| Lens Coating     | SELECT     | Tinting, Mirror Coating, Hi-Index/Thin, Premier Performance  |
| Wear Pattern     | SELECT     | Constant Use, Reading Wear, Distance Wear                    |
| Fitting Height   | NUMBER     | Vertical measurement from lens bottom to pupil center        |
| Progressive Length | NUMBER   | Corridor length (mm) for progressive lenses                  |
| BVD              | NUMBER     | Back Vertex Distance                                         |
| Wrap Angle       | NUMBER     | Curvature of frame face                                      |
| Inclination      | NUMBER     | Pantoscopic tilt                                             |

> [!NOTE]
> The reference system handles **clinical prescription data (SPH, CYL, AXIS)** both as product variant attributes (for pre-made lens stock) and as patient-specific prescription fields at POS. Our `prescriptions` table already handles the patient side — but the lens inventory/variant side is empty.

#### 🔴 CONTACT LENSES — All Attributes Missing

| Attribute        | Input Type |
|------------------|------------|
| Contact Lens Brand | SELECT   |
| Lens Modality    | SELECT     | Daily, Monthly, Toric                               |
| Base Curve       | NUMBER     |
| Diameter         | NUMBER     |
| Power Type       | SELECT     |
| Water Content (WC) | NUMBER   |
| Dk/t Permeability | NUMBER    |
| Validity (Days)  | NUMBER     |
| Packaging        | SELECT     | Pack of 6, Pack of 30, 12 per box                   |
| Color            | SELECT     |

#### 🔴 SOLUTIONS — All Attributes Missing

| Attribute        | Input Type |
|------------------|------------|
| Solution Variants | SELECT    |
| Packing Type     | SELECT     |
| Solution Color   | SELECT     |

---

## 3. ARCHITECTURE COMPARISON — WHAT WE HAVE vs. WHAT THEY HAVE

| Layer               | opticalcrm.com                               | billing-optics (Ours)                             | Status         |
|---------------------|----------------------------------------------|---------------------------------------------------|----------------|
| **DB: Category table** | 7 populated categories                    | 2 categories seeded (5 missing)                   | 🟡 Partial     |
| **DB: Attribute schema** | Full EAV with definitions + options     | Schema built (`productAttributeDefinitions`, `productAttributeOptions`) but **empty** | 🟡 Schema only |
| **DB: Variant schema** | Lens grid (SPH × CYL matrix)             | `productVariants` table built but **empty + not wired up** | 🟡 Schema only |
| **Backend: Attribute API** | Full CRUD                             | `GET /product-attributes/categories/:id/attributes`, `POST /attributes`, etc. — **built but untested with real data** | 🟡 Built, unverified |
| **Backend: Validation** | Per-category attribute enforcement      | `attributes: z.record(z.any()).optional()` — completely open, **no per-category rules** | 🔴 Missing     |
| **Frontend: Category form** | Dynamic — changes fields per category | Static form: only Name, Description, Active toggle | 🔴 Missing     |
| **Frontend: Product form** | Dynamic attributes shown per category | No attribute fields visible in product form        | 🔴 Missing     |
| **Frontend: Attribute Manager** | Admin can add/edit attributes   | No UI page exists for managing attribute definitions | 🔴 Missing     |
| **Seed data: Attributes** | 125+ attribute values loaded         | 0 attributes seeded                                | 🔴 Empty       |
| **Prescriptions** | Full OD/OS clinical grid in POS              | `prescriptions` table fully built and functional   | ✅ Done        |
| **Multi-location** | Store Master, Location Master                | `locations` table exists in schema                 | 🟡 Schema only |

---

## 4. DATA QUALITY ISSUES FOUND IN REFERENCE SYSTEM (Useful for Us to Avoid)

The reference system's crowded, un-governed attribute data reveals real-world issues we should design against:

| Issue | Example from opticalcrm.com | Our Recommendation |
|---|---|---|
| Duplicate spellings | "Aviater" and "Aviator" both exist as Shape values | Use enum or ID-based options, never free text for SELECT fields |
| Wrong category assignment | "Hilafilcon B" (a contact lens material) listed under Frame Materials | Enforce category-scoped attributes — an attribute belongs to ONE category |
| Percentage values as materials | "41%", "46%", "78%" stored as Material names | Use numeric fields for percentages, not text |
| Inconsistent naming | "bausch and lomb" (lowercase) vs "Johnson And Johnson" | Normalize brand names on insert |

---

## 5. PRIORITIZED ACTION PLAN

### Phase 1 — Data Foundation (Do This First)
1. **Update `seed.ts`** — Add all 7 categories: Frame, Sunglasses, Lens, Contact Lens, Solution, Other, Non-Chargeable
2. **Create `seed_attributes.ts`** — Seed `productAttributeDefinitions` + `productAttributeOptions` for all 7 categories using the data from the opticalcrm crawl
3. **Verify the existing attribute API** works correctly with `GET /product-attributes/categories/:id/attributes`

### Phase 2 — Backend Validation
4. **Update `catalog.validator.ts`** — When a product is created/updated, look up that category's required attributes and validate them in the `attributes` JSONB field

### Phase 3 — Frontend UI
5. **Update product creation form** — When a category is selected, call the attributes API and dynamically render the correct input fields
6. **Create Attribute Manager page** — An admin UI under Settings to view/add/edit attribute definitions and options for each category
7. **Update product list/detail** — Show attribute values in the product table

### Phase 4 — Advanced
8. **Lens Grid Purchase** — The reference system's most powerful feature. Needs a 2D matrix UI (SPH × CYL) for bulk lens inventory entry — this is a separate, complex feature
9. **Contact Lens variants** — Packaging rules (Pack of 6 for monthly, Pack of 30 for daily) driven by modality attribute

---

## BOTTOM LINE

> Our **schema is almost a perfect match** for the reference system's architecture. The entire gap is in **data population and UI wiring**. We are not rebuilding the foundation — we are filling it in and connecting it.

The most impactful first task is **updating the seed file** to add all 7 categories and their full attribute definitions. Everything else builds on top of that.
