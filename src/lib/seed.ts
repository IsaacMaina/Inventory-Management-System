import { db } from './db';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // First, let's clear existing data (optional - remove if you don't want to clear)
    // await db.inventoryItem.deleteMany({});
    // await db.category.deleteMany({});

    // Create root categories
    const electronicsCategory = await db.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and components'
      }
    });

    const accessoriesCategory = await db.category.create({
      data: {
        name: 'Accessories',
        description: 'Accessories and peripherals'
      }
    });

    const storageCategory = await db.category.create({
      data: {
        name: 'Storage',
        description: 'Storage devices and media'
      }
    });

    // Create subcategories for Electronics
    const phonesSubcategory = await db.category.create({
      data: {
        name: 'Smartphones',
        description: 'Mobile phones and smartphones',
        parentId: electronicsCategory.id
      }
    });

    const laptopsSubcategory = await db.category.create({
      data: {
        name: 'Laptops',
        description: 'Portable computers',
        parentId: electronicsCategory.id
      }
    });

    const tabletsSubcategory = await db.category.create({
      data: {
        name: 'Tablets',
        description: 'Tablet computers',
        parentId: electronicsCategory.id
      }
    });

    // Create subcategories for Accessories
    const computerAccessoriesSubcategory = await db.category.create({
      data: {
        name: 'Computer Accessories',
        description: 'Accessories for computers',
        parentId: accessoriesCategory.id
      }
    });

    const phoneAccessoriesSubcategory = await db.category.create({
      data: {
        name: 'Phone Accessories',
        description: 'Accessories for mobile devices',
        parentId: accessoriesCategory.id
      }
    });

    // Create sub-subcategories
    const headphonesSubSubcategory = await db.category.create({
      data: {
        name: 'Headphones',
        description: 'Audio headphones',
        parentId: computerAccessoriesSubcategory.id
      }
    });

    const chargingCablesSubSubcategory = await db.category.create({
      data: {
        name: 'Charging Cables',
        description: 'Cables for charging devices',
        parentId: phoneAccessoriesSubcategory.id
      }
    });

    // Create suppliers
    const techSoundSupplier = await db.supplier.create({
      data: {
        name: 'TechSound Inc.',
        email: 'contact@techsound.com',
        phone: '+1-555-0101',
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    const ergoDesignSupplier = await db.supplier.create({
      data: {
        name: 'ErgoDesign Co.',
        email: 'info@ergodesign.com',
        phone: '+1-555-0102',
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    const cableCorpSupplier = await db.supplier.create({
      data: {
        name: 'CableCorp',
        email: 'orders@cablecorp.com',
        phone: '+1-555-0103',
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    // Create products
    await db.inventoryItem.create({
      data: {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        sku: 'WH-001',
        categoryId: headphonesSubSubcategory.id,
        supplierId: techSoundSupplier.id,
        quantity: 42,
        minQuantity: 10,
        price: 99.99,
        cost: 65.50,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand',
        sku: 'LS-002',
        categoryId: computerAccessoriesSubcategory.id,
        supplierId: ergoDesignSupplier.id,
        quantity: 15,
        minQuantity: 5,
        price: 39.99,
        cost: 25.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'USB Cables',
        description: 'Pack of 3 USB Type-C cables, 6ft each',
        sku: 'UC-003',
        categoryId: chargingCablesSubSubcategory.id,
        supplierId: cableCorpSupplier.id,
        quantity: 8,
        minQuantity: 20,
        price: 12.99,
        cost: 5.99,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with brown switches',
        sku: 'MK-004',
        categoryId: computerAccessoriesSubcategory.id,
        supplierId: techSoundSupplier.id,
        quantity: 23,
        minQuantity: 10,
        price: 79.99,
        cost: 45.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'Monitor Arm',
        description: 'Dual monitor arm with gas spring adjustment',
        sku: 'MA-005',
        categoryId: computerAccessoriesSubcategory.id,
        supplierId: ergoDesignSupplier.id,
        quantity: 7,
        minQuantity: 5,
        price: 59.99,
        cost: 35.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'External SSD 1TB',
        description: 'Fast external solid state drive, USB 3.2',
        sku: 'ESSD-006',
        categoryId: storageCategory.id,
        supplierId: techSoundSupplier.id,
        quantity: 31,
        minQuantity: 15,
        price: 129.99,
        cost: 89.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with optical sensor',
        sku: 'WM-007',
        categoryId: computerAccessoriesSubcategory.id,
        supplierId: cableCorpSupplier.id,
        quantity: 19,
        minQuantity: 10,
        price: 29.99,
        cost: 15.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 Pro chip',
        sku: 'IP15P-008',
        categoryId: phonesSubcategory.id,
        supplierId: techSoundSupplier.id,
        quantity: 12,
        minQuantity: 5,
        price: 999.00,
        cost: 750.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    await db.inventoryItem.create({
      data: {
        name: 'MacBook Pro 14"',
        description: 'MacBook Pro with M3 chip, 14-inch display',
        sku: 'MBP14-009',
        categoryId: laptopsSubcategory.id,
        supplierId: techSoundSupplier.id,
        quantity: 6,
        minQuantity: 3,
        price: 1999.00,
        cost: 1500.00,
        userId: 'clx0000000000000000000000' // Placeholder user ID
      }
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.$disconnect();
  }
}

seedDatabase();