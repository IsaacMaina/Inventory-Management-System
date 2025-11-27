const { Client } = require('pg');
const cuid = require('cuid');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Hash password function
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Use the DATABASE_URL from environment
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Insert categories with hierarchical structure
    const categories = [
      { name: 'Electronics', parent: null },
      { name: 'Computers', parent: 'Electronics' },
      { name: 'Laptops', parent: 'Computers' },
      { name: 'Desktops', parent: 'Computers' },
      { name: 'Tablets', parent: 'Computers' },
      { name: 'Accessories', parent: 'Computers' },
      { name: 'Phones', parent: 'Electronics' },
      { name: 'Smartphones', parent: 'Phones' },
      { name: 'Feature Phones', parent: 'Phones' },
      { name: 'Phone Accessories', parent: 'Phones' },
      { name: 'Cases', parent: 'Phones' },
      { name: 'Audio & Video', parent: 'Electronics' },
      { name: 'Speakers', parent: 'Audio & Video' },
      { name: 'Headphones', parent: 'Audio & Video' },
      { name: 'TVs', parent: 'Audio & Video' },
      { name: 'Home Theater', parent: 'Audio & Video' },
      
      { name: 'Clothing & Apparel', parent: null },
      { name: 'Men\'s Clothing', parent: 'Clothing & Apparel' },
      { name: 'Shirts', parent: 'Men\'s Clothing' },
      { name: 'Pants', parent: 'Men\'s Clothing' },
      { name: 'Jackets', parent: 'Men\'s Clothing' },
      { name: 'Shoes', parent: 'Men\'s Clothing' },
      { name: 'Women\'s Clothing', parent: 'Clothing & Apparel' },
      { name: 'Dresses', parent: 'Women\'s Clothing' },
      { name: 'Tops', parent: 'Women\'s Clothing' },
      { name: 'Bottoms', parent: 'Women\'s Clothing' },
      { name: 'Footwear', parent: 'Women\'s Clothing' },
      { name: 'Children\'s Clothing', parent: 'Clothing & Apparel' },
      { name: 'Baby', parent: 'Children\'s Clothing' },
      { name: 'Toddler', parent: 'Children\'s Clothing' },
      { name: 'Kids', parent: 'Children\'s Clothing' },
      { name: 'Teens', parent: 'Children\'s Clothing' },
      
      { name: 'Home & Garden', parent: null },
      { name: 'Furniture', parent: 'Home & Garden' },
      { name: 'Living Room', parent: 'Furniture' },
      { name: 'Bedroom', parent: 'Furniture' },
      { name: 'Kitchen', parent: 'Furniture' },
      { name: 'Outdoor', parent: 'Furniture' },
      { name: 'Garden', parent: 'Home & Garden' },
      { name: 'Tools', parent: 'Garden' },
      { name: 'Plants', parent: 'Garden' },
      { name: 'Decor', parent: 'Garden' },
      { name: 'Outdoor Furniture', parent: 'Garden' },
      { name: 'Appliances', parent: 'Home & Garden' },
      { name: 'Kitchen', parent: 'Appliances' },
      { name: 'Laundry', parent: 'Appliances' },
      { name: 'HVAC', parent: 'Appliances' },
      { name: 'Small Appliances', parent: 'Appliances' },
      
      { name: 'Books & Media', parent: null },
      { name: 'Fiction', parent: 'Books & Media' },
      { name: 'Mystery', parent: 'Fiction' },
      { name: 'Romance', parent: 'Fiction' },
      { name: 'Science Fiction', parent: 'Fiction' },
      { name: 'Fantasy', parent: 'Fiction' },
      { name: 'Non-Fiction', parent: 'Books & Media' },
      { name: 'Biography', parent: 'Non-Fiction' },
      { name: 'History', parent: 'Non-Fiction' },
      { name: 'Science', parent: 'Non-Fiction' },
      { name: 'Technology', parent: 'Non-Fiction' },
      { name: 'Media', parent: 'Books & Media' },
      { name: 'Movies', parent: 'Media' },
      { name: 'Music', parent: 'Media' },
      { name: 'Games', parent: 'Media' },
      { name: 'Software', parent: 'Media' },
      
      { name: 'Health & Beauty', parent: null },
      { name: 'Personal Care', parent: 'Health & Beauty' },
      { name: 'Skincare', parent: 'Personal Care' },
      { name: 'Haircare', parent: 'Personal Care' },
      { name: 'Bath & Body', parent: 'Personal Care' },
      { name: 'Fragrances', parent: 'Personal Care' },
      { name: 'Vitamins & Supplements', parent: 'Health & Beauty' },
      { name: 'Multivitamins', parent: 'Vitamins & Supplements' },
      { name: 'Herbal Supplements', parent: 'Vitamins & Supplements' },
      { name: 'Protein', parent: 'Vitamins & Supplements' },
      { name: 'Specialty Supplements', parent: 'Vitamins & Supplements' },
      { name: 'Wellness', parent: 'Health & Beauty' },
      { name: 'Fitness Equipment', parent: 'Wellness' },
      { name: 'Yoga & Pilates', parent: 'Wellness' },
      { name: 'Meditation', parent: 'Wellness' },
      { name: 'Massage', parent: 'Wellness' },
      
      { name: 'Sports & Outdoors', parent: null },
      { name: 'Sports Equipment', parent: 'Sports & Outdoors' },
      { name: 'Team Sports', parent: 'Sports Equipment' },
      { name: 'Individual Sports', parent: 'Sports Equipment' },
      { name: 'Water Sports', parent: 'Sports Equipment' },
      { name: 'Winter Sports', parent: 'Sports Equipment' },
      { name: 'Outdoor Recreation', parent: 'Sports & Outdoors' },
      { name: 'Camping', parent: 'Outdoor Recreation' },
      { name: 'Hiking', parent: 'Outdoor Recreation' },
      { name: 'Cycling', parent: 'Outdoor Recreation' },
      { name: 'Fishing', parent: 'Outdoor Recreation' },
      { name: 'Exercise & Fitness', parent: 'Sports & Outdoors' },
      { name: 'Cardio Equipment', parent: 'Exercise & Fitness' },
      { name: 'Strength Training', parent: 'Exercise & Fitness' },
      { name: 'Flexibility', parent: 'Exercise & Fitness' },
      { name: 'Accessories', parent: 'Exercise & Fitness' },
      
      { name: 'Toys & Games', parent: null },
      { name: 'Educational Toys', parent: 'Toys & Games' },
      { name: 'Science', parent: 'Educational Toys' },
      { name: 'Building', parent: 'Educational Toys' },
      { name: 'Art & Craft', parent: 'Educational Toys' },
      { name: 'Math & Logic', parent: 'Educational Toys' },
      { name: 'Action Figures', parent: 'Toys & Games' },
      { name: 'Superheroes', parent: 'Action Figures' },
      { name: 'Movie Characters', parent: 'Action Figures' },
      { name: 'Animals', parent: 'Action Figures' },
      { name: 'Vehicles', parent: 'Action Figures' },
      { name: 'Board Games', parent: 'Toys & Games' },
      { name: 'Strategy', parent: 'Board Games' },
      { name: 'Family', parent: 'Board Games' },
      { name: 'Party', parent: 'Board Games' },
      { name: 'Card Games', parent: 'Board Games' },
      
      { name: 'Food & Grocery', parent: null },
      { name: 'Fresh Produce', parent: 'Food & Grocery' },
      { name: 'Fruits', parent: 'Fresh Produce' },
      { name: 'Vegetables', parent: 'Fresh Produce' },
      { name: 'Herbs', parent: 'Fresh Produce' },
      { name: 'Organic', parent: 'Fresh Produce' },
      { name: 'Packaged Foods', parent: 'Food & Grocery' },
      { name: 'Snacks', parent: 'Packaged Foods' },
      { name: 'Frozen', parent: 'Packaged Foods' },
      { name: 'Canned', parent: 'Packaged Foods' },
      { name: 'Dry Goods', parent: 'Packaged Foods' },
      { name: 'Beverages', parent: 'Food & Grocery' },
      { name: 'Juices', parent: 'Beverages' },
      { name: 'Coffee', parent: 'Beverages' },
      { name: 'Tea', parent: 'Beverages' },
      { name: 'Soft Drinks', parent: 'Beverages' },
      
      { name: 'Automotive', parent: null },
      { name: 'Parts & Accessories', parent: 'Automotive' },
      { name: 'Engine', parent: 'Parts & Accessories' },
      { name: 'Tires & Wheels', parent: 'Parts & Accessories' },
      { name: 'Brakes', parent: 'Parts & Accessories' },
      { name: 'Interior', parent: 'Parts & Accessories' },
      { name: 'Tools & Equipment', parent: 'Automotive' },
      { name: 'Hand Tools', parent: 'Tools & Equipment' },
      { name: 'Power Tools', parent: 'Tools & Equipment' },
      { name: 'Diagnostic Equipment', parent: 'Tools & Equipment' },
      { name: 'Lifts & Jacks', parent: 'Tools & Equipment' },
      { name: 'Maintenance', parent: 'Automotive' },
      { name: 'Fluids', parent: 'Maintenance' },
      { name: 'Filters', parent: 'Maintenance' },
      { name: 'Cleaning', parent: 'Maintenance' },
      { name: 'Performance', parent: 'Maintenance' },
      
      { name: 'Pet Supplies', parent: null },
      { name: 'Dogs', parent: 'Pet Supplies' },
      { name: 'Food', parent: 'Dogs' },
      { name: 'Toys', parent: 'Dogs' },
      { name: 'Accessories', parent: 'Dogs' },
      { name: 'Health', parent: 'Dogs' },
      { name: 'Cats', parent: 'Pet Supplies' },
      { name: 'Food', parent: 'Cats' },
      { name: 'Toys', parent: 'Cats' },
      { name: 'Litter', parent: 'Cats' },
      { name: 'Health', parent: 'Cats' },
      { name: 'Other Pets', parent: 'Pet Supplies' },
      { name: 'Birds', parent: 'Other Pets' },
      { name: 'Fish', parent: 'Other Pets' },
      { name: 'Small Animals', parent: 'Other Pets' },
      { name: 'Reptiles', parent: 'Other Pets' },
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

    // Create or update the admin user with secure password
    const hashedPassword = await hashPassword('admin123'); // Default password

    // Check if admin user already exists
    const existingUser = await client.query(
      'SELECT id FROM "User" WHERE email = $1',
      ['admin@example.com']
    );

    if (existingUser.rows.length > 0) {
      // Update existing admin user
      await client.query(
        'UPDATE "User" SET password = $1, name = $2, role = $3, "updatedAt" = NOW() WHERE email = $4',
        [hashedPassword, 'Admin User', 'admin', 'admin@example.com']
      );
      console.log('Admin user updated with email: admin@example.com and new hashed password');
    } else {
      // Create new admin user
      const userId = cuid();
      await client.query(
        'INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt", password, "isActive") VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, true)',
        [userId, 'admin@example.com', 'Admin User', 'admin', hashedPassword]
      );
      console.log('Admin user created with email: admin@example.com and hashed password');
    }

    // Create sample suppliers
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

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

seedDatabase();