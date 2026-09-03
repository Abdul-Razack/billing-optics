# Data Structure Comparison
### opticalcrm.com (Reference) vs. billing-optics (Ours)

---

## HOW EACH SYSTEM MODELS "CATEGORY"

### opticalcrm.com — Category Model

```
CATEGORY (flat, no parentId)
├── id
├── name         → "Frame", "Lens", "Solution", etc.
└── [NO sub-category column]

Subcategories (Men's, Women's, Kids) are NOT categories in the DB.
They are ATTRIBUTE VALUES on the gender attribute.
```

### billing-optics — Category Model

```
categories (flat, no parentId)
├── id
├── name         → varchar(255), unique
├── description  → varchar(500)
├── isActive     → boolean
├── createdAt
└── updatedAt
```

**✅ STRUCTURAL MATCH** — Both use a flat, non-hierarchical category table. Neither has a `parentId` column. The "Men's Glasses" subcategory in opticalcrm is NOT a real DB row — it is rendered from the `gender=Male` attribute filter. We should follow the same pattern.

---

## HOW EACH SYSTEM MODELS "ATTRIBUTES"

### opticalcrm.com — Attribute Model (EAV)

```
Category (e.g., "Frame")
    └── has many AttributeDefinitions
            ├── name:  "frameColor"
            ├── label: "Frame Color"
            ├── inputType: SELECT | TEXT | NUMBER
            └── has many AttributeOptions
                    ├── "Black"
                    ├── "Blue"
                    └── "Havana"
```

Attribute values are stored ON THE PRODUCT RECORD in a key-value structure.

### billing-optics — Attribute Model

```
productAttributeDefinitions
├── id
├── categoryId   → FK to categories.id
├── name         → camelCase, e.g. "frameColor"
├── label        → "Frame Color"
├── inputType    → 'SELECT' | 'TEXT' | 'NUMBER' | 'BOOLEAN'
├── isRequired   → boolean
└── displayOrder → number

productAttributeOptions
├── id
├── attributeDefinitionId → FK to productAttributeDefinitions.id
├── value        → "Black", "Blue", "Havana"
└── isActive     → boolean

products.attributes → jsonb  ← Stores the actual selected values per product
e.g. { "frameColor": "Black", "frameShape": "Aviator", "frameMaterial": "Acetate" }
```

**✅ STRUCTURAL MATCH — and we are MORE structured.** The reference system uses an EAV model. We also use EAV, but we have added `isRequired`, `displayOrder`, and `isActive` on options — things the reference system does NOT have but should.

---

## HOW EACH SYSTEM MODELS "VARIANTS"

This is the biggest structural difference.

### opticalcrm.com — Variant Model (Lens Grid Matrix)

```
LensProduct
    └── LensGrid (2D Matrix)
            ├── Rows:    SPH values  (-6.00, -5.75, -5.50 ... +6.00)
            └── Columns: CYL values  (-0.00, -0.25, -0.50 ... -4.00)

Each cell = a quantity in stock.
This is NOT individual product rows — it is a MATRIX UI that maps to
a single product with stock tracked by (SPH, CYL) coordinates.
```

### billing-optics — Variant Model

```
productVariants
├── id
├── productId   → FK to products.id
├── sku         → varchar(100)
├── barcode     → varchar(100)
├── attributes  → jsonb  ← { "sph": "-2.00", "cyl": "-0.50", "axis": "90" }
└── stockQuantity → integer
```

**🟡 STRUCTURAL DIFFERENCE — not a problem, actually better.**
The reference system uses a special-purpose 2D grid UI for lens inventory. Our system models the same data as individual `productVariant` rows where each row's `attributes` JSONB holds `{sph, cyl, axis}`. 

Both approaches result in the same data, but:
- **Their approach**: Custom matrix UI → easier for opticians to enter 50 SPH/CYL combos at once
- **Our approach**: Individual variant rows → more relational, easier to query, but needs a matrix UI to be usable

---

## HOW EACH SYSTEM MODELS "PRESCRIPTION" (CLINICAL DATA)

### opticalcrm.com — Prescription Model

```
POS Job Order Booking
├── Customer
├── OD / OS Grid (per-eye)
│   ├── DV (Distance Vision):  SPH, CYL, AXIS, VA
│   ├── NV (Near Vision):      SPH, CYL, AXIS, VA
│   └── ADD, PD
├── Wear Pattern (Constant, Reading, Distance)
├── Fitting Parameters (BVD, Wrap Angle, Progressive Length, FDC)
└── IOP (Intraocular Pressure) ← diagnostic, not refractive
```

### billing-optics — Prescription Model

```
prescriptions
├── customerId, patientId, doctorId
├── prescriptionType  → 'EYEWEAR'
├── lensTypes         → jsonb string[]  (Constant Use, Reading Wear, etc.)
└── prescriptionTests[] (one-to-many)
        ├── testType:  'OLD_LENS' | 'AR_READING' | 'MANUAL_TESTING' | 'SPECTACLE'
        ├── Right Eye: DV (sph, cyl, axis, va), NV (sph, cyl, axis, va), add, pd
        └── Left Eye:  DV (sph, cyl, axis, va), NV (sph, cyl, axis, va), add, pd
```

**✅ WE ARE MORE ADVANCED** — We model multiple test types per prescription (OLD_LENS, AR_READING, etc.) which the reference system does not explicitly separate. The reference system combines everything into a single OD/OS grid per prescription. Our structure is clinically more accurate.

**⚠️ MISSING IN OURS**: Fitting parameters (BVD, Wrap Angle, Progressive Length, Fitting Height, FDC) — these are captured in the reference system's "Add Wearing Parameters" modal but we have no column for them.

---

## COMPLETE STRUCTURAL COMPARISON TABLE

| Concept | opticalcrm.com Structure | billing-optics Structure | Match? |
|---|---|---|---|
| **Category** | Flat table, `name` only | Flat table, `name + description + isActive` | ✅ Match (we have more columns) |
| **Subcategory** | Virtual — rendered from attribute filter | No subcategory concept — same | ✅ Match |
| **Attribute Definition** | EAV — per-category, named fields | `productAttributeDefinitions` with `inputType`, `isRequired`, `displayOrder` | ✅ Match (we have more metadata) |
| **Attribute Options** | Dropdown option values per attribute | `productAttributeOptions` with `isActive` | ✅ Match (we have soft-delete) |
| **Product Attribute Values** | Stored on product record | `products.attributes` JSONB | ✅ Match |
| **Lens Variants** | SPH×CYL 2D grid matrix UI | `productVariants` rows with JSONB `{sph, cyl, axis}` | 🟡 Same data, different UX |
| **Prescription** | Single OD/OS grid per visit | Multiple test types per prescription (`prescriptionTests[]`) | ✅ We are more detailed |
| **Fitting Parameters** | BVD, Wrap Angle, FDC, Progressive Length | ❌ Not stored anywhere | 🔴 GAP |
| **Gender as filter** | Attribute value on product | Could be an attribute option (`frameGender`) | ✅ Same pattern |
| **Brand** | Attribute value on product (per category) | Should be attribute option (not a separate table) | ✅ Same pattern |
| **Lens Type** | Attribute value (Single Vision, Progressive, etc.) | Should be attribute option on Lens category | ✅ Same pattern |
| **Contact Lens Modality** | Attribute + conditional packaging rules | Should be attribute option on Contact Lens category | 🟡 Attribute defined, no conditional logic |
| **Sourcing (Add New / Customer Own)** | POS-level field on job order | No concept yet — this is a POS/invoice feature | 🔴 GAP (POS-level, not category-level) |

---

## THE KEY STRUCTURAL INSIGHT

```
opticalcrm.com approach:

  Category
  ────────
  "Frame"   ←── Static master list (7 items)
      │
      ├── Attribute Definitions  (dynamic, admin-configurable)
      │       ├── frameColor   (SELECT)
      │       ├── frameShape   (SELECT)
      │       └── frameSize_A  (NUMBER)
      │
      └── Attribute Options     (dynamic, admin-configurable)
              ├── frameColor: ["Black", "Blue", "Havana", ...]
              └── frameShape: ["Aviator", "Rectangle", ...]


  Product (e.g., "Ray-Ban Aviator")
  ──────
  ├── categoryId: → "Frame"
  └── attributes: { "frameColor": "Black", "frameShape": "Aviator", "frameSize_A": 54 }


billing-optics approach:

  categories                        productAttributeDefinitions
  ──────────                        ───────────────────────────
  "Frame"  ←── FK ──────────────── categoryId, name, label, inputType, isRequired

                                    productAttributeOptions
                                    ───────────────────────
                                    attributeDefinitionId, value, isActive

  products
  ────────
  ├── categoryId: → "Frame"
  └── attributes: { "frameColor": "Black", "frameShape": "Aviator" }   ← same JSONB
```

**The structures are identical in concept. Ours is actually more robust because of `isRequired`, `displayOrder`, and soft-delete on options.**

---

## SUMMARY: WHAT NEEDS TO CHANGE IN STRUCTURE

Nothing structural needs to change. The schema is correct. What is needed is:

1. **Data**: Seed the 7 categories + all their attribute definitions + all option values
2. **Fitting Parameters**: Add a `fittingParameters` JSONB column to the `prescriptions` or a new `prescriptionFitting` table to capture `BVD, wrapAngle, progressiveLength, fittingHeight, FDC`
3. **Lens Source**: Add a `lensSource` field at the invoice/POS level (not the category level) — options: `ADD_NEW` | `CUSTOMER_OWN`
4. **Lens Grid UX**: Build a matrix-style UI on top of the existing `productVariants` rows to make lens inventory entry practical for opticians
