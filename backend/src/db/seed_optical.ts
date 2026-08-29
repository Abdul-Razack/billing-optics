import { db } from '../config/db';
import { 
  categories, 
  productAttributeDefinitions, 
  productAttributeOptions,
} from './schema';
import { eq, or, and, sql } from 'drizzle-orm';

async function seedOpticalCategories() {
  console.log('Starting optical categories seeding...');

  try {
    // 1. Seed standard categories
    console.log('Ensuring categories exist...');
    
    const catDefs = [
      { name: 'Frames', description: 'Spectacle frames and sunglasses' },
      { name: 'Lenses', description: 'Ophthalmic lenses' },
      { name: 'Contact Lenses', description: 'Contact lenses and kits' },
      { name: 'Sunglasses', description: 'Fashion and prescription sunglasses' },
      { name: 'Accessories', description: 'Solutions, cases, and accessories' },
    ];

    const categoryMap = new Map();

    for (const cat of catDefs) {
      let [existing] = await db.select().from(categories).where(eq(categories.name, cat.name));
      if (!existing) {
        [existing] = await db.insert(categories).values(cat).returning();
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category exists: ${cat.name}`);
      }
      categoryMap.set(cat.name, existing);
    }

    const frameId = categoryMap.get('Frames').id;
    const lensId = categoryMap.get('Lenses').id;
    const contactId = categoryMap.get('Contact Lenses').id;
    const sunglassId = categoryMap.get('Sunglasses').id;

    // 2. Define fields per category
    console.log('Seeding attribute definitions and options...');

    const defineAttribute = async (categoryId: number, name: string, label: string, type: 'TEXT'|'NUMBER'|'SELECT', order: number, options?: string[]) => {
      // Check if exists
      let [attr] = await db.select()
        .from(productAttributeDefinitions)
        .where(
           and(
             eq(productAttributeDefinitions.categoryId, categoryId),
             eq(productAttributeDefinitions.name, name)
           )
        );

      if (!attr) {
        [attr] = await db.insert(productAttributeDefinitions).values({
          categoryId,
          name,
          label,
          inputType: type,
          isRequired: false,
          displayOrder: order,
        }).returning();
        console.log(`  Added attribute ${label} for category ${categoryId}`);
      }

      if (options && options.length > 0 && type === 'SELECT') {
        for (const opt of options) {
          const [existingOpt] = await db.select()
            .from(productAttributeOptions)
            .where(
               and(
                 eq(productAttributeOptions.attributeDefinitionId, attr.id),
                 eq(productAttributeOptions.value, opt)
               )
            );
          if (!existingOpt) {
            await db.insert(productAttributeOptions).values({
              attributeDefinitionId: attr.id,
              value: opt,
            });
          }
        }
      }
    };

    // --- FRAMES & SUNGLASSES ---
    for (const catId of [frameId, sunglassId]) {
      let order = 10;
      await defineAttribute(catId, 'brand', 'Brand', 'TEXT', order++);
      await defineAttribute(catId, 'color', 'Color', 'TEXT', order++);
      await defineAttribute(catId, 'size', 'Frame Size', 'TEXT', order++);
      await defineAttribute(catId, 'frameType', 'Frame Type', 'SELECT', order++, ['Full Rim', 'Half Rim', 'Rimless']);
      await defineAttribute(catId, 'shape', 'Shape', 'SELECT', order++, ['Rectangle', 'Round', 'Square', 'Aviator', 'Cat Eye', 'Oval']);
      await defineAttribute(catId, 'material', 'Material', 'SELECT', order++, ['Metal', 'Acetate', 'TR90', 'Titanium']);
      await defineAttribute(catId, 'gender', 'Gender', 'SELECT', order++, ['Unisex', 'Male', 'Female', 'Kids']);
    }

    // --- LENSES ---
    let lOrder = 10;
    await defineAttribute(lensId, 'brand', 'Brand', 'TEXT', lOrder++);
    await defineAttribute(lensId, 'index', 'Index', 'SELECT', lOrder++, ['1.50', '1.56', '1.60', '1.67', '1.74']);
    await defineAttribute(lensId, 'material', 'Material', 'SELECT', lOrder++, ['CR39', 'Polycarbonate', 'Trivex', 'Glass']);
    await defineAttribute(lensId, 'coating', 'Coating', 'SELECT', lOrder++, ['HMC', 'ARC', 'Blue Cut', 'Photochromic']);
    await defineAttribute(lensId, 'design', 'Design', 'SELECT', lOrder++, ['Single Vision', 'Bifocal', 'Progressive']);

    // --- CONTACT LENSES ---
    let cOrder = 10;
    await defineAttribute(contactId, 'brand', 'Brand', 'TEXT', cOrder++);
    await defineAttribute(contactId, 'modality', 'Modality', 'SELECT', cOrder++, ['Daily', 'Weekly', 'Monthly', 'Yearly']);
    await defineAttribute(contactId, 'powerType', 'Power Type', 'SELECT', cOrder++, ['Spherical', 'Toric', 'Multifocal']);
    await defineAttribute(contactId, 'bc', 'Base Curve (BC)', 'TEXT', cOrder++);
    await defineAttribute(contactId, 'dia', 'Diameter (DIA)', 'TEXT', cOrder++);
    await defineAttribute(contactId, 'waterContent', 'Water Content (%)', 'NUMBER', cOrder++);
    await defineAttribute(contactId, 'piecesPerBox', 'Pieces Per Box', 'NUMBER', cOrder++);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding optical categories:', error);
    process.exit(1);
  }
}

seedOpticalCategories();
