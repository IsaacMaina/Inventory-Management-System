import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle/schema';

// Create a dedicated connection for migrations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_L4HiSpzFC3lv@ep-snowy-fire-a459v17o-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

const db = drizzle(pool, { schema });

async function runMigrations() {
  console.log('Starting migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();