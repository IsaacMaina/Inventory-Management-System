// Debug script to verify the database connection and check the user exists
require('dotenv').config({ path: '.env.local' }); // Load .env.local file
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function debugAuth() {
  console.log("=== DEBUG AUTHENTICATION SYSTEM ===");
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
    
    // First, check all users in the database
    const usersResult = await client.query('SELECT id, email, "createdAt", "updatedAt", "isActive", role FROM "User"');
    console.log("\n📋 All users in database:");
    usersResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    if (usersResult.rows.length === 0) {
      console.log("❌ No users found in the database!");
      return;
    }
    
    // Check specifically for admin@gmail.com
    console.log("\n🔍 Looking for admin@gmail.com user...");
    const adminResult = await client.query(
      'SELECT id, email, password, name, role, "isActive" FROM "User" WHERE email = $1',
      ['admin@gmail.com']
    );
    
    if (adminResult.rows.length === 0) {
      console.log("❌ User admin@gmail.com not found in the database!");
      // Check for other possible variations
      const similarUsers = await client.query(
        'SELECT id, email FROM "User" WHERE email LIKE $1',
        ['%admin%']
      );
      if (similarUsers.rows.length > 0) {
        console.log("Similar emails found:");
        similarUsers.rows.forEach(u => console.log(`- ${u.email}`));
      }
      return;
    }
    
    const user = adminResult.rows[0];
    console.log("✅ Found user:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password exists: ${!!user.password}`);
    console.log(`   Password length: ${user.password ? user.password.length : 0}`);
    
    // Test password verification
    console.log("\n🔐 Testing password verification...");
    const isValid = await bcrypt.compare('123456', user.password);
    console.log(`   Is '123456' correct password? ${isValid}`);
    
    const isWrongPassword = await bcrypt.compare('wrongpassword', user.password);
    console.log(`   Is 'wrongpassword' correct password? ${isWrongPassword}`);
    
    if (isValid) {
      console.log("\n✅ User exists with correct credentials!");
    } else {
      console.log("\n❌ Password verification failed. The password might not be properly hashed.");
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message || error);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
debugAuth();