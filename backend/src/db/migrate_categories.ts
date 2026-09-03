import { pool } from '../config/db';

interface CategoryConfig {
  name: string;
  description: string;
  legacyNames?: string[];
  attributes: {
    name: string;
    label: string;
    inputType: 'SELECT' | 'TEXT' | 'NUMBER' | 'BOOLEAN';
    displayOrder: number;
    isRequired?: boolean;
    options?: string[];
  }[];
}

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    name: 'Frame',
    description: 'Optical frames and spectacle eyeglasses',
    legacyNames: ['Frames', 'Frame Color', 'Product 2026', 'Omni Category', 'Omni Category 1782191730202', 'Omni Category 1782191898692', 'E2E Category 1782188108173', 'E2E Category 1782188139599'],
    attributes: [
      {
        name: 'frameBrand',
        label: 'Brand',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Ray-Ban', 'Oakley', 'Gucci', 'Vogue', 'Armani Exchange', 'Titan', 'Fastrack', 'Vincent Chase', 'John Jacobs', 'Carrera', 'Police'],
      },
      {
        name: 'frameModel',
        label: 'Model / Name',
        inputType: 'TEXT',
        displayOrder: 2,
      },
      {
        name: 'frameGender',
        label: 'Gender',
        inputType: 'SELECT',
        displayOrder: 3,
        options: ['Unisex', 'Male', 'Female', 'Kids'],
      },
      {
        name: 'frameColor',
        label: 'Color',
        inputType: 'SELECT',
        displayOrder: 4,
        options: ['Black', 'Gold', 'Silver', 'Gunmetal', 'Brown', 'Blue', 'Tortoise', 'Transparent', 'Rose Gold', 'Matte Black', 'Burgundy'],
      },
      {
        name: 'frameType',
        label: 'Frame Type (Rim)',
        inputType: 'SELECT',
        displayOrder: 5,
        options: ['Full Rim', 'Half Rim', 'Rimless', 'Supra'],
      },
      {
        name: 'frameShape',
        label: 'Shape',
        inputType: 'SELECT',
        displayOrder: 6,
        options: ['Rectangular', 'Round', 'Square', 'Aviator', 'Wayfarer', 'Cat Eye', 'Oval', 'Geometric', 'Clubmaster', 'Hexagonal'],
      },
      {
        name: 'frameMaterial',
        label: 'Material',
        inputType: 'SELECT',
        displayOrder: 7,
        options: ['Acetate', 'Metal', 'Titanium', 'TR90', 'Stainless Steel', 'Carbon Fiber', 'Ultem', 'Alloy'],
      },
      {
        name: 'frameSize',
        label: 'Frame Size',
        inputType: 'TEXT',
        displayOrder: 8,
      },
      {
        name: 'bridgeSize',
        label: 'Bridge Size (mm)',
        inputType: 'TEXT',
        displayOrder: 9,
      },
      {
        name: 'templeDetail',
        label: 'Temple Detail (mm)',
        inputType: 'TEXT',
        displayOrder: 10,
      },
      {
        name: 'frameQuality',
        label: 'Quality Grade',
        inputType: 'SELECT',
        displayOrder: 11,
        options: ['A+', 'A', 'B', 'Economy'],
      },
    ],
  },
  {
    name: 'Sunglasses',
    description: 'Fashion and prescription sunglasses',
    legacyNames: [],
    attributes: [
      {
        name: 'sgBrand',
        label: 'Brand',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Ray-Ban', 'Oakley', 'Gucci', 'Vogue', 'Polaroid', 'Carrera', 'Maui Jim', 'Fastrack', 'IDEAL'],
      },
      {
        name: 'sgModel',
        label: 'Model / Name',
        inputType: 'TEXT',
        displayOrder: 2,
      },
      {
        name: 'sgGender',
        label: 'Gender',
        inputType: 'SELECT',
        displayOrder: 3,
        options: ['Unisex', 'Male', 'Female', 'Kids'],
      },
      {
        name: 'sgFrameColor',
        label: 'Frame Color',
        inputType: 'SELECT',
        displayOrder: 4,
        options: ['Black', 'Gold', 'Silver', 'Gunmetal', 'Brown', 'Tortoise', 'Matte Black', 'Rose Gold'],
      },
      {
        name: 'sgLensColor',
        label: 'Lens Color',
        inputType: 'SELECT',
        displayOrder: 5,
        options: ['Green (G-15)', 'Grey', 'Brown', 'Blue', 'Black', 'Gradient Grey', 'Gradient Brown', 'Mirrored Blue', 'Mirrored Silver'],
      },
      {
        name: 'sgType',
        label: 'Lens Type',
        inputType: 'SELECT',
        displayOrder: 6,
        options: ['Polarized', 'UV 400 Protected', 'Gradient', 'Mirrored', 'Photochromic'],
      },
      {
        name: 'sgShape',
        label: 'Shape',
        inputType: 'SELECT',
        displayOrder: 7,
        options: ['Aviator', 'Wayfarer', 'Round', 'Square', 'Cat Eye', 'Oval', 'Sport / Wrap', 'Clubmaster'],
      },
      {
        name: 'sgMaterial',
        label: 'Material',
        inputType: 'SELECT',
        displayOrder: 8,
        options: ['Metal', 'Acetate', 'Polycarbonate', 'TR90', 'Titanium'],
      },
    ],
  },
  {
    name: 'Lens',
    description: 'Ophthalmic prescription spectacle lenses',
    legacyNames: ['Lenses'],
    attributes: [
      {
        name: 'lensBrand',
        label: 'Brand / Manufacturer',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Essilor', 'Zeiss', 'Crizal', 'Hoya', 'Rodenstock', 'Kodak', 'Prime', 'Local Lab'],
      },
      {
        name: 'lensDesign',
        label: 'Lens Design',
        inputType: 'SELECT',
        displayOrder: 2,
        options: ['Single Vision', 'Bifocal (Kryptok)', 'Bifocal (D-Segment)', 'Progressive Standard', 'Progressive Digital', 'Trifocal', 'Computer / Office'],
      },
      {
        name: 'lensIndex',
        label: 'Index (Refractive Index)',
        inputType: 'SELECT',
        displayOrder: 3,
        options: ['1.50 (Standard)', '1.56 (Mid-Index)', '1.60 (Thin)', '1.67 (Ultra-Thin)', '1.74 (Super Ultra-Thin)'],
      },
      {
        name: 'lensMaterial',
        label: 'Material',
        inputType: 'SELECT',
        displayOrder: 4,
        options: ['CR-39 (Plastic)', 'Polycarbonate', 'Trivex', 'Mineral Glass', 'Hi-Index Resin'],
      },
      {
        name: 'lensCoating',
        label: 'Coating',
        inputType: 'SELECT',
        displayOrder: 5,
        options: ['Hard Coat (HC)', 'Hard Multi-Coat (HMC)', 'Anti-Reflective (ARC)', 'Blue Cut / Blue Light Filter', 'Photochromic (Grey)', 'Photochromic (Brown)', 'Drive Safe'],
      },
      {
        name: 'lensVision',
        label: 'Vision Type',
        inputType: 'SELECT',
        displayOrder: 6,
        options: ['Distance Wear', 'Reading Wear', 'Constant Wear'],
      },
      {
        name: 'lensNumberRange',
        label: 'Power Range Description',
        inputType: 'TEXT',
        displayOrder: 7,
      },
    ],
  },
  {
    name: 'Contact Lens',
    description: 'Contact lenses, toric, and cosmetic colored lenses',
    legacyNames: ['Contact Lenses'],
    attributes: [
      {
        name: 'clBrand',
        label: 'Brand',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Acuvue (Johnson & Johnson)', 'Bausch + Lomb', 'CooperVision', 'Alcon', 'FreshLook', 'Air Optix', 'Biofinity'],
      },
      {
        name: 'clModality',
        label: 'Modality (Replacement Cycle)',
        inputType: 'SELECT',
        displayOrder: 2,
        options: ['Daily Disposable', 'Bi-Weekly', 'Monthly Disposable', 'Yearly Conventional'],
      },
      {
        name: 'clType',
        label: 'Lens Type',
        inputType: 'SELECT',
        displayOrder: 3,
        options: ['Spherical', 'Toric (for Astigmatism)', 'Multifocal (Presbyopia)', 'Cosmetic Color'],
      },
      {
        name: 'clMaterial',
        label: 'Material',
        inputType: 'SELECT',
        displayOrder: 4,
        options: ['Silicone Hydrogel', 'Hydrogel', 'Gas Permeable (RGP)'],
      },
      {
        name: 'clColor',
        label: 'Color / Tint',
        inputType: 'SELECT',
        displayOrder: 5,
        options: ['Clear', 'Pure Hazel', 'True Sapphire', 'Grey', 'Green', 'Brown', 'Amethyst', 'Turquoise', 'Honey'],
      },
      {
        name: 'clBc',
        label: 'Base Curve (BC mm)',
        inputType: 'SELECT',
        displayOrder: 6,
        options: ['8.4', '8.5', '8.6', '8.7', '8.8'],
      },
      {
        name: 'clDia',
        label: 'Diameter (DIA mm)',
        inputType: 'SELECT',
        displayOrder: 7,
        options: ['14.0', '14.2', '14.5'],
      },
      {
        name: 'clWc',
        label: 'Water Content (%)',
        inputType: 'SELECT',
        displayOrder: 8,
        options: ['33%', '38%', '48%', '55%', '58%', '69%'],
      },
      {
        name: 'clValidityDays',
        label: 'Validity in Days',
        inputType: 'NUMBER',
        displayOrder: 9,
      },
      {
        name: 'piecesPerBox',
        label: 'Pieces Per Box',
        inputType: 'NUMBER',
        displayOrder: 10,
      },
    ],
  },
  {
    name: 'Solution',
    description: 'Contact lens and eyeglass cleaning solutions',
    legacyNames: ['Solutions'],
    attributes: [
      {
        name: 'solBrand',
        label: 'Brand',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Renu (Bausch + Lomb)', 'Opti-Free (Alcon)', 'BioTrue', 'Complete', 'Solo Care', 'Lens Clean Spray'],
      },
      {
        name: 'solVariants',
        label: 'Solution Variant',
        inputType: 'SELECT',
        displayOrder: 2,
        options: ['Multi-Purpose Solution', 'Saline Solution', 'Hydrogen Peroxide', 'Rewetting Drops', 'Eyeglass Cleaning Spray'],
      },
      {
        name: 'solPackingType',
        label: 'Volume / Pack Size',
        inputType: 'SELECT',
        displayOrder: 3,
        options: ['60 ml (Travel)', '100 ml', '120 ml', '300 ml', '355 ml', '360 ml', '500 ml'],
      },
    ],
  },
  {
    name: 'Other',
    description: 'Optical accessories, cases, cloths, and spare parts',
    legacyNames: ['Accessories'],
    attributes: [
      {
        name: 'otherType',
        label: 'Accessory Type',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Hard Case', 'Soft Pouch', 'Microfiber Cloth', 'Lens Cleaning Spray Kit', 'Spectacle Cord / Chain', 'Nose Pads (Pair)', 'Screws & Screwdriver', 'Contact Lens Travel Case'],
      },
      {
        name: 'otherColor',
        label: 'Color',
        inputType: 'TEXT',
        displayOrder: 2,
      },
      {
        name: 'otherMaterial',
        label: 'Material',
        inputType: 'TEXT',
        displayOrder: 3,
      },
    ],
  },
  {
    name: 'Non-Chargeable',
    description: 'Promotional giveaways, sample kits, and packaging materials',
    legacyNames: ['Non Chargeable'],
    attributes: [
      {
        name: 'ncType',
        label: 'Item Type',
        inputType: 'SELECT',
        displayOrder: 1,
        options: ['Complimentary Cloth', 'Branded Carry Bag', 'Sample Contact Lens', 'Complimentary Pouch', 'Lens Cleaner Sachet'],
      },
      {
        name: 'ncPackages',
        label: 'Packaging Bundle',
        inputType: 'SELECT',
        displayOrder: 2,
        options: ['Standard Freebie', 'Premium Purchase Gift', 'Loyalty Reward'],
      },
    ],
  },
];

export async function runCategoryMigration() {
  const client = await pool.connect();
  try {
    console.log('=== Starting Standard Category Migration & Wiring ===\n');
    await client.query('BEGIN');

    const categoryIdMap = new Map<string, number>();

    // 1. Provision or update the 7 default categories
    for (const cat of DEFAULT_CATEGORIES) {
      // Check if exists
      const res = await client.query('SELECT id, name FROM categories WHERE name = $1 LIMIT 1;', [cat.name]);
      let catId: number;

      if (res.rows.length === 0) {
        // Insert new category
        const insertRes = await client.query(
          `INSERT INTO categories (name, description, is_active, created_at, updated_at)
           VALUES ($1, $2, true, NOW(), NOW())
           RETURNING id;`,
          [cat.name, cat.description]
        );
        catId = Number(insertRes.rows[0].id);
        console.log(`[+] Created canonical category: "${cat.name}" (ID: ${catId})`);
      } else {
        catId = Number(res.rows[0].id);
        await client.query(
          `UPDATE categories SET description = $1, is_active = true, updated_at = NOW() WHERE id = $2;`,
          [cat.description, catId]
        );
        console.log(`[*] Verified canonical category: "${cat.name}" (ID: ${catId})`);
      }
      categoryIdMap.set(cat.name, catId);

      // 2. Remap legacy categories if any
      if (cat.legacyNames && cat.legacyNames.length > 0) {
        for (const legacyName of cat.legacyNames) {
          const legacyRes = await client.query('SELECT id FROM categories WHERE name = $1 AND id != $2;', [legacyName, catId]);
          for (const row of legacyRes.rows) {
            const oldId = Number(row.id);
            // Remap products
            const productUpdate = await client.query('UPDATE products SET category_id = $1 WHERE category_id = $2;', [catId, oldId]);
            if (productUpdate.rowCount && productUpdate.rowCount > 0) {
              console.log(`  -> Remapped ${productUpdate.rowCount} product(s) from legacy "${legacyName}" (ID: ${oldId}) to "${cat.name}" (ID: ${catId})`);
            }
            // Remap attribute definitions
            await client.query('UPDATE product_attribute_definitions SET category_id = $1 WHERE category_id = $2;', [catId, oldId]);
            // Delete legacy category
            await client.query('DELETE FROM categories WHERE id = $1;', [oldId]);
            console.log(`  -> Removed obsolete legacy category "${legacyName}" (ID: ${oldId})`);
          }
        }
      }

      // 3. Upsert attribute definitions and options for this category
      for (const attr of cat.attributes) {
        let attrId: number;
        const attrRes = await client.query(
          `SELECT id FROM product_attribute_definitions WHERE category_id = $1 AND name = $2 LIMIT 1;`,
          [catId, attr.name]
        );

        if (attrRes.rows.length === 0) {
          const newAttrRes = await client.query(
            `INSERT INTO product_attribute_definitions (category_id, name, label, input_type, is_required, display_order, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING id;`,
            [catId, attr.name, attr.label, attr.inputType, attr.isRequired ?? false, attr.displayOrder]
          );
          attrId = Number(newAttrRes.rows[0].id);
        } else {
          attrId = Number(attrRes.rows[0].id);
          await client.query(
            `UPDATE product_attribute_definitions 
             SET label = $1, input_type = $2, is_required = $3, display_order = $4, updated_at = NOW()
             WHERE id = $5;`,
            [attr.label, attr.inputType, attr.isRequired ?? false, attr.displayOrder, attrId]
          );
        }

        // Insert standard options if SELECT type
        if (attr.inputType === 'SELECT' && attr.options) {
          for (const optVal of attr.options) {
            const optRes = await client.query(
              `SELECT id FROM product_attribute_options WHERE attribute_definition_id = $1 AND value = $2 LIMIT 1;`,
              [attrId, optVal]
            );
            if (optRes.rows.length === 0) {
              await client.query(
                `INSERT INTO product_attribute_options (attribute_definition_id, value, is_active, created_at)
                 VALUES ($1, $2, true, NOW());`,
                [attrId, optVal]
              );
            }
          }
        }
      }
    }

    // 4. Clean up any remaining obsolete test categories without products
    const remainingOrphanCategories = await client.query(`
      SELECT c.id, c.name FROM categories c
      WHERE c.name NOT IN ('Frame', 'Sunglasses', 'Lens', 'Contact Lens', 'Solution', 'Other', 'Non-Chargeable')
      AND NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id);
    `);

    for (const orphan of remainingOrphanCategories.rows) {
      await client.query('DELETE FROM product_attribute_definitions WHERE category_id = $1;', [orphan.id]);
      await client.query('DELETE FROM categories WHERE id = $1;', [orphan.id]);
      console.log(`[x] Cleaned up unused test category: "${orphan.name}" (ID: ${orphan.id})`);
    }

    // 5. Align existing product types with category names
    await client.query(`
      UPDATE products 
      SET product_type = 'FRAME' 
      WHERE category_id IN (SELECT id FROM categories WHERE name = 'Frame') AND (product_type IS NULL OR product_type = 'OTHER');
    `);
    await client.query(`
      UPDATE products 
      SET product_type = 'SUNGLASSES' 
      WHERE category_id IN (SELECT id FROM categories WHERE name = 'Sunglasses') AND (product_type IS NULL OR product_type = 'OTHER');
    `);
    await client.query(`
      UPDATE products 
      SET product_type = 'LENS' 
      WHERE category_id IN (SELECT id FROM categories WHERE name = 'Lens') AND (product_type IS NULL OR product_type = 'OTHER');
    `);
    await client.query(`
      UPDATE products 
      SET product_type = 'CONTACT_LENS' 
      WHERE category_id IN (SELECT id FROM categories WHERE name = 'Contact Lens') AND (product_type IS NULL OR product_type = 'OTHER');
    `);
    await client.query(`
      UPDATE products 
      SET product_type = 'SOLUTION' 
      WHERE category_id IN (SELECT id FROM categories WHERE name = 'Solution') AND (product_type IS NULL OR product_type = 'OTHER');
    `);
    await client.query(`
      UPDATE products 
      SET product_type = 'NON_CHARGEABLE' 
      WHERE category_id IN (SELECT id FROM categories WHERE name = 'Non-Chargeable') AND (product_type IS NULL OR product_type = 'OTHER');
    `);

    await client.query('COMMIT');
    console.log('\n=== Category Migration & Wiring Successfully Completed! ===\n');

    // Display summary
    const finalCats = await client.query(`
      SELECT c.id, c.name, count(p.id) as product_count, count(distinct pad.id) as attr_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN product_attribute_definitions pad ON c.id = pad.category_id
      GROUP BY c.id, c.name
      ORDER BY c.id;
    `);
    console.log('Final Active Categories:');
    console.table(finalCats.rows);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back changes:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runCategoryMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
