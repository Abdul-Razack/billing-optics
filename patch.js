const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/categories/CategoryForm.tsx', 'utf-8');

if (!code.includes('useEffect')) {
  code = code.replace(/import { useState } from "react";/, 'import { useState, useEffect } from "react";');
}

if (!code.includes('SelectContent')) {
  const selectImport = `\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";`;
  code = code.replace(/import { Input } from "@\/components\/ui\/input";/, 'import { Input } from "@/components/ui/input";' + selectImport);
}

if (!code.includes('parentId: z.string().optional()')) {
  code = code.replace(/isActive: z.boolean(),/, 'isActive: z.boolean(),\n  parentId: z.string().optional(),');
}

fs.writeFileSync('frontend/src/components/categories/CategoryForm.tsx', code);
