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

    // Check if user already exists first
    const checkResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@gmail.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️ Admin user already exists');
      console.log('Email: admin@gmail.com');
      return;
    }

    // Hash the password "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log("✅ Password hashed successfully");

    // Create the admin user - using correct table name 'users'
    const result = await client.query(
      `INSERT INTO users
      (id, email, name, password, role, "createdAt", "updatedAt", "isActive")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW(), true)
      RETURNING id, email, name, role`,
      ['admin@gmail.com', 'Admin User', hashedPassword, 'admin']
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