// test-db-connection.js - Simple script to test database connection and user data
require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, inventoryItems, categories, suppliers } = require('./drizzle/schema');
const { eq } = require('drizzle-orm');

async function testDBConnection() {
  try {
    console.log("Testing database connection and user data...");
    
    // Create a connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create Drizzle instance
    const db = drizzle(pool, { schema: require('./drizzle/schema') });

    // Test: Get all users
    const allUsers = await db.select().from(users);
    console.log("✅ Found", allUsers.length, "users in the database:");
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });

    // Test: Get specific admin user
    const adminUsers = await db.select().from(users).where(eq(users.email, 'admin@gmail.com'));
    console.log("\n✅ Admin user found:", adminUsers.length > 0);
    if (adminUsers.length > 0) {
      console.log(`  - Email: ${adminUsers[0].email}`);
      console.log(`  - Name: ${adminUsers[0].name}`);
      console.log(`  - Role: ${adminUsers[0].role}`);
      console.log(`  - Active: ${adminUsers[0].isActive}`);
      console.log(`  - Created: ${adminUsers[0].createdAt}`);
    }

    // Test: Get other tables to see if they have data
    const itemCount = await db.select().from(inventoryItems);
    console.log(`\n✅ Inventory items in database: ${itemCount.length}`);
    
    const categoryCount = await db.select().from(categories);
    console.log(`✅ Categories in database: ${categoryCount.length}`);
    
    const supplierCount = await db.select().from(suppliers);
    console.log(`✅ Suppliers in database: ${supplierCount.length}`);

    console.log("\n🎉 Database test completed successfully!");
    
    await pool.end();
  } catch (error) {
    console.error("❌ Error during database test:", error.message);
    console.error("Stack:", error.stack);
  }
}

testDBConnection();