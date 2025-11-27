import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Test the database connection by running a simple query
    const userCountResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const userCount = Number(userCountResult[0]?.count || 0);

    return NextResponse.json({
      status: 'OK',
      message: 'Database connection successful',
      userCount
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}