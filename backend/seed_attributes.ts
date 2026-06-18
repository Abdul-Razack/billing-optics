import { pool } from './src/config/db';

const sql = `
INSERT INTO "categories" (name, description, is_active) VALUES
('Frames', 'Optical frames and eyewear', true),
('Lenses', 'Ophthalmic lenses', true),
('Contact Lenses', 'Contact lenses and supplies', true),
('Sunglasses', 'Prescription and non-prescription sunglasses', true)
ON CONFLICT (name) DO NOTHING;

-- Get the ID for 'Frames'
DO $$ 
DECLARE frame_id bigint;
BEGIN
    SELECT id INTO frame_id FROM categories WHERE name = 'Frames' LIMIT 1;
    
    IF frame_id IS NOT NULL THEN
        -- Insert attributes for Frames
        INSERT INTO product_attribute_definitions (category_id, name, label, input_type, is_required, display_order)
        VALUES 
        (frame_id, 'frameColor', 'Frame Color', 'SELECT', true, 1),
        (frame_id, 'frameShape', 'Frame Shape', 'SELECT', true, 2),
        (frame_id, 'frameMaterial', 'Frame Material', 'SELECT', false, 3),
        (frame_id, 'frameSize', 'Frame Size', 'TEXT', false, 4)
        ON CONFLICT DO NOTHING;

        -- We need to safely insert options without unique conflict issues, simple way is just to insert if they don't exist
        -- But for now this is just a quick seed script. We will leave options empty so user can add them.
    END IF;
END $$;
`;

async function run() {
  try {
    console.log("Seeding categories and attributes...");
    await pool.query(sql);
    console.log("Seed successful!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await pool.end();
  }
}

run();
