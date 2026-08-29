const fs = require('fs');
const path = require('path');
const repoPath = path.join(__dirname, 'backend/src/repositories/report.repository.ts');
let content = fs.readFileSync(repoPath, 'utf8');

const categoryMethod = `
  static async getCategoryAnalytics(startDate?: Date, endDate?: Date) {
    // 1. Get all categories
    const allCategories = await db.select().from(categories);
    
    // 2. Aggregate sales per category
    const salesData = await db
      .select({
        categoryId: products.categoryId,
        revenue: sql<number>\`COALESCE(SUM(\${invoiceItems.lineTotal}), 0)\`.mapWith(Number),
        unitsSold: sql<number>\`COALESCE(SUM(\${invoiceItems.quantity}), 0)\`.mapWith(Number),
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .where(
        and(
          startDate ? sql\`\${invoices.createdAt} >= \${startDate}\` : undefined,
          endDate ? sql\`\${invoices.createdAt} <= \${endDate}\` : undefined
        )
      )
      .groupBy(products.categoryId);

    // 3. Aggregate inventory per category
    const inventoryData = await db
      .select({
        categoryId: products.categoryId,
        stock: sql<number>\`COALESCE(SUM(\${inventoryLedger.quantityChange}), 0)\`.mapWith(Number),
        value: sql<number>\`COALESCE(SUM(\${inventoryLedger.quantityChange} * \${products.costPrice}), 0)\`.mapWith(Number),
        productCount: sql<number>\`COUNT(DISTINCT \${products.id})\`.mapWith(Number),
      })
      .from(products)
      .leftJoin(inventoryLedger, eq(products.id, inventoryLedger.productId))
      .where(
        and(
          startDate ? sql\`\${inventoryLedger.createdAt} >= \${startDate}\` : undefined,
          endDate ? sql\`\${inventoryLedger.createdAt} <= \${endDate}\` : undefined
        )
      )
      .groupBy(products.categoryId);

    // 4. Combine
    const salesMap = new Map();
    salesData.forEach(s => salesMap.set(s.categoryId, s));
    
    const inventoryMap = new Map();
    inventoryData.forEach(i => inventoryMap.set(i.categoryId, i));

    let totalCategories = allCategories.length;
    let activeCategories = allCategories.filter(c => c.isActive).length;
    let totalRevenue = 0;
    let totalInventoryValue = 0;
    let topCategory = { name: '-', revenue: 0 };

    const categoryBreakdown = allCategories.map(cat => {
      const sales = salesMap.get(cat.id) || { revenue: 0, unitsSold: 0 };
      const inv = inventoryMap.get(cat.id) || { stock: 0, value: 0, productCount: 0 };
      
      totalRevenue += sales.revenue;
      totalInventoryValue += inv.value;
      
      if (sales.revenue > topCategory.revenue) {
        topCategory = { name: cat.name, revenue: sales.revenue };
      }

      return {
        id: cat.id,
        name: cat.name,
        isActive: cat.isActive,
        productCount: inv.productCount,
        stock: inv.stock,
        inventoryValue: inv.value,
        revenue: sales.revenue,
        unitsSold: sales.unitsSold
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      kpis: {
        totalCategories,
        activeCategories,
        totalRevenue,
        totalInventoryValue,
        topCategory: topCategory.name,
        topCategoryRevenue: topCategory.revenue
      },
      categoryBreakdown
    };
  }
`;

content = content.replace("static async getDailyStatement(date: Date) {", categoryMethod + "\\n  static async getDailyStatement(date: Date) {");
fs.writeFileSync(repoPath, content);
