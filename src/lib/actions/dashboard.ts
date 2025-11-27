"use server";

import { db } from "@/lib/db";
import { eq, and, or, gt, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { checkPermission, requirePermission } from "@/lib/auth/server";
import { Permission } from "@/lib/authorization";
import {
  inventoryItems,
  suppliers,
  inventoryTransactions,
  categories,
} from "../../../drizzle/schema";

export interface DashboardMetrics {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  activeSuppliers: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  product: string;
  time: string;
}

export interface InventoryDistribution {
  name: string;
  value: number;
  color: string;
}

export async function getDashboardData(userContext: AuthenticatedUser): Promise<{
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
  inventoryDistribution: InventoryDistribution[];
}> {
  // Check if user has permission to access dashboard data
  const hasPerm = await checkPermission(Permission.PRODUCT_READ, userContext);
  if (!hasPerm) {
    throw new Error(
      "Access denied: Insufficient permissions to view dashboard data"
    );
  }

  // Calculate metrics
  const totalProductsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(inventoryItems)
    .where(eq(inventoryItems.isActive, true));
  const totalProducts = Number(totalProductsResult[0]?.count || 0);

  const inventoryItemsForLowStock = await db
    .select({
      quantity: inventoryItems.quantity,
      minQuantity: inventoryItems.minQuantity,
    })
    .from(inventoryItems)
    .where(eq(inventoryItems.isActive, true));

  const lowStockItems = inventoryItemsForLowStock.filter(
    (item: { quantity: number; minQuantity: number }) =>
      item.quantity <= item.minQuantity
  ).length;

  const allInventoryItems = await db
    .select({
      quantity: inventoryItems.quantity,
      price: inventoryItems.price,
    })
    .from(inventoryItems)
    .where(eq(inventoryItems.isActive, true));

  const totalValue = allInventoryItems.reduce(
    (sum: number, item: { quantity: number; price: number }) =>
      sum + item.quantity * item.price,
    0
  );

  const activeSuppliersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(suppliers)
    .where(eq(suppliers.isActive, true));
  const activeSuppliers = Number(activeSuppliersResult[0]?.count || 0);

  // Get recent activity
  const isAdmin = await checkPermission(Permission.SETTINGS_UPDATE, userContext);

  let recentTransactions;

  if (!isAdmin) {
    // Non-admin users can only see transactions related to products they own
    recentTransactions = await db
      .select({
        id: inventoryTransactions.id,
        type: inventoryTransactions.type,
        createdAt: inventoryTransactions.createdAt,
        inventoryItem: {
          name: inventoryItems.name,
          userId: inventoryItems.userId,
        },
      })
      .from(inventoryTransactions)
      .innerJoin(
        inventoryItems,
        eq(inventoryTransactions.inventoryItemId, inventoryItems.id)
      )
      .where(eq(inventoryItems.userId, userContext.id))
      .orderBy((t) => sql`${t.createdAt} DESC`) // Using raw SQL for descending order
      .limit(4);
  } else {
    recentTransactions = await db
      .select({
        id: inventoryTransactions.id,
        type: inventoryTransactions.type,
        createdAt: inventoryTransactions.createdAt,
        inventoryItem: {
          name: inventoryItems.name,
          userId: inventoryItems.userId,
        },
      })
      .from(inventoryTransactions)
      .innerJoin(
        inventoryItems,
        eq(inventoryTransactions.inventoryItemId, inventoryItems.id)
      )
      .orderBy((t) => sql`${t.createdAt} DESC`) // Using raw SQL for descending order
      .limit(4);
  }

  const recentActivity: RecentActivity[] = recentTransactions.map(
    (transaction: any) => ({
      id: transaction.id,
      action:
        transaction.type === "IN" ? "Added inventory" : "Removed inventory",
      product: transaction.inventoryItem.name,
      time: formatTimeAgo(transaction.createdAt),
    })
  );

  // Get inventory distribution by category
  let allActiveInventoryItems;

  if (!isAdmin) {
    // Non-admin users can only see their own inventory items
    allActiveInventoryItems = await db
      .select({
        quantity: inventoryItems.quantity,
        category: categories.name,
      })
      .from(inventoryItems)
      .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
      .where(
        and(
          eq(inventoryItems.isActive, true),
          eq(inventoryItems.userId, userContext.id)
        )
      );
  } else {
    allActiveInventoryItems = await db
      .select({
        quantity: inventoryItems.quantity,
        category: categories.name,
      })
      .from(inventoryItems)
      .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
      .where(eq(inventoryItems.isActive, true));
  }

  // Group items by category and calculate percentages
  const categoryCounts: { [key: string]: number } = {};
  allActiveInventoryItems.forEach((item: any) => {
    if (item.category) {
      categoryCounts[item.category.name] =
        (categoryCounts[item.category.name] || 0) + item.quantity;
    }
  });

  const totalQuantity = allActiveInventoryItems.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  // Get the top 4 categories
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const inventoryDistribution = topCategories.map(([name, quantity]) => ({
    name,
    value: totalQuantity > 0 ? Math.round((quantity / totalQuantity) * 100) : 0,
    color: getColorForCategory(name),
  }));

  return {
    metrics: {
      totalProducts,
      lowStockItems,
      totalValue,
      activeSuppliers,
    },
    recentActivity,
    inventoryDistribution,
  };
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}

// Helper function to assign colors to categories
function getColorForCategory(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  // Simple hash function to consistently assign colors to categories
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
