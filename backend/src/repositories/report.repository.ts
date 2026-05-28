import { between, eq, sql, desc, and } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices, invoiceItems, payments, customers, products, inventoryLedger, categories } from '../db/schema';
import { startOfDay, endOfDay, format, startOfWeek, startOfMonth } from 'date-fns';

export class ReportRepository {
  static async getSalesAnalytics(startDate: Date, endDate: Date) {
    // KPI Data
    const [salesKpi] = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.mapWith(Number),
        revenue: sql<number>`COALESCE(SUM(${invoices.amountPaid}), 0)`.mapWith(Number),
        totalInvoices: sql<number>`COUNT(${invoices.id})`.mapWith(Number),
        paidInvoices: sql<number>`COUNT(CASE WHEN ${invoices.paymentStatus} = 'PAID' THEN 1 END)`.mapWith(Number),
        unpaidInvoices: sql<number>`COUNT(CASE WHEN ${invoices.paymentStatus} = 'UNPAID' THEN 1 END)`.mapWith(Number),
        partialInvoices: sql<number>`COUNT(CASE WHEN ${invoices.paymentStatus} = 'PARTIAL' THEN 1 END)`.mapWith(Number),
      })
      .from(invoices)
      .where(between(invoices.createdAt, startDate, endDate));

    const averageInvoiceValue = salesKpi.totalInvoices > 0 ? salesKpi.totalSales / salesKpi.totalInvoices : 0;

    // Top Customers
    const topCustomers = await db
      .select({
        id: customers.id,
        name: customers.fullName,
        orderCount: sql<number>`COUNT(${invoices.id})`.mapWith(Number),
        revenue: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.mapWith(Number),
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(between(invoices.createdAt, startDate, endDate))
      .groupBy(customers.id)
      .orderBy(desc(sql`revenue`))
      .limit(5);

    // Top Products
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        unitsSold: sql<number>`COALESCE(SUM(${invoiceItems.quantity}), 0)`.mapWith(Number),
        revenue: sql<number>`COALESCE(SUM(${invoiceItems.lineTotal}), 0)`.mapWith(Number),
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .where(between(invoices.createdAt, startDate, endDate))
      .groupBy(products.id)
      .orderBy(desc(sql`revenue`))
      .limit(5);

    return {
      kpis: {
        totalSales: salesKpi.totalSales,
        revenue: salesKpi.revenue,
        totalInvoices: salesKpi.totalInvoices,
        paidInvoices: salesKpi.paidInvoices,
        unpaidInvoices: salesKpi.unpaidInvoices,
        partialInvoices: salesKpi.partialInvoices,
        averageInvoiceValue,
      },
      topCustomers,
      topProducts,
    };
  }

  static async getRevenueTrend(startDate: Date, endDate: Date, groupBy: 'daily' | 'weekly' | 'monthly') {
    // Use Postgres date_trunc for group by
    let dateTruncUnit = 'day';
    if (groupBy === 'weekly') dateTruncUnit = 'week';
    if (groupBy === 'monthly') dateTruncUnit = 'month';

    const trends = await db
      .select({
        period: sql<string>`date_trunc(${dateTruncUnit}, ${invoices.createdAt})`,
        sales: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.mapWith(Number),
      })
      .from(invoices)
      .where(between(invoices.createdAt, startDate, endDate))
      .groupBy(sql`date_trunc(${dateTruncUnit}, ${invoices.createdAt})`)
      .orderBy(sql`date_trunc(${dateTruncUnit}, ${invoices.createdAt})`);

    // Format labels depending on groupBy
    return trends.map((t) => {
      const d = new Date(t.period);
      let label = format(d, "MMM dd");
      if (groupBy === 'weekly') {
        label = `Week of ${format(d, "MMM dd")}`;
      } else if (groupBy === 'monthly') {
        label = format(d, "MMM yyyy");
      }
      return {
        label,
        sales: t.sales,
      };
    });
  }

  static async getPaymentTotalsByMethod(startDate: Date, endDate: Date) {
    return await db
      .select({
        paymentMethod: payments.paymentMethod,
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(between(payments.createdAt, startDate, endDate))
      .groupBy(payments.paymentMethod);
  }

  static async getProductsBelowStockThreshold() {
    // Return products where total stock <= minStockAlert
    return await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        stock: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.mapWith(Number),
        minStockAlert: products.minStockAlert,
      })
      .from(products)
      .leftJoin(inventoryLedger, eq(products.id, inventoryLedger.productId))
      .groupBy(products.id, products.name, products.sku, products.minStockAlert)
      .having(sql`COALESCE(SUM(${inventoryLedger.quantityChange}), 0) <= ${products.minStockAlert}`);
  }

  static async getInventoryAnalytics(categoryId?: number, stockStatus?: string, startDate?: Date, endDate?: Date) {
    // Base stock aggregation CTE
    const productStock = db
      .select({
        productId: inventoryLedger.productId,
        totalStock: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.as('total_stock')
      })
      .from(inventoryLedger)
      .where(
        and(
          startDate ? sql`${inventoryLedger.createdAt} >= ${startDate}` : undefined,
          endDate ? sql`${inventoryLedger.createdAt} <= ${endDate}` : undefined
        )
      )
      .groupBy(inventoryLedger.productId)
      .as('product_stock');

    // Main query joining products with the stock CTE
    let query = db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        categoryName: categories.name,
        costPrice: products.costPrice,
        minStockAlert: products.minStockAlert,
        stock: sql<number>`COALESCE(${productStock.totalStock}, 0)`.mapWith(Number),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productStock, eq(products.id, productStock.productId))
      .where(
        categoryId ? eq(products.categoryId, categoryId) : undefined
      );

    const allProducts = await query;

    // Post-process to apply stockStatus filter and compute KPIs
    let totalProducts = 0;
    let totalStock = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let inventoryValue = 0;
    
    const categoryMap = new Map<number, { name: string, stock: number, value: number }>();

    const filtered = allProducts.filter(p => {
      const stock = p.stock || 0;
      const alert = p.minStockAlert || 10;
      
      const isOut = stock <= 0;
      const isLow = stock > 0 && stock <= alert;

      if (stockStatus === "in_stock" && (isOut || isLow)) return false;
      if (stockStatus === "low_stock" && !isLow) return false;
      if (stockStatus === "out_of_stock" && !isOut) return false;
      
      return true;
    });

    filtered.forEach(p => {
      const stock = p.stock || 0;
      const alert = p.minStockAlert || 10;
      
      totalProducts++;
      totalStock += stock;
      inventoryValue += stock * p.costPrice;

      if (stock <= 0) outOfStockItems++;
      else if (stock <= alert) lowStockItems++;

      if (p.categoryId) {
        const cat = categoryMap.get(p.categoryId) || { name: p.categoryName || 'Uncategorized', stock: 0, value: 0 };
        cat.stock += stock;
        cat.value += (stock * p.costPrice);
        categoryMap.set(p.categoryId, cat);
      }
    });

    const categoryBreakdown = Array.from(categoryMap.values())
      .map(c => ({ category: c.name, stock: c.stock, value: c.value }))
      .sort((a, b) => b.stock - a.stock);

    // Movement Analytics
    const movements = await db
      .select({
        movementType: inventoryLedger.movementType,
        total: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.mapWith(Number)
      })
      .from(inventoryLedger)
      .where(
        and(
          startDate ? sql`${inventoryLedger.createdAt} >= ${startDate}` : undefined,
          endDate ? sql`${inventoryLedger.createdAt} <= ${endDate}` : undefined
        )
      )
      .groupBy(inventoryLedger.movementType);
      
    let stockIn = 0;
    let stockOut = 0;
    let adjustments = 0;
    
    movements.forEach(m => {
      if (m.movementType === 'PURCHASE' || m.movementType === 'RETURN') stockIn += m.total;
      else if (m.movementType === 'SALE') stockOut += Math.abs(m.total);
      else if (m.movementType === 'ADJUSTMENT') adjustments += m.total;
    });

    return {
      kpis: {
        totalProducts,
        totalStock,
        lowStockItems,
        outOfStockItems,
        inventoryValue
      },
      categoryBreakdown,
      movements: {
        stockIn,
        stockOut,
        adjustments
      }
    };
  }
  static async getCustomerAnalytics(customerType?: string, frequency?: string, startDate?: Date, endDate?: Date) {
    // We need to calculate order count, revenue, and last purchase per customer
    const customerStats = db
      .select({
        customerId: invoices.customerId,
        orderCount: sql<number>`COUNT(${invoices.id})`.as('order_count'),
        revenue: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.as('revenue'),
        lastPurchase: sql<string>`MAX(${invoices.createdAt})`.as('last_purchase')
      })
      .from(invoices)
      .groupBy(invoices.customerId)
      .as('customer_stats');

    // Main query
    const query = db
      .select({
        id: customers.id,
        fullName: customers.fullName,
        email: customers.email,
        phone: customers.phone,
        createdAt: customers.createdAt,
        orderCount: sql<number>`COALESCE(${customerStats.orderCount}, 0)`.mapWith(Number),
        revenue: sql<number>`COALESCE(${customerStats.revenue}, 0)`.mapWith(Number),
        lastPurchase: customerStats.lastPurchase
      })
      .from(customers)
      .leftJoin(customerStats, eq(customers.id, customerStats.customerId))
      .where(
        and(
          startDate ? sql`${customers.createdAt} >= ${startDate}` : undefined,
          endDate ? sql`${customers.createdAt} <= ${endDate}` : undefined
        )
      );

    const allCustomers = await query;

    // Apply filters and calculate KPIs in-memory since the subset of customers is generally small enough,
    // and it makes the complex segment/frequency logic easy to maintain exactly like the frontend.
    let totalCustomers = 0;
    
    // Thirty days ago for "new" calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = allCustomers.filter(c => {
      const isReturning = c.orderCount > 1;
      
      if (customerType === "new" && isReturning) return false;
      if (customerType === "returning" && !isReturning) return false;

      if (frequency === "high" && c.orderCount <= 10) return false;
      if (frequency === "medium" && (c.orderCount < 3 || c.orderCount > 10)) return false;
      if (frequency === "low" && (c.orderCount < 1 || c.orderCount > 2)) return false;

      return true;
    });

    let newCustomers = 0;
    let returningCustomers = 0;
    let vip = 0;
    let regular = 0;
    let occasional = 0;
    let inactive = 0;
    
    const growthMap = new Map<string, number>();

    filtered.forEach(c => {
      totalCustomers++;
      
      if (c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo) {
        newCustomers++;
      }
      
      if (c.orderCount > 1) {
        returningCustomers++;
      }

      // Segmentation
      if (c.orderCount === 0) {
        inactive++;
      } else if (c.revenue > 5000) {
        vip++;
      } else if (c.orderCount > 2) {
        regular++;
      } else {
        occasional++;
      }

      // Growth trend (group by Month/Year)
      if (c.createdAt) {
        const dStr = format(new Date(c.createdAt), "MMM yyyy");
        growthMap.set(dStr, (growthMap.get(dStr) || 0) + 1);
      }
    });

    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    const segmentationData = [
      { name: "VIP (High Value)", value: vip, color: "#8b5cf6" },
      { name: "Regulars", value: regular, color: "#3b82f6" },
      { name: "Occasional", value: occasional, color: "#10b981" },
      { name: "Inactive", value: inactive, color: "#9ca3af" },
    ].filter(d => d.value > 0);

    // Sort growth trend by date, we will just rely on the fact that map insertion is roughly chronological if they are fetched sorted, 
    // but better to explicitly sort if we need exact. For now, returning unsorted map entries, then we sort by parsing date.
    const growthTrendData = Array.from(growthMap.entries())
      .map(([label, count]) => ({ label, customers: count }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

    const topCustomersData = [...filtered]
      .filter(c => c.orderCount > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: c.fullName || "Unknown",
        email: c.email || undefined,
        phone: c.phone || undefined,
        orderCount: c.orderCount,
        revenue: c.revenue,
        lastPurchase: c.lastPurchase || c.createdAt?.toISOString() || new Date().toISOString()
      }));

    return {
      kpis: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        retentionRate
      },
      segmentationData,
      growthTrendData,
      topCustomersData
    };
  }
}
