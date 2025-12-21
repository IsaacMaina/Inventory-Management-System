// src/lib/actions/posAnalytics.ts

'use server';

import { db } from '@/lib/db';
import { sales, saleItems, inventoryItems, users } from '../../../drizzle/schema';
import { eq, and, gte, lte, sql, sum, count, desc } from 'drizzle-orm';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';
import { checkPermission } from '@/lib/auth/server';
import { Permission } from '@/lib/authorization';

// Interface for daily sales report
export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalAmount: number;
  paymentMethods: Record<string, number>;
}

// Interface for sales by cashier report
export interface SalesByCashierReport {
  cashierId: string;
  cashierName: string;
  totalSales: number;
  totalAmount: number;
}

// Interface for sales by payment method report
export interface SalesByPaymentMethodReport {
  paymentMethod: string;
  totalSales: number;
  totalAmount: number;
}

// Interface for top selling products report
export interface TopSellingProductsReport {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// Interface for profit report
export interface ProfitReport {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

// Get daily sales report for a given date range
export async function getDailySalesReport(startDate: Date, endDate: Date) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check permissions
    const hasPerm = await checkPermission(Permission.ANALYTICS_READ, user);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view analytics');
    }

    // For non-admin users, only show their sales
    let whereCondition;
    if (user.role !== 'admin' && user.role !== 'manager') {
      whereCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate),
        eq(sales.cashierId, user.id)
      );
    } else {
      whereCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      );
    }

    // Get sales grouped by date
    const dailySales = await db
      .select({
        date: sql<string>`DATE(${sales.createdAt})`.as('date'),
        totalSales: count(sales.id).as('total_sales'),
        totalAmount: sum(sales.totalAmount).as('total_amount'),
        paymentMethod: sales.paymentMethod,
      })
      .from(sales)
      .where(whereCondition)
      .groupBy(sql`DATE(${sales.createdAt})`, sales.paymentMethod)
      .orderBy(desc(sql`DATE(${sales.createdAt})`));

    // Group by date and aggregate payment methods
    const groupedByDate: Record<string, DailySalesReport> = {};
    dailySales.forEach(row => {
      const date = row.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          totalSales: 0,
          totalAmount: 0,
          paymentMethods: {},
        };
      }

      groupedByDate[date].totalSales += Number(row.totalSales || 0);
      groupedByDate[date].totalAmount += Number(row.totalAmount || 0);
      groupedByDate[date].paymentMethods[row.paymentMethod] = 
        (groupedByDate[date].paymentMethods[row.paymentMethod] || 0) + Number(row.totalSales || 0);
    });

    return Object.values(groupedByDate);
  } catch (error) {
    console.error('Error getting daily sales report:', error);
    throw error;
  }
}

// Get sales by cashier report
export async function getSalesByCashierReport(startDate: Date, endDate: Date) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check permissions - only admin/manager can view this report
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new Error('Access denied: Insufficient permissions to view cashier sales report');
    }

    const salesByCashier = await db
      .select({
        cashierId: sales.cashierId,
        cashierName: users.name,
        totalSales: count(sales.id).as('total_sales'),
        totalAmount: sum(sales.totalAmount).as('total_amount'),
      })
      .from(sales)
      .leftJoin(users, eq(sales.cashierId, users.id))
      .where(
        and(
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        )
      )
      .groupBy(sales.cashierId, users.name)
      .orderBy(desc(sql`total_amount`));

    return salesByCashier.map(row => ({
      cashierId: row.cashierId,
      cashierName: row.cashierName || 'Unknown Cashier',
      totalSales: Number(row.totalSales || 0),
      totalAmount: Number(row.totalAmount || 0),
    }));
  } catch (error) {
    console.error('Error getting sales by cashier report:', error);
    throw error;
  }
}

// Get sales by payment method report
export async function getSalesByPaymentMethodReport(startDate: Date, endDate: Date) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check permissions
    const hasPerm = await checkPermission(Permission.ANALYTICS_READ, user);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view analytics');
    }

    // For non-admin users, only show their sales
    let whereCondition;
    if (user.role !== 'admin' && user.role !== 'manager') {
      whereCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate),
        eq(sales.cashierId, user.id)
      );
    } else {
      whereCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      );
    }

    const salesByMethod = await db
      .select({
        paymentMethod: sales.paymentMethod,
        totalSales: count(sales.id).as('total_sales'),
        totalAmount: sum(sales.totalAmount).as('total_amount'),
      })
      .from(sales)
      .where(whereCondition)
      .groupBy(sales.paymentMethod)
      .orderBy(desc(sql`total_amount`));

    return salesByMethod.map(row => ({
      paymentMethod: row.paymentMethod,
      totalSales: Number(row.totalSales || 0),
      totalAmount: Number(row.totalAmount || 0),
    }));
  } catch (error) {
    console.error('Error getting sales by payment method report:', error);
    throw error;
  }
}

// Get top selling products report
export async function getTopSellingProducts(startDate: Date, endDate: Date, limit: number = 10) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check permissions
    const hasPerm = await checkPermission(Permission.ANALYTICS_READ, user);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view analytics');
    }

    // For non-admin users, only show sales of products they created
    let saleItemsJoinCondition;
    if (user.role !== 'admin' && user.role !== 'manager') {
      saleItemsJoinCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate),
        eq(sales.cashierId, user.id),
        eq(inventoryItems.userId, user.id)
      );
    } else {
      saleItemsJoinCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      );
    }

    const topSellingProducts = await db
      .select({
        productId: inventoryItems.id,
        productName: inventoryItems.name,
        totalQuantitySold: sql<number>`SUM(${saleItems.quantity})`.as('total_quantity_sold'),
        totalRevenue: sql<number>`SUM(${saleItems.quantity} * ${saleItems.priceAtSale})`.as('total_revenue'),
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(inventoryItems, eq(saleItems.productId, inventoryItems.id))
      .where(saleItemsJoinCondition)
      .groupBy(inventoryItems.id, inventoryItems.name)
      .orderBy(desc(sql`total_quantity_sold`))
      .limit(limit);

    return topSellingProducts.map(row => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantitySold: Number(row.totalQuantitySold || 0),
      totalRevenue: Number(row.totalRevenue || 0),
    }));
  } catch (error) {
    console.error('Error getting top selling products report:', error);
    throw error;
  }
}

// Get profit report (revenue - cost)
export async function getProfitReport(startDate: Date, endDate: Date) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check permissions
    const hasPerm = await checkPermission(Permission.ANALYTICS_READ, user);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view analytics');
    }

    // For non-admin users, only show sales of products they created
    let saleItemsJoinCondition;
    if (user.role !== 'admin' && user.role !== 'manager') {
      saleItemsJoinCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate),
        eq(sales.cashierId, user.id),
        eq(inventoryItems.userId, user.id)
      );
    } else {
      saleItemsJoinCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      );
    }

    const profitData = await db
      .select({
        productId: inventoryItems.id,
        productName: inventoryItems.name,
        totalQuantitySold: sql<number>`SUM(${saleItems.quantity})`.as('total_quantity_sold'),
        totalRevenue: sql<number>`SUM(${saleItems.quantity} * ${saleItems.priceAtSale})`.as('total_revenue'),
        totalCost: sql<number>`SUM(${saleItems.quantity} * ${inventoryItems.cost})`.as('total_cost'),
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(inventoryItems, eq(saleItems.productId, inventoryItems.id))
      .where(saleItemsJoinCondition)
      .groupBy(inventoryItems.id, inventoryItems.name, inventoryItems.cost)
      .orderBy(desc(sql`total_revenue`));

    return profitData.map(row => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantitySold: Number(row.totalQuantitySold || 0),
      totalRevenue: Number(row.totalRevenue || 0),
      totalCost: Number(row.totalCost || 0),
      profit: Number(row.totalRevenue || 0) - Number(row.totalCost || 0),
    }));
  } catch (error) {
    console.error('Error getting profit report:', error);
    throw error;
  }
}

// Get overall sales summary
export async function getSalesSummary(startDate: Date, endDate: Date) {
  try {
    const user = await getCurrentUserFromSession();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check permissions
    const hasPerm = await checkPermission(Permission.ANALYTICS_READ, user);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view analytics');
    }

    // For non-admin users, only show their sales
    let whereCondition;
    if (user.role !== 'admin' && user.role !== 'manager') {
      whereCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate),
        eq(sales.cashierId, user.id)
      );
    } else {
      whereCondition = and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      );
    }

    const summary = await db
      .select({
        totalSales: count(sales.id).as('total_sales'),
        totalAmount: sum(sales.totalAmount).as('total_amount'),
        averageSaleValue: sql<number>`AVG(${sales.totalAmount})`.as('average_sale_value'),
      })
      .from(sales)
      .where(whereCondition);

    const result = summary[0];
    return {
      totalSales: Number(result?.totalSales || 0),
      totalAmount: Number(result?.totalAmount || 0),
      averageSaleValue: Number(result?.averageSaleValue || 0),
    };
  } catch (error) {
    console.error('Error getting sales summary:', error);
    throw error;
  }
}