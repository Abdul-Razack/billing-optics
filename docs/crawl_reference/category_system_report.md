# Category System Report — Billing Optics
> Full analysis from Database → Backend → API → Frontend UI

---

## 1. DATABASE LAYER

**File:** [`backend/src/db/schema/categories.ts`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/schema_dump.txt)

The `categories` table is a **flat, simple table** — there is no nesting, no hierarchy, and no sub-categories.

| Column       | Type         | Notes                          |
|--------------|--------------|-------------------------------|
| `id`         | `bigserial`  | Primary key (auto-increment)  |
| `name`       | `varchar(255)` | Required, unique              |
| `description`| `varchar(500)` | Optional                      |
| `isActive`   | `boolean`    | Default `true`                |
| `createdAt`  | `timestamp`  | Auto-set on creation          |
| `updatedAt`  | `timestamp`  | Auto-updated on change        |

### Relationships
- **`categories` → `products`**: One category has **many** products (via `products.categoryId` FK).
- The product table also has an `attributes: jsonb` column to store category-specific fields like color, size, lens index, etc.

> [!IMPORTANT]
> The category table only stores the **name** of the category (e.g., "Frame", "Lens"). The detailed sub-fields (e.g., "Frame Color", "Lens Vision") are NOT separate columns. They are stored in the `products.attributes` JSONB field — and right now, there is NO validation to enforce which keys must be in `attributes` for each category.

---

## 2. BACKEND LAYER

### Validator
**File:** [`backend/src/validators/catalog.validator.ts`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/backend/src/validators/catalog.validator.ts)

```ts
// Only validates that 'name' is present. Nothing else.
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(255),
  }),
});
```

> [!WARNING]
> The validator is **extremely minimal**. It only checks `name`. Fields like `description` and `isActive` pass through without validation.

---

### Service
**File:** [`backend/src/services/category.service.ts`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/backend/src/services/category.service.ts)

Standard CRUD operations:

| Method     | Action                              |
|------------|-------------------------------------|
| `getAll()` | `SELECT * FROM categories`          |
| `getById(id)` | `SELECT * WHERE id = ?`          |
| `create(data)` | `INSERT INTO categories ...`    |
| `update(id, data)` | `UPDATE categories SET ...` |
| `delete(id)` | `DELETE FROM categories WHERE id = ?` (hard delete) |

> [!CAUTION]
> The `delete` is a **hard delete**. If a category has products linked to it, the DB will reject the delete due to the FK constraint — but the service has no pre-check. It will throw a raw DB error that is not user-friendly.

---

### Controller
**File:** [`backend/src/controllers/category.controller.ts`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/backend/src/controllers/category.controller.ts)

A thin wrapper that calls the service and returns `{ success: true, data: result }`.

---

### API Routes
**File:** [`backend/src/routes/category.routes.ts`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/backend/src/routes/category.routes.ts)

| Method   | Endpoint          | Auth         | Role Required             |
|----------|-------------------|--------------|---------------------------|
| `GET`    | `/categories`     | ✅ Required  | Any logged-in user        |
| `GET`    | `/categories/:id` | ✅ Required  | Any logged-in user        |
| `POST`   | `/categories`     | ✅ Required  | `ADMIN` or `OPTOMETRIST`  |
| `PUT`    | `/categories/:id` | ✅ Required  | `ADMIN` or `OPTOMETRIST`  |
| `DELETE` | `/categories/:id` | ✅ Required  | `ADMIN` or `OPTOMETRIST`  |

---

## 3. FRONTEND LAYER

### API Client (Service)
**File:** [`frontend/src/services/category.service.ts`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/frontend/src/services/category.service.ts)

```ts
export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Methods: `getCategories()`, `getCategory(id)`, `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`.

---

### Pages (Next.js App Router)

| Route                   | Page File                  | Purpose                      |
|-------------------------|----------------------------|------------------------------|
| `/categories`           | `categories/page.tsx`      | List all categories          |
| `/categories/new`       | `categories/new/page.tsx`  | Create a new category        |
| `/categories/[id]`      | `categories/[id]/page.tsx` | Edit an existing category    |

---

### UI Components

#### `CategoryTable.tsx`
**File:** [`frontend/src/components/categories/CategoryTable.tsx`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/frontend/src/components/categories/CategoryTable.tsx)

- Built with **TanStack Table** (sorting, filtering, pagination).
- Columns displayed: **Category Name**, **Description**, **Status** (Active/Inactive badge), **Actions** (Edit, Delete).
- Search: Global filter input (searches all columns).
- Pagination: Previous/Next buttons.
- Role guard: Edit is visible to `ADMIN` + `CASHIER`. Delete is visible to `ADMIN` only.
- Delete shows a **confirmation dialog** before deleting.

#### `CategoryForm.tsx`
**File:** [`frontend/src/components/categories/CategoryForm.tsx`](file:///home/abdul-razack-a/Personal/Freelance/billing-optics/frontend/src/components/categories/CategoryForm.tsx)

- Uses **react-hook-form** + **Zod** for validation.
- Fields:
  - `name` (Required text input)
  - `description` (Optional textarea, 4 rows)
  - `isActive` (Toggle switch)
- Handles both **Create** and **Edit** modes.
- On success, redirects to `/categories`.

---

## 4. WHAT'S MISSING (GAP ANALYSIS vs. opticalcrm.com)

Comparing the current system to what the reference site (`india.opticalcrm.com`) has:

| Feature | Our System | opticalcrm.com |
|---|---|---|
| Category types (Frame, Lens, etc.) | ❌ Just a plain name field | ✅ Pre-defined typed categories |
| Category-specific attributes | ❌ Not enforced at all | ✅ Each category has unique sub-fields |
| Attribute validation per category | ❌ No validation | ✅ Each category enforces its own fields |
| Sub-menu structure for products | ❌ Flat list | ✅ Product form changes based on category |

### The 7 Categories We Need to Support

```json
{
  "Frame": ["Frame Color", "Frame Size", "Frame Type", "Frame Gender", "Frame Shape", "Frame Material", "Frame Temple Detail", "Frame Bridge Size"],
  "Sunglasses": ["Sunglasses Color", "Sunglasses Size", "Sunglasses Type", "Sunglasses Gender", "Sunglasses Shape", "Sunglasses Material", "Sunglasses Temple Detail", "Sunglasses Bridge Size"],
  "Lens": ["Lens Color", "Lens Material", "Lens Vision", "Lens Coating", "Lens Design", "Lens Index", "Lens Number", "Lens Addition", "Lens Axis", "Lens Number Range"],
  "Contact Lens": ["Contact Lens Number", "Contact Lens CT", "Contact Lens Addition", "Contact Lens Axis", "Contact Lens Color", "Contact Lens Type", "Contact Lens Base Curves", "Contact Lens Diameter", "Contact Lens Material", "Contact Lens Modality", "Contact Lens Validity in Days", "Contact Lens WC", "Contact Lens Dk/t", "Contact Lens Power Type"],
  "Solution": ["Solution Product Name", "Solution Variants", "Solution Packing Type", "Solution Color"],
  "Other": ["Other Product Name", "Other Type", "Other Color", "Other Shape", "Other Size"],
  "Non-Chargeable": ["Non Chargeable Product Name", "Non Chargeable Type", "Non Chargeable Color", "Non Chargeable Size", "Non Chargeable Material", "Packages"]
}
```

---

## 5. RECOMMENDED NEXT STEPS

1. **Seed the 7 categories** into the DB on startup (with a seed script).
2. **Create an `attributeSchema` config file** in the frontend that maps each category name to its required fields.
3. **Update `CategoryForm`** to prevent deletion of these 7 core categories.
4. **Update the Product creation form** to dynamically render category-specific attribute fields when a category is selected.
5. **Update the backend validator** to validate `attributes` based on which `categoryId` is submitted.
