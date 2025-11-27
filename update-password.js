const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdminPassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon
    }
  });

  try {
    await client.connect();
    console.log('Connected to the database');

    // Hash the new password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin user's password
    const result = await client.query(
      'UPDATE "User" SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, 'admin@example.com']
    );

    if (result.rows.length > 0) {
      console.log(`Successfully updated password for user: ${result.rows[0].email}`);
      console.log('You can now log in with:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('No user found with email admin@example.com');
    }

  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

updateAdminPassword();