'use server';

import { db } from '@/lib/db';
import {
  inventoryItems as inventoryItemsTable,
  inventoryTransactions as inventoryTransactionsTable,
  categories as categoriesTable,
  suppliers
} from '../../../drizzle/schema';

import { eq, and, sql, gte, lt } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/server';
import { checkPermission, requirePermission } from '@/lib/auth/server';
import { Permission } from '@/lib/authorization';

export interface AnalyticsMetrics {
  totalInventoryValue: number;
  stockTransactionsToday: number;
  lowStockItems: number;
  topCategory: string;
}

export interface InventoryTrend {
  date: string;
  value: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  count: number;
  totalValue: number;
  avgPrice: number;
}

export interface ProductPerformance {
  name: string;
  quantity: number;
}

export interface TransactionHistory {
  date: string;
  count: number;
}

export interface AnalyticsResponse {
  analyticsMetrics: {
    title: string;
    value: string;
    change: string;
    icon: string;
  }[];
  inventoryTrends: InventoryTrend[];
  categoryDistribution: CategoryDistribution[];
  productPerformance: ProductPerformance[];
  transactionHistory: TransactionHistory[];
}

export async function getAnalyticsData(userContext: any): Promise<AnalyticsResponse> {
  // Require permission to access analytics
  await requirePermission(Permission.ANALYTICS_READ, userContext);

  // Calculate total inventory value
  const dbInventoryItems = await db
    .select({
      quantity: inventoryItemsTable.quantity,
      price: inventoryItemsTable.price,
      categoryId: inventoryItemsTable.categoryId
    })
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.isActive, true));

  const totalInventoryValue = dbInventoryItems.reduce(
    (sum: number, item: { quantity: number; price: number }) => sum + item.quantity * (item.price / 100), // Convert back to dollars
    0
  );

  // Get stock transactions for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stockTransactionsTodayResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(inventoryTransactionsTable)
    .where(
      and(
        gte(inventoryTransactionsTable.createdAt, today),
        lt(inventoryTransactionsTable.createdAt, tomorrow)
      )
    );

  const stockTransactionsToday = Number(stockTransactionsTodayResult[0]?.count || 0);

  // Get low stock items (quantity <= minQuantity)
  const inventoryItemsForLowStock = await db
    .select({
      quantity: inventoryItemsTable.quantity,
      minQuantity: inventoryItemsTable.minQuantity,
    })
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.isActive, true));

  const lowStockItems = inventoryItemsForLowStock.filter(
    (item: { quantity: number; minQuantity: number }) => item.quantity <= item.minQuantity
  ).length;

  // Get top category by item count
  let topCategory = 'No Categories';
  if (dbInventoryItems.length > 0) {
    const categoryCounts: { [key: string]: { count: number; totalValue: number } } = {};

    // Get category names along with inventory items
    const inventoryItemsWithCategories = await db
      .select({
        quantity: inventoryItemsTable.quantity,
        price: inventoryItemsTable.price,
        category: { name: categoriesTable.name }
      })
      .from(inventoryItemsTable)
      .leftJoin(categoriesTable, eq(inventoryItemsTable.categoryId, categoriesTable.id))
      .where(eq(inventoryItemsTable.isActive, true));

    inventoryItemsWithCategories.forEach((item: any) => {
      if (item.category?.name) {
        if (categoryCounts[item.category.name]) {
          categoryCounts[item.category.name].count += 1;
          categoryCounts[item.category.name].totalValue += item.quantity * (item.price / 100); // Convert back to dollars
        } else {
          categoryCounts[item.category.name] = {
            count: 1,
            totalValue: item.quantity * (item.price / 100) // Convert back to dollars
          };
        }
      }
    });

    // Find the category with the most items
    if (Object.keys(categoryCounts).length > 0) {
      const topCategoryEntry = Object.entries(categoryCounts).reduce((top, current) =>
        current[1].count > top[1].count ? current : top
      );
      topCategory = topCategoryEntry[0];
    }
  }

  // Prepare analytics metrics
  const analyticsMetrics = [
    {
      title: 'Total Inventory Value',
      value: new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
      }).format(totalInventoryValue),
      change: '+2.5%',
      icon: '💰'
    },
    {
      title: 'Stock Transactions Today',
      value: stockTransactionsToday.toString(),
      change: '+5.3%',
      icon: '📊'
    },
    {
      title: 'Low Stock Items',
      value: `${lowStockItems} Items`,
      change: '-1.2%',
      icon: '⚠️'
    },
    {
      title: 'Top Category',
      value: topCategory,
      change: '+3.1%',
      icon: '🔝'
    },
  ];

  // Get inventory trends (for the past 30 days)
  // For this example, we'll calculate the trend based on transaction history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const inventoryTrends: InventoryTrend[] = [];
  const dateRange = 30;

  // For a more realistic implementation, we'd calculate the inventory value for each day
  // based on transactions that occurred. For now, we'll simulate a trend based on
  // actual inventory values from the database
  for (let i = 0; i <= dateRange; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (dateRange - i));

    // Format as YYYY-MM-DD
    const dateString = date.toISOString().split('T')[0];

    // Calculate a simulated value that reflects some fluctuations
    // In a real implementation, you would calculate actual inventory values for each day
    const baseValue = totalInventoryValue * 0.9;
    const fluctuation = Math.random() * totalInventoryValue * 0.2; // ±10% fluctuation
    const value = baseValue + fluctuation;

    inventoryTrends.push({
      date: dateString,
      value: parseFloat(value.toFixed(2))
    });
  }

  // Get all categories and inventory items
  const allInventoryItems = await db
    .select({
      id: inventoryItemsTable.id,
      name: inventoryItemsTable.name,
      quantity: inventoryItemsTable.quantity,
      price: inventoryItemsTable.price,
      categoryId: inventoryItemsTable.categoryId,
      category: {
        id: categoriesTable.id,
        name: categoriesTable.name,
        parentId: categoriesTable.parentId
      }
    })
    .from(inventoryItemsTable)
    .leftJoin(categoriesTable, eq(inventoryItemsTable.categoryId, categoriesTable.id))
    .where(eq(inventoryItemsTable.isActive, true));

  // Build main category aggregations
  const mainCategoryMap: { [key: string]: { totalValue: number, itemCount: number, totalQty: number } } = {};

  for (const item of allInventoryItems) {
    if (item.category) {
      // Find the main (root) category for this item
      // For simplicity, we'll consider the immediate category as the main category
      // In a more complex hierarchy, we would traverse up to the parent
      const mainCategoryName = item.category.name;

      if (!mainCategoryMap[mainCategoryName]) {
        mainCategoryMap[mainCategoryName] = {
          totalValue: 0,
          itemCount: 0,
          totalQty: 0
        };
      }

      mainCategoryMap[mainCategoryName].totalValue += item.quantity * (item.price / 100); // Convert back to dollars
      mainCategoryMap[mainCategoryName].itemCount += 1;
      mainCategoryMap[mainCategoryName].totalQty += item.quantity;
    }
  }

  // Convert to the required format
  const categoryDistribution: CategoryDistribution[] = Object.entries(mainCategoryMap)
    .map(([name, data]) => ({
      name,
      value: data.itemCount, // Number of items in this main category
      count: data.itemCount, // Same as above
      totalValue: data.totalValue,
      avgPrice: data.itemCount > 0 ? data.totalValue / data.itemCount : 0
    }))
    .sort((a, b) => b.totalValue - a.totalValue); // Sort by total value

  // Get top 5 products by quantity
  const topProducts = await db
    .select({
      name: inventoryItemsTable.name,
      quantity: inventoryItemsTable.quantity,
      category: { name: categoriesTable.name }
    })
    .from(inventoryItemsTable)
    .leftJoin(categoriesTable, eq(inventoryItemsTable.categoryId, categoriesTable.id))
    .where(eq(inventoryItemsTable.isActive, true))
    .orderBy((t) => sql`${t.quantity} DESC`) // Order by quantity descending
    .limit(5);

  const productPerformance: ProductPerformance[] = topProducts.map((item: any) => ({
    name: item.name,
    quantity: item.quantity
  }));

  // Get transaction history by date for the past week
  // Group transactions by date and count them
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Get all transactions from the past week
  const dbTransactions = await db
    .select({
      createdAt: inventoryTransactionsTable.createdAt
    })
    .from(inventoryTransactionsTable)
    .where(gte(inventoryTransactionsTable.createdAt, weekAgo));

  // Group by date and count
  const dateCountMap: { [key: string]: number } = {};

  dbTransactions.forEach((transaction: any) => {
    const date = transaction.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
    dateCountMap[date] = (dateCountMap[date] || 0) + 1;
  });

  // Create an array with data for each day in the past week
  const transactionHistory: TransactionHistory[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    transactionHistory.push({
      date: dateString,
      count: dateCountMap[dateString] || 0
    });
  }

  return {
    analyticsMetrics,
    inventoryTrends,
    categoryDistribution,
    productPerformance,
    transactionHistory
  };
}