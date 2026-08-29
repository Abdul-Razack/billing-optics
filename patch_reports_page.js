const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'frontend/src/app/(dashboard)/reports/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
  'import { CustomersTab } from "@/components/reports/tabs/CustomersTab";',
  'import { CustomersTab } from "@/components/reports/tabs/CustomersTab";\\nimport { CategoriesTab } from "@/components/reports/tabs/CategoriesTab";'
);

content = content.replace(
  '<TabsTrigger value="customers" className="data-[state=active]:bg-background px-6">Customers</TabsTrigger>',
  '<TabsTrigger value="customers" className="data-[state=active]:bg-background px-6">Customers</TabsTrigger>\\n            <TabsTrigger value="categories" className="data-[state=active]:bg-background px-6">Categories</TabsTrigger>'
);

content = content.replace(
  '</TabsContent>\\n        </Tabs>',
  '</TabsContent>\\n\\n          <TabsContent value="categories" className="space-y-6">\\n            <CategoriesTab />\\n          </TabsContent>\\n        </Tabs>'
);

fs.writeFileSync(pagePath, content);
