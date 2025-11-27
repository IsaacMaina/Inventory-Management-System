'use server';

import { db } from '@/lib/db';
import { reports as reportsTable } from '../../../drizzle/schema';
import { eq, or, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/server';
import { checkPermission, requirePermission } from '@/lib/auth/server';
import { Permission } from '@/lib/authorization';

export interface Report {
  id: string;
  name: string;
  type: string;
  filters?: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ReportResponse {
  reports: Report[];
  totalReports: number;
}

export async function getReports(userContext: any): Promise<ReportResponse> {
  // Check if user has permission to read reports
  const hasPerm = await checkPermission(Permission.REPORTS_READ, userContext);
  if (!hasPerm) {
    throw new Error('Access denied: Insufficient permissions to view reports');
  }

  // Base where clause
  let whereClause: any = { userId: userContext.id }; // Default to user's reports

  // Admin users can see all reports
  const isAdmin = await checkPermission(Permission.SETTINGS_UPDATE, userContext);
  if (isAdmin) {
    whereClause = {}; // Allow access to all reports for admin
  }

  // Fetch reports based on permissions
  let reports;
  let totalReportsCount;

  if (isAdmin) {
    // Admin users can see all reports
    reports = await db.select().from(reportsTable).orderBy((t) => sql`${t.createdAt} DESC`);
    const totalCountResult = await db.select({ count: sql<number>`COUNT(*)` }).from(reportsTable);
    totalReportsCount = Number(totalCountResult[0]?.count || 0);
  } else {
    // Regular users can only see their own reports
    reports = await db.select().from(reportsTable).where(eq(reportsTable.userId, userContext.id)).orderBy((t) => sql`${t.createdAt} DESC`);
    const countResult = await db.select({ count: sql<number>`COUNT(*)` }).from(reportsTable).where(eq(reportsTable.userId, userContext.id));
    totalReportsCount = Number(countResult[0]?.count || 0);
  }

  return {
    reports,
    totalReports: totalReportsCount,
  };
}