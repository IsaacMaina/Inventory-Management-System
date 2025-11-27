// update-admin-password.js
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  console.log("Updating admin user password to a stronger one...");
  
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

    // New stronger password that will pass validation
    const newPassword = 'Admin123!';  // Contains uppercase, lowercase, number, and special char
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log("✅ New password hashed successfully");
    console.log("New password:", newPassword);

    // Update the admin user's password
    const result = await client.query(
      `UPDATE users 
       SET password = $1 
       WHERE email = $2 
       RETURNING id, email, name`,
      [hashedPassword, 'admin@gmail.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user password updated successfully!');
      console.log('Email:', result.rows[0].email);
      console.log('Name:', result.rows[0].name);
      console.log('\nYou can now log in with:');
      console.log('Email: admin@gmail.com');
      console.log('Password: Admin123!');
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error("❌ Error updating admin user password:", error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
updateAdminPassword();