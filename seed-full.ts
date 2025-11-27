import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle/schema';
import { hashPassword } from './src/lib/auth/utils';
import { users, accounts, sessions, verificationTokens, categories, suppliers, inventoryItems, inventoryTransactions, reports, notifications } from './drizzle/schema';
import { eq, sql } from 'drizzle-orm';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_L4HiSpzFC3lv@ep-snowy-fire-a459v17o-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

const db = drizzle(pool, { schema });

async function seedDatabase() {
  console.log('Checking and seeding database...');

  try {
    // First, check if tables exist by trying to count records in the users table
    try {
      await db.select().from(users).limit(1);
      console.log('Tables exist, continuing with seeding...');

      // If tables exist, clear them
      await db.execute(sql`TRUNCATE TABLE ${accounts} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${sessions} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${verificationTokens} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${notifications} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${reports} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${inventoryTransactions} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${inventoryItems} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${suppliers} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${categories} RESTART IDENTITY CASCADE;`);
      await db.execute(sql`TRUNCATE TABLE ${users} RESTART IDENTITY CASCADE;`);
    } catch (error) {
      console.log('Tables may not exist yet, proceeding to create initial data...');
      // If the table doesn't exist, we'll just create the initial data
    }

    // Create admin user with a strong password that meets validation requirements
    const password = 'Admin123@Secure'; // Meets all validation criteria: uppercase, lowercase, number, special character
    const hashedPassword = await hashPassword(password);

    console.log('Creating admin user...');
    const result = await db.insert(schema.users).values({
      id: 'admin-123',
      email: 'admin@gmail.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    }).returning({ insertedId: schema.users.id });

    const userId = result[0].insertedId;
    console.log('Admin user created successfully!');

    // Create some example categories
    const electronicsCategory = await db.insert(schema.categories).values({
      id: 'cat-electronics-123',
      name: 'Electronics',
      description: 'Electronic devices and components',
    }).returning({ insertedId: schema.categories.id });

    const clothingCategory = await db.insert(schema.categories).values({
      id: 'cat-clothing-123',
      name: 'Clothing',
      description: 'Apparel and garments',
    }).returning({ insertedId: schema.categories.id });

    console.log('Sample categories created successfully!');

    // Create a sample supplier
    const supplierResult = await db.insert(schema.suppliers).values({
      id: 'supplier-tech-123',
      name: 'Tech Supplies Ltd',
      email: 'contact@tech-supplies.com',
      phone: '+1234567890',
      address: '123 Tech Street, Silicon Valley',
      userId: userId,
    }).returning({ insertedId: schema.suppliers.id });

    console.log('Sample supplier created successfully!');

    // Create a sample inventory item
    await db.insert(schema.inventoryItems).values({
      id: 'item-laptop-123',
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop',
      sku: 'GL-2024-GAMER',
      barcode: '1234567890123',
      categoryId: electronicsCategory[0].insertedId,
      supplierId: supplierResult[0].insertedId,
      quantity: 10,
      minQuantity: 2,
      price: 150000, // Stored as cents for precision (KES 1500.00)
      cost: 120000,  // Stored as cents for precision (KES 1200.00)
      location: 'Warehouse A, Shelf 3',
      isActive: true,
      userId: userId,
    });

    console.log('Sample inventory item created successfully!');

    console.log('Database seeded successfully!');
    console.log('Credentials:');
    console.log('- Email: admin@gmail.com');
    console.log('- Password: Admin123@Secure');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();