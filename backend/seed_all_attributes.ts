import { pool } from './src/config/db';

const sql = `
-- Ensure we have all Categories
INSERT INTO "categories" (name, description, is_active) VALUES
('Frame', 'Optical frames', true),
('Sunglasses', 'Sunglasses', true),
('Lens', 'Ophthalmic lenses', true),
('Contact Lens', 'Contact lenses and supplies', true),
('Solution', 'Cleaning and soaking solutions', true),
('Other', 'Other accessories', true),
('Non-Chargeable', 'Promotional items and packaging', true)
ON CONFLICT (name) DO NOTHING;

DO $$ 
DECLARE
    cat_id bigint;
BEGIN
    -- 1. FRAME ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Frame' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'frameBrand', 'Brand', 'SELECT', 1),
        (cat_id, 'frameModel', 'Model', 'TEXT', 2),
        (cat_id, 'frameColor', 'Color', 'SELECT', 3),
        (cat_id, 'frameShape', 'Shape', 'SELECT', 4),
        (cat_id, 'frameMaterial', 'Material', 'SELECT', 5),
        (cat_id, 'frameType', 'Frame Type (Rim)', 'SELECT', 6),
        (cat_id, 'frameSize', 'Size', 'TEXT', 7),
        (cat_id, 'frameGender', 'Gender', 'SELECT', 8)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 2. SUNGLASSES ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Sunglasses' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'sgBrand', 'Brand', 'SELECT', 1),
        (cat_id, 'sgModel', 'Model', 'TEXT', 2),
        (cat_id, 'sgFrameColor', 'Frame Color', 'SELECT', 3),
        (cat_id, 'sgLensColor', 'Lens Color', 'SELECT', 4),
        (cat_id, 'sgShape', 'Shape', 'SELECT', 5),
        (cat_id, 'sgMaterial', 'Material', 'SELECT', 6),
        (cat_id, 'sgType', 'Lens Type (e.g. Polarized)', 'SELECT', 7),
        (cat_id, 'sgGender', 'Gender', 'SELECT', 8)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. LENS ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Lens' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'lensMaterial', 'Lens Material', 'SELECT', 1),
        (cat_id, 'lensDesign', 'Lens Design', 'SELECT', 2),
        (cat_id, 'lensIndex', 'Lens Index', 'SELECT', 3),
        (cat_id, 'lensCoating', 'Lens Coating', 'SELECT', 4),
        (cat_id, 'lensColor', 'Lens Color/Tint', 'SELECT', 5),
        (cat_id, 'lensVision', 'Lens Vision', 'SELECT', 6),
        (cat_id, 'lensNumberRange', 'Lens Number Range', 'TEXT', 7)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. CONTACT LENS ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Contact Lens' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'clNumber', 'Contact Lens Number', 'TEXT', 1),
        (cat_id, 'clCt', 'Contact Lens CT', 'TEXT', 2),
        (cat_id, 'clAddition', 'Contact Lens Addition', 'SELECT', 3),
        (cat_id, 'clAxis', 'Contact Lens Axis', 'SELECT', 4),
        (cat_id, 'clColor', 'Contact Lens Color', 'SELECT', 5),
        (cat_id, 'clType', 'Contact Lens Type', 'SELECT', 6),
        (cat_id, 'clBc', 'Contact Lens Base Curves', 'SELECT', 7),
        (cat_id, 'clDia', 'Contact Lens Diameter', 'SELECT', 8),
        (cat_id, 'clMaterial', 'Contact Lens Material', 'SELECT', 9),
        (cat_id, 'clModality', 'Contact Lens Modality', 'SELECT', 10),
        (cat_id, 'clValidityDays', 'Contact Lens Validity in Days', 'NUMBER', 11),
        (cat_id, 'clWc', 'Contact Lens WC', 'SELECT', 12),
        (cat_id, 'clPermeability', 'Contact Lens Dk/t', 'TEXT', 13),
        (cat_id, 'clPowerType', 'Contact Lens Power Type', 'SELECT', 14)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. SOLUTION ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Solution' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'solVariants', 'Solution Variants', 'SELECT', 1),
        (cat_id, 'solPackingType', 'Solution Packing Type', 'SELECT', 2),
        (cat_id, 'solColor', 'Solution Color', 'SELECT', 3)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. OTHER ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Other' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'otherType', 'Other Type', 'SELECT', 1),
        (cat_id, 'otherColor', 'Other Color', 'SELECT', 2),
        (cat_id, 'otherShape', 'Other Shape', 'SELECT', 3),
        (cat_id, 'otherSize', 'Other Size', 'SELECT', 4)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 7. NON-CHARGEABLE ATTRIBUTES
    SELECT id INTO cat_id FROM categories WHERE name = 'Non-Chargeable' LIMIT 1;
    IF cat_id IS NOT NULL THEN
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, display_order) VALUES 
        (cat_id, 'ncType', 'Non Chargeable Type', 'SELECT', 1),
        (cat_id, 'ncColor', 'Non Chargeable Color', 'SELECT', 2),
        (cat_id, 'ncSize', 'Non Chargeable Size', 'SELECT', 3),
        (cat_id, 'ncMaterial', 'Non Chargeable Material', 'SELECT', 4),
        (cat_id, 'ncPackages', 'Packages', 'SELECT', 5)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
`;

async function run() {
  try {
    console.log("Seeding deep optical attributes for all categories...");
    await pool.query(sql);
    console.log("Seed successful!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await pool.end();
  }
}

run();
