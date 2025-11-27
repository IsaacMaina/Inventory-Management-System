// Script to create a new admin user with email: admin@gmail.com and password: 123456
require('dotenv').config({ path: '.env.local' }); // Load .env.local file
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const cuid = require('cuid');

async function createAdminUser() {
  console.log("Attempting to create admin user...");
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

    // Hash the password "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log("✅ Password hashed successfully");

    // Create the admin user
    const userId = cuid();
    const result = await client.query(
      `INSERT INTO "User" 
      (id, email, name, password, role, "createdAt", "updatedAt", "isActive") 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true)
      RETURNING id, email, name, role`,
      [userId, 'admin@gmail.com', 'Admin User', hashedPassword, 'admin']
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user created successfully!');
      console.log('Email:', result.rows[0].email);
      console.log('Name:', result.rows[0].name);
      console.log('Role:', result.rows[0].role);
      console.log('\nYou can now log in with:');
      console.log('Email: admin@gmail.com');
      console.log('Password: 123456');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message || error);
    if (error.code === '23505') { // Unique constraint violation
      console.log('User with this email already exists');
    }
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
createAdminUser();