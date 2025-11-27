// test-raw-db.js
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function testRawConnection() {
  console.log('Testing raw PostgreSQL connection...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if users table exists and has data
    const result = await client.query('SELECT * FROM users LIMIT 3;');
    console.log('Sample users found:', result.rows.length);
    result.rows.forEach((row, i) => {
      console.log(`${i+1}. Email: ${row.email}, Name: ${row.name}, Role: ${row.role}, Active: ${row.is_active}`);
    });
    
    // Check other tables
    const itemCount = await client.query('SELECT COUNT(*) FROM inventory_items;');
    console.log('Inventory items count:', itemCount.rows[0].count);
    
    const catCount = await client.query('SELECT COUNT(*) FROM categories;');
    console.log('Categories count:', catCount.rows[0].count);
    
    const supplierCount = await client.query('SELECT COUNT(*) FROM suppliers;');
    console.log('Suppliers count:', supplierCount.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

testRawConnection();