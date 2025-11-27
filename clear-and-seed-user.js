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

async function clearAndSeedUserData(userId) {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Disable triggers temporarily to avoid foreign key constraint issues
    await client.query('SET session_replication_role = replica;');

    // Clear all tables except User
    const tablesToClear = [
      'public."InventoryTransaction"',
      'public."InventoryItem"',
      'public."Notification"',
      'public."Report"',
      'public."Supplier"',
      'public."Category"'
    ];

    console.log('Clearing data from tables...');
    for (const table of tablesToClear) {
      await client.query(`DELETE FROM ${table};`);
      console.log(`Cleared data from ${table}`);
    }

    // Re-enable triggers
    await client.query('SET session_replication_role = DEFAULT;');

    console.log('All app data cleared except user data.');

    // Verify if the specific user exists
    const userResult = await client.query(
      'SELECT id, email, name FROM "User" WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ User with ID ${userId} not found in the database!`);
      return;
    }

    const user = userResult.rows[0];
    console.log(`✅ User found: ${user.email} (${user.name})`);

    // Create base categories for the user
    const categories = [
      { name: 'Electronics', parent: null },
      { name: 'Laptops', parent: 'Electronics' },
      { name: 'Smartphones', parent: 'Electronics' },
      { name: 'Headphones', parent: 'Electronics' },
      { name: 'Clothing & Apparel', parent: null },
      { name: 'Shirts', parent: 'Clothing & Apparel' },
      { name: 'Dresses', parent: 'Clothing & Apparel' },
      { name: 'Home & Garden', parent: null },
      { name: 'Living Room', parent: 'Home & Garden' },
      { name: 'Books & Media', parent: null },
      { name: 'Fiction', parent: 'Books & Media' },
      { name: 'Mystery', parent: 'Books & Media' },
      { name: 'Health & Beauty', parent: null },
      { name: 'Skincare', parent: 'Health & Beauty' },
      { name: 'Sports & Outdoors', parent: null },
      { name: 'Team Sports', parent: 'Sports & Outdoors' },
      { name: 'Toys & Games', parent: null },
      { name: 'Building', parent: 'Toys & Games' },
    ];

    // Create lookup for category IDs
    const categoryIds = {};

    // Create categories one by one to handle hierarchical references properly
    for (const cat of categories) {
      const id = cuid();
      if (cat.parent === null) {
        // Root category
        const result = await client.query(
          'INSERT INTO "Category" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
          [id, cat.name]
        );
        categoryIds[cat.name] = result.rows[0].id;
      } else {
        // Child category - find parent ID
        const parentId = categoryIds[cat.parent];
        if (parentId) {
          const result = await client.query(
            'INSERT INTO "Category" (id, name, "parentId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
            [id, cat.name, parentId]
          );
          categoryIds[cat.name] = result.rows[0].id;
        } else {
          console.log(`Warning: Parent category "${cat.parent}" not found for "${cat.name}"`);
        }
      }
    }

    // Create sample suppliers for the user
    const suppliers = [
      { name: 'ElectroTech Supplies', email: 'contact@electrotech.com', phone: '+1234567890', address: '123 Tech St, Silicon Valley' },
      { name: 'Fashion Forward', email: 'orders@fashionforward.com', phone: '+1234567891', address: '456 Style Ave, New York' },
      { name: 'Home Essentials', email: 'info@homeessentials.com', phone: '+1234567892', address: '789 Comfort Blvd, Chicago' },
      { name: 'Book Haven Distributors', email: 'supplies@bookhaven.com', phone: '+1234567893', address: '321 Literature Ln, Boston' },
      { name: 'Wellness World', email: 'support@wellnessworld.com', phone: '+1234567894', address: '654 Health Rd, Miami' },
    ];

    for (const supplier of suppliers) {
      const supplierId = cuid();
      await client.query(
        'INSERT INTO "Supplier" (id, name, email, phone, address, "createdAt", "updatedAt", "userId", "isActive") VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, true)',
        [supplierId, supplier.name, supplier.email, supplier.phone, supplier.address, userId]
      );
    }

    // Get suppliers for product insertion
    const supplierResult = await client.query('SELECT id FROM "Supplier" WHERE "userId" = $1', [userId]);
    const suppliersForUser = supplierResult.rows;

    // Get categories for product insertion
    const categoryResult = await client.query('SELECT id, name FROM "Category"');
    const categoriesForProducts = categoryResult.rows;

    // Create sample products for the user
    const sampleProducts = [
      // Electronics - Laptops
      { name: 'MacBook Pro 16"', sku: 'ELP-MBP16-2023', categoryId: categoriesForProducts.find(c => c.name === 'Laptops')?.id, supplierId: suppliersForUser[0]?.id, quantity: 10, minQuantity: 2, price: 2499.99 },
      { name: 'Dell XPS 13', sku: 'ELP-DX13-2023', categoryId: categoriesForProducts.find(c => c.name === 'Laptops')?.id, supplierId: suppliersForUser[0]?.id, quantity: 15, minQuantity: 3, price: 1299.99 },
      { name: 'HP Spectre x360', sku: 'ELP-HPS360-2023', categoryId: categoriesForProducts.find(c => c.name === 'Laptops')?.id, supplierId: suppliersForUser[0]?.id, quantity: 8, minQuantity: 2, price: 1599.99 },

      // Electronics - Smartphones
      { name: 'iPhone 15 Pro', sku: 'ELP-IP15P-2023', categoryId: categoriesForProducts.find(c => c.name === 'Smartphones')?.id, supplierId: suppliersForUser[0]?.id, quantity: 25, minQuantity: 5, price: 999.99 },
      { name: 'Samsung Galaxy S24', sku: 'ELP-SGS24-2024', categoryId: categoriesForProducts.find(c => c.name === 'Smartphones')?.id, supplierId: suppliersForUser[0]?.id, quantity: 20, minQuantity: 4, price: 899.99 },

      // Electronics - Headphones
      { name: 'Sony WH-1000XM5', sku: 'ELP-SWH1000-2023', categoryId: categoriesForProducts.find(c => c.name === 'Headphones')?.id, supplierId: suppliersForUser[0]?.id, quantity: 30, minQuantity: 5, price: 349.99 },
      { name: 'AirPods Pro', sku: 'ELP-APRO-2022', categoryId: categoriesForProducts.find(c => c.name === 'Headphones')?.id, supplierId: suppliersForUser[0]?.id, quantity: 0, minQuantity: 3, price: 249.99 }, // Out of stock

      // Clothing - Men's Shirts
      { name: 'Classic White Dress Shirt', sku: 'CA-MWS-001', categoryId: categoriesForProducts.find(c => c.name === 'Shirts')?.id, supplierId: suppliersForUser[1]?.id, quantity: 50, minQuantity: 10, price: 49.99 },
      { name: 'Casual Button-Down', sku: 'CA-MCB-002', categoryId: categoriesForProducts.find(c => c.name === 'Shirts')?.id, supplierId: suppliersForUser[1]?.id, quantity: 7, minQuantity: 5, price: 39.99 }, // Low stock

      // Clothing - Women's Dresses
      { name: 'Summer Evening Dress', sku: 'CA-WSED-001', categoryId: categoriesForProducts.find(c => c.name === 'Dresses')?.id, supplierId: suppliersForUser[1]?.id, quantity: 12, minQuantity: 3, price: 89.99 },
      { name: 'Cocktail Party Dress', sku: 'CA-WCPD-002', categoryId: categoriesForProducts.find(c => c.name === 'Dresses')?.id, supplierId: suppliersForUser[1]?.id, quantity: 5, minQuantity: 2, price: 119.99 },

      // Home & Garden - Living Room
      { name: 'Modern Sofa', sku: 'HG-MS-001', categoryId: categoriesForProducts.find(c => c.name === 'Living Room')?.id, supplierId: suppliersForUser[2]?.id, quantity: 3, minQuantity: 1, price: 1299.99 },
      { name: 'Coffee Table', sku: 'HG-CT-002', categoryId: categoriesForProducts.find(c => c.name === 'Living Room')?.id, supplierId: suppliersForUser[2]?.id, quantity: 8, minQuantity: 2, price: 299.99 },

      // Books - Fiction
      { name: 'The Silent Patient', sku: 'BM-TSA-001', categoryId: categoriesForProducts.find(c => c.name === 'Mystery')?.id, supplierId: suppliersForUser[3]?.id, quantity: 25, minQuantity: 5, price: 14.99 },
      { name: 'Where the Crawdads Sing', sku: 'BM-WTCS-001', categoryId: categoriesForProducts.find(c => c.name === 'Fiction')?.id, supplierId: suppliersForUser[3]?.id, quantity: 18, minQuantity: 3, price: 16.99 },

      // Health & Beauty - Skincare
      { name: 'Hydrating Face Cream', sku: 'HB-HFC-001', categoryId: categoriesForProducts.find(c => c.name === 'Skincare')?.id, supplierId: suppliersForUser[4]?.id, quantity: 42, minQuantity: 8, price: 34.99 },
      { name: 'Daily Sunscreen SPF 50', sku: 'HB-DSSPF50-001', categoryId: categoriesForProducts.find(c => c.name === 'Skincare')?.id, supplierId: suppliersForUser[4]?.id, quantity: 15, minQuantity: 5, price: 24.99 },

      // Sports Equipment - Team Sports
      { name: 'Soccer Ball', sku: 'SO-SB-001', categoryId: categoriesForProducts.find(c => c.name === 'Team Sports')?.id, supplierId: suppliersForUser[0]?.id, quantity: 60, minQuantity: 15, price: 24.99 },
      { name: 'Basketball', sku: 'SO-BB-001', categoryId: categoriesForProducts.find(c => c.name === 'Team Sports')?.id, supplierId: suppliersForUser[0]?.id, quantity: 45, minQuantity: 10, price: 29.99 },

      // Toys - Building
      { name: 'LEGO Architecture Set', sku: 'TG-LA-001', categoryId: categoriesForProducts.find(c => c.name === 'Building')?.id, supplierId: suppliersForUser[1]?.id, quantity: 15, minQuantity: 3, price: 49.99 },
      { name: 'Building Blocks Set', sku: 'TG-BBS-001', categoryId: categoriesForProducts.find(c => c.name === 'Building')?.id, supplierId: suppliersForUser[1]?.id, quantity: 28, minQuantity: 5, price: 39.99 }
    ].filter(p => p.categoryId && p.supplierId); // Only include products where the category and supplier were found

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

    console.log(`✅ Successfully added ${sampleProducts.length} sample products to the database for user ${userId}!`);

    // Create some sample inventory transactions
    const sampleTransactions = [
      { type: 'IN', quantity: 10, inventoryItemId: null, notes: 'Initial stock' },
      { type: 'OUT', quantity: 2, inventoryItemId: null, notes: 'Customer sale' },
      { type: 'IN', quantity: 5, inventoryItemId: null, notes: 'Reorder' },
    ];

    // Get some inventory items to create transactions for
    const inventoryItems = await client.query(
      'SELECT id FROM "InventoryItem" WHERE "userId" = $1 LIMIT 3',
      [userId]
    );

    for (let i = 0; i < Math.min(sampleTransactions.length, inventoryItems.rows.length); i++) {
      const transaction = sampleTransactions[i];
      const inventoryItem = inventoryItems.rows[i];
      const transactionId = cuid();
      
      await client.query(
        `INSERT INTO "InventoryTransaction" (
          id, type, quantity, notes, "createdAt", "inventoryItemId", "userId"
        ) VALUES ($1, $2, $3, $4, NOW(), $5, $6)`,
        [
          transactionId,
          transaction.type,
          transaction.quantity,
          transaction.notes,
          inventoryItem.id,
          userId
        ]
      );
    }

    console.log('✅ Sample inventory transactions added.');

    // Create sample reports
    const reports = [
      { name: 'Monthly Inventory Report', type: 'inventory' },
      { name: 'Low Stock Alert', type: 'low-stock' },
      { name: 'Sales Report', type: 'sales' },
    ];

    for (const report of reports) {
      const reportId = cuid();
      await client.query(
        `INSERT INTO "Report" (
          id, name, type, filters, "createdAt", "updatedAt", "userId"
        ) VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)`,
        [
          reportId,
          report.name,
          report.type,
          JSON.stringify({ dateRange: 'lastMonth' }),
          userId
        ]
      );
    }

    console.log('✅ Sample reports added.');

    // Create sample notifications
    const notifications = [
      { type: 'info', title: 'Welcome', message: 'Welcome to your inventory management system!' },
      { type: 'warning', title: 'Low Stock', message: 'Some items are running low on stock.' },
      { type: 'success', title: 'Setup Complete', message: 'Your inventory system is ready to use.' },
    ];

    for (const notification of notifications) {
      const notificationId = cuid();
      await client.query(
        `INSERT INTO "Notification" (
          id, type, title, message, "createdAt", "userId", "isRead"
        ) VALUES ($1, $2, $3, $4, NOW(), $5, false)`,
        [
          notificationId,
          notification.type,
          notification.title,
          notification.message,
          userId
        ]
      );
    }

    console.log('✅ Sample notifications added.');

    console.log(`\\n🎉 All data cleared and new data seeded for user: ${userId}`);
    console.log(`👤 User email: ${user.email}`);
    console.log(`📊 Created: ${categories.length} categories, ${suppliers.length} suppliers, ${sampleProducts.length} products`);

  } catch (err) {
    console.error('❌ Error during clearing and seeding:', err);
  } finally {
    await client.end();
  }
}

// Get user ID from command line arguments or use default
const userId = process.argv[2] || 'cmig9vhbm0000q4ihhog68uss';

clearAndSeedUserData(userId);