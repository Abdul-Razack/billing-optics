const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.ts'));

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already refactored
  if (content.includes('export function create')) continue;

  const baseName = file.split('.')[0];
  const functionName = 'create' + baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'Routes';

  // 1. Handle system.routes.ts manually later, skip it
  if (file === 'system.routes.ts' || file === 'settings.routes.ts' || file === 'auth.routes.ts') {
      continue;
  }

  // Common pattern:
  // const router = Router();
  // ...
  // export default router;
  
  // Find where `const router = Router();` is.
  const routerIdx = content.indexOf('const router = Router();');
  if (routerIdx === -1) {
    console.log(`Skipping ${file} - no 'const router = Router();' found`);
    continue;
  }

  const exportIdx = content.lastIndexOf('export default router;');

  // Split into 3 parts:
  // Before `const router = Router();`
  // From `const router = Router();` to before `export default router;`
  // `export default router;` onwards

  let before = content.slice(0, routerIdx);
  let middle = content.slice(routerIdx, exportIdx);

  // We need to move the multer logic inside the function for customer and product
  if (file === 'customer.routes.ts' || file === 'product.routes.ts') {
    const multerIdx = before.indexOf('const storage = multer.diskStorage(');
    if (multerIdx !== -1) {
      const multerBlock = before.slice(multerIdx);
      before = before.slice(0, multerIdx);
      middle = multerBlock + '\n' + middle;
    }
  }

  const newMiddle = `export function ${functionName}() {\n  ${middle.trim().replace(/\n/g, '\n  ')}\n  return router;\n}\n`;

  const newContent = before.trim() + '\n\n' + newMiddle;
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Refactored ${file}`);
}
