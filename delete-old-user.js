// Script to delete the old user with ID cmig0olx3004ghoih2bfmc6w6
require('dotenv').config({ path: '.env.local' }); // Load .env.local file
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function deleteOldUser() {
  console.log("Attempting to delete old user...");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables");
    return;
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon
    }
  });

  try {
    await client.connect();
    console.log("✅ Connected to database successfully");

    // Delete all related records to avoid foreign key constraints
    // Delete in the right order (child tables first)
    await client.query(
      `DELETE FROM "InventoryTransaction" WHERE "userId" = $1`,
      ['cmig0olx3004ghoih2bfmc6w6']
    );

    await client.query(
      `DELETE FROM "InventoryItem" WHERE "userId" = $1`,
      ['cmig0olx3004ghoih2bfmc6w6']
    );

    await client.query(
      `DELETE FROM "Notification" WHERE "userId" = $1`,
      ['cmig0olx3004ghoih2bfmc6w6']
    );

    await client.query(
      `DELETE FROM "Report" WHERE "userId" = $1`,
      ['cmig0olx3004ghoih2bfmc6w6']
    );

    await client.query(
      `DELETE FROM "Supplier" WHERE "userId" = $1`,
      ['cmig0olx3004ghoih2bfmc6w6']
    );

    // Now delete the old user
    const result = await client.query(
      `DELETE FROM "User" WHERE id = $1 RETURNING id, email`,
      ['cmig0olx3004ghoih2bfmc6w6']
    );

    if (result.rows.length > 0) {
      console.log('✅ Old user deleted successfully!');
      console.log('Deleted user email:', result.rows[0].email);
      console.log('Deleted user ID:', result.rows[0].id);
    } else {
      console.log('⚠️ No user found with ID cmig0olx3004ghoih2bfmc6w6 to delete');
    }

  } catch (error) {
    console.error('❌ Error deleting user:', error.message || error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
deleteOldUser();