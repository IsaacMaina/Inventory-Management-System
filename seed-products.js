const { Client } = require('pg');
const cuid = require('cuid');
require('dotenv').config();

// Use the DATABASE_URL from environment
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

async function addSampleProducts() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Get the admin user ID
    const userResult = await client.query(
      'SELECT id FROM "User" WHERE email = $1',
      ['admin@example.com']
    );
    
    if (userResult.rows.length === 0) {
      console.error('Admin user not found!');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`Found user ID: ${userId}`);

    // Get suppliers
    const supplierResult = await client.query('SELECT id FROM "Supplier"');
    const suppliers = supplierResult.rows;
    console.log(`Found ${suppliers.length} suppliers`);

    // Get categories
    const categoryResult = await client.query('SELECT id, name FROM "Category"');
    const categories = categoryResult.rows;
    console.log(`Found ${categories.length} categories`);
    
    // Create sample products
    const sampleProducts = [
      // Electronics - Laptops
      { name: 'MacBook Pro 16"', sku: 'ELP-MBP16-2023', categoryId: categories.find(c => c.name === 'Laptops')?.id, supplierId: suppliers[0]?.id, quantity: 10, minQuantity: 2, price: 2499.99 },
      { name: 'Dell XPS 13', sku: 'ELP-DX13-2023', categoryId: categories.find(c => c.name === 'Laptops')?.id, supplierId: suppliers[0]?.id, quantity: 15, minQuantity: 3, price: 1299.99 },
      { name: 'HP Spectre x360', sku: 'ELP-HPS360-2023', categoryId: categories.find(c => c.name === 'Laptops')?.id, supplierId: suppliers[0]?.id, quantity: 8, minQuantity: 2, price: 1599.99 },
      
      // Electronics - Smartphones
      { name: 'iPhone 15 Pro', sku: 'ELP-IP15P-2023', categoryId: categories.find(c => c.name === 'Smartphones')?.id, supplierId: suppliers[0]?.id, quantity: 25, minQuantity: 5, price: 999.99 },
      { name: 'Samsung Galaxy S24', sku: 'ELP-SGS24-2024', categoryId: categories.find(c => c.name === 'Smartphones')?.id, supplierId: suppliers[0]?.id, quantity: 20, minQuantity: 4, price: 899.99 },
      
      // Electronics - Headphones
      { name: 'Sony WH-1000XM5', sku: 'ELP-SWH1000-2023', categoryId: categories.find(c => c.name === 'Headphones')?.id, supplierId: suppliers[0]?.id, quantity: 30, minQuantity: 5, price: 349.99 },
      { name: 'AirPods Pro', sku: 'ELP-APRO-2022', categoryId: categories.find(c => c.name === 'Headphones')?.id, supplierId: suppliers[0]?.id, quantity: 0, minQuantity: 3, price: 249.99 }, // Out of stock
      
      // Clothing - Men's Shirts
      { name: 'Classic White Dress Shirt', sku: 'CA-MWS-001', categoryId: categories.find(c => c.name === 'Shirts')?.id, supplierId: suppliers[1]?.id, quantity: 50, minQuantity: 10, price: 49.99 },
      { name: 'Casual Button-Down', sku: 'CA-MCB-002', categoryId: categories.find(c => c.name === 'Shirts')?.id, supplierId: suppliers[1]?.id, quantity: 7, minQuantity: 5, price: 39.99 }, // Low stock
      
      // Clothing - Women's Dresses
      { name: 'Summer Evening Dress', sku: 'CA-WSED-001', categoryId: categories.find(c => c.name === 'Dresses')?.id, supplierId: suppliers[1]?.id, quantity: 12, minQuantity: 3, price: 89.99 },
      { name: 'Cocktail Party Dress', sku: 'CA-WCPD-002', categoryId: categories.find(c => c.name === 'Dresses')?.id, supplierId: suppliers[1]?.id, quantity: 5, minQuantity: 2, price: 119.99 },
      
      // Home & Garden - Living Room
      { name: 'Modern Sofa', sku: 'HG-MS-001', categoryId: categories.find(c => c.name === 'Living Room')?.id, supplierId: suppliers[2]?.id, quantity: 3, minQuantity: 1, price: 1299.99 },
      { name: 'Coffee Table', sku: 'HG-CT-002', categoryId: categories.find(c => c.name === 'Living Room')?.id, supplierId: suppliers[2]?.id, quantity: 8, minQuantity: 2, price: 299.99 },
      
      // Books - Fiction
      { name: 'The Silent Patient', sku: 'BM-TSA-001', categoryId: categories.find(c => c.name === 'Mystery')?.id, supplierId: suppliers[3]?.id, quantity: 25, minQuantity: 5, price: 14.99 },
      { name: 'Where the Crawdads Sing', sku: 'BM-WTCS-001', categoryId: categories.find(c => c.name === 'Fiction')?.id, supplierId: suppliers[3]?.id, quantity: 18, minQuantity: 3, price: 16.99 },
      
      // Health & Beauty - Skincare
      { name: 'Hydrating Face Cream', sku: 'HB-HFC-001', categoryId: categories.find(c => c.name === 'Skincare')?.id, supplierId: suppliers[4]?.id, quantity: 42, minQuantity: 8, price: 34.99 },
      { name: 'Daily Sunscreen SPF 50', sku: 'HB-DSSPF50-001', categoryId: categories.find(c => c.name === 'Skincare')?.id, supplierId: suppliers[4]?.id, quantity: 15, minQuantity: 5, price: 24.99 },
      
      // Sports Equipment - Team Sports
      { name: 'Soccer Ball', sku: 'SO-SB-001', categoryId: categories.find(c => c.name === 'Team Sports')?.id, supplierId: suppliers[0]?.id, quantity: 60, minQuantity: 15, price: 24.99 },
      { name: 'Basketball', sku: 'SO-BB-001', categoryId: categories.find(c => c.name === 'Team Sports')?.id, supplierId: suppliers[0]?.id, quantity: 45, minQuantity: 10, price: 29.99 },
      
      // Toys - Building
      { name: 'LEGO Architecture Set', sku: 'TG-LA-001', categoryId: categories.find(c => c.name === 'Building')?.id, supplierId: suppliers[1]?.id, quantity: 15, minQuantity: 3, price: 49.99 },
      { name: 'Building Blocks Set', sku: 'TG-BBS-001', categoryId: categories.find(c => c.name === 'Building')?.id, supplierId: suppliers[1]?.id, quantity: 28, minQuantity: 5, price: 39.99 }
    ].filter(p => p.categoryId); // Only include products where the category was found

    // Insert products
    for (const product of sampleProducts) {
      const productId = cuid();
      await client.query(
        `INSERT INTO "InventoryItem" (
          id, name, sku, "categoryId", "supplierId", quantity, "minQuantity", 
          price, "createdAt", "updatedAt", "userId", "isActive"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9, true)`,
        [
          productId, 
          product.name, 
          product.sku, 
          product.categoryId, 
          product.supplierId, 
          product.quantity, 
          product.minQuantity, 
          product.price, 
          userId
        ]
      );
    }

    console.log(`Successfully added ${sampleProducts.length} sample products to the database!`);
  } catch (err) {
    console.error('Error during seeding products:', err);
  } finally {
    await client.end();
  }
}

addSampleProducts();