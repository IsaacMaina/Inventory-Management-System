// seed-data.js - Script to populate the database with sample data

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const cuid = require('cuid');

async function seedDatabase() {
  console.log("Starting database seeding...");
  
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

    // Get the admin user id
    const adminResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@gmail.com']
    );
    
    if (adminResult.rows.length === 0) {
      console.error("❌ Admin user not found. Please create an admin user first.");
      return;
    }
    
    const adminUserId = adminResult.rows[0].id;
    console.log(`✅ Found admin user with ID: ${adminUserId}`);

    // Seed categories
    console.log("🌱 Seeding categories...");
    const categories = [
      { id: cuid(), name: 'Electronics', description: 'Electronic devices and components' },
      { id: cuid(), name: 'Clothing', description: 'Apparel and accessories' },
      { id: cuid(), name: 'Food & Beverages', description: 'Edible items and drinks' },
      { id: cuid(), name: 'Office Supplies', description: 'Stationery and office materials' },
      { id: cuid(), name: 'Home & Garden', description: 'Household and gardening items' },
      { id: cuid(), name: 'Sports & Recreation', description: 'Sports equipment and recreational items' },
      { id: cuid(), name: 'Automotive', description: 'Car parts and accessories' },
      { id: cuid(), name: 'Health & Beauty', description: 'Health and beauty products' },
    ];

    for (const category of categories) {
      try {
        await client.query(`
          INSERT INTO categories (id, name, description, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [category.id, category.name, category.description]);
      } catch (error) {
        // If it's a duplicate key error, skip it
        if (error.code !== '23505') {
          throw error;
        }
      }
    }

    // Get category IDs
    const categoryResults = await client.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categoryResults.rows.forEach(row => {
      categoryMap[row.name] = row.id;
    });

    // Seed suppliers
    console.log("🚚 Seeding suppliers...");
    const suppliers = [
      { id: cuid(), name: 'TechGadgets Inc.', email: 'contact@techgadgets.com', phone: '+1234567890', address: '123 Tech Street, Silicon Valley, CA' },
      { id: cuid(), name: 'FashionHub Ltd.', email: 'info@fashionhub.com', phone: '+1987654321', address: '456 Fashion Ave, New York, NY' },
      { id: cuid(), name: 'FoodSupplies Co.', email: 'orders@foodsupplies.com', phone: '+1555123456', address: '789 Food Blvd, Chicago, IL' },
      { id: cuid(), name: 'OfficePro Solutions', email: 'support@officepro.com', phone: '+1444987654', address: '321 Office Way, Seattle, WA' },
      { id: cuid(), name: 'GardenTools Unlimited', email: 'sales@gardentools.com', phone: '+1333654321', address: '654 Garden Ln, Portland, OR' },
    ];

    for (const supplier of suppliers) {
      try {
        await client.query(`
          INSERT INTO suppliers (id, name, email, phone, address, user_id, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `, [supplier.id, supplier.name, supplier.email, supplier.phone, supplier.address, adminUserId, true]);
      } catch (error) {
        // If it's a duplicate key error, skip it
        if (error.code !== '23505') {
          throw error;
        }
      }
    }

    // Get supplier IDs
    const supplierResults = await client.query('SELECT id, name FROM suppliers');
    const supplierMap = {};
    supplierResults.rows.forEach(row => {
      supplierMap[row.name] = row.id;
    });

    // Seed inventory items
    console.log("📦 Seeding inventory items...");
    const inventoryItems = [
      { 
        id: cuid(), 
        name: 'Laptop Computer', 
        description: 'High-performance laptop for work and gaming',
        sku: 'LAP-001',
        barcode: '1234567890123',
        categoryId: categoryMap['Electronics'],
        supplierId: supplierMap['TechGadgets Inc.'],
        quantity: 25,
        minQuantity: 5,
        price: 129999, // in cents
        cost: 109999, // in cents
        location: 'Aisle A, Shelf 1',
        notes: 'Latest model with 16GB RAM and 512GB SSD',
        images: ['https://example.com/laptop.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Wireless Mouse', 
        description: 'Ergonomic wireless mouse with long battery life',
        sku: 'MOU-001',
        barcode: '1234567890124',
        categoryId: categoryMap['Electronics'],
        supplierId: supplierMap['TechGadgets Inc.'],
        quantity: 75,
        minQuantity: 10,
        price: 2999, // in cents
        cost: 1999, // in cents
        location: 'Aisle A, Shelf 2',
        notes: 'Ergonomic design for comfort',
        images: ['https://example.com/mouse.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Cotton T-Shirt', 
        description: 'Comfortable cotton t-shirt for everyday wear',
        sku: 'TSHT-001',
        barcode: '1234567890125',
        categoryId: categoryMap['Clothing'],
        supplierId: supplierMap['FashionHub Ltd.'],
        quantity: 120,
        minQuantity: 20,
        price: 1999, // in cents
        cost: 1299, // in cents
        location: 'Aisle B, Shelf 1',
        notes: 'Available in multiple colors and sizes',
        images: ['https://example.com/tshirt.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Office Chair', 
        description: 'Ergonomic office chair with lumbar support',
        sku: 'OFC-001',
        barcode: '1234567890126',
        categoryId: categoryMap['Office Supplies'],
        supplierId: supplierMap['OfficePro Solutions'],
        quantity: 15,
        minQuantity: 3,
        price: 24999, // in cents
        cost: 19999, // in cents
        location: 'Aisle C, Shelf 1',
        notes: 'Adjustable height and armrests',
        images: ['https://example.com/chair.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Garden Shovel', 
        description: 'Durable steel garden shovel for digging',
        sku: 'SHV-001',
        barcode: '1234567890127',
        categoryId: categoryMap['Home & Garden'],
        supplierId: supplierMap['GardenTools Unlimited'],
        quantity: 30,
        minQuantity: 5,
        price: 2499, // in cents
        cost: 1799, // in cents
        location: 'Aisle D, Shelf 1',
        notes: 'Ergonomic handle for comfort',
        images: ['https://example.com/shovel.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Running Shoes', 
        description: 'High-performance running shoes',
        sku: 'RNS-001',
        barcode: '1234567890128',
        categoryId: categoryMap['Sports & Recreation'],
        supplierId: supplierMap['FashionHub Ltd.'],
        quantity: 40,
        minQuantity: 8,
        price: 8999, // in cents
        cost: 6499, // in cents
        location: 'Aisle E, Shelf 1',
        notes: 'Breathable material and cushioned sole',
        images: ['https://example.com/shoes.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Motor Oil', 
        description: 'Synthetic motor oil for cars',
        sku: 'MO-001',
        barcode: '1234567890129',
        categoryId: categoryMap['Automotive'],
        supplierId: supplierMap['TechGadgets Inc.'],
        quantity: 60,
        minQuantity: 15,
        price: 3499, // in cents
        cost: 2499, // in cents
        location: 'Aisle F, Shelf 1',
        notes: '5W-30 synthetic formula',
        images: ['https://example.com/motoroil.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Face Cream', 
        description: 'Moisturizing face cream',
        sku: 'FC-001',
        barcode: '1234567890130',
        categoryId: categoryMap['Health & Beauty'],
        supplierId: supplierMap['FashionHub Ltd.'],
        quantity: 85,
        minQuantity: 10,
        price: 1599, // in cents
        cost: 999, // in cents
        location: 'Aisle G, Shelf 1',
        notes: 'With SPF 30 protection',
        images: ['https://example.com/facecream.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Bluetooth Speaker', 
        description: 'Waterproof portable speaker',
        sku: 'SPK-001',
        barcode: '1234567890131',
        categoryId: categoryMap['Electronics'],
        supplierId: supplierMap['TechGadgets Inc.'],
        quantity: 35,
        minQuantity: 7,
        price: 7999, // in cents
        cost: 5499, // in cents
        location: 'Aisle A, Shelf 3',
        notes: '360° sound and 20h battery life',
        images: ['https://example.com/speaker.jpg'],
        userId: adminUserId
      },
      { 
        id: cuid(), 
        name: 'Coffee Beans', 
        description: 'Premium Arabica coffee beans',
        sku: 'CB-001',
        barcode: '1234567890132',
        categoryId: categoryMap['Food & Beverages'],
        supplierId: supplierMap['FoodSupplies Co.'],
        quantity: 90,
        minQuantity: 15,
        price: 1499, // in cents
        cost: 899, // in cents
        location: 'Aisle H, Shelf 1',
        notes: 'Medium roast, 1lb bag',
        images: ['https://example.com/coffee.jpg'],
        userId: adminUserId
      }
    ];

    for (const item of inventoryItems) {
      try {
        await client.query(`
          INSERT INTO inventory_items (
            id, name, description, sku, barcode, category_id, supplier_id,
            quantity, min_quantity, price, cost, location, notes, images,
            user_id, is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        `, [
          item.id, item.name, item.description, item.sku, item.barcode,
          item.categoryId, item.supplierId, item.quantity, item.minQuantity,
          item.price, item.cost, item.location, item.notes, item.images,
          item.userId, true
        ]);
      } catch (error) {
        // If it's a duplicate key error for SKU, skip it
        if (error.code !== '23505') {
          throw error;
        }
      }
    }

    // Seed some inventory transactions
    console.log("🔄 Seeding inventory transactions...");
    const transactionTypes = ['in', 'out', 'adjustment'];
    
    for (let i = 0; i < 50; i++) {
      const transaction = {
        id: cuid(),
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        quantity: Math.floor(Math.random() * 20) + 1, // 1-20
        notes: `Sample transaction #${i+1}`,
        inventoryItemId: inventoryItems[Math.floor(Math.random() * inventoryItems.length)].id,
        userId: adminUserId
      };

      await client.query(`
        INSERT INTO inventory_transactions (
          id, type, quantity, notes, inventory_item_id, user_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        transaction.id, 
        transaction.type, 
        transaction.quantity, 
        transaction.notes, 
        transaction.inventoryItemId, 
        transaction.userId
      ]);
    }

    // Seed some reports
    console.log("📊 Seeding reports...");
    const reportTypes = ['stock', 'sales', 'analytics', 'inventory'];
    
    for (let i = 0; i < 10; i++) {
      const report = {
        id: cuid(),
        name: `Monthly Report ${i+1}`,
        type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
        filters: JSON.stringify({ month: i + 1, year: 2024 }),
        userId: adminUserId
      };

      try {
        await client.query(`
          INSERT INTO reports (
            id, name, type, filters, user_id, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [
          report.id,
          report.name,
          report.type,
          report.filters,
          report.userId
        ]);
      } catch (error) {
        // If it's a duplicate key error, skip it
        if (error.code !== '23505') {
          throw error;
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Sample data includes:');
    console.log(`  - ${categories.length} categories`);
    console.log(`  - ${suppliers.length} suppliers`);
    console.log(`  - ${inventoryItems.length} inventory items`);
    console.log(`  - 50 inventory transactions`);
    console.log(`  - 10 reports`);

  } catch (error) {
    console.error('❌ Error during seeding:', error.message || error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
seedDatabase();