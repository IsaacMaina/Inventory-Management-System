// test-pos-functionality.ts
// This script tests the POS functionality end-to-end

import { db } from '@/lib/db';
import { sales, saleItems, inventoryItems, users } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { createSale } from '@/actions/posActions';
import { getDailySalesReport, getSalesByPaymentMethodReport, getTopSellingProducts, getProfitReport, getSalesSummary } from '@/lib/actions/posAnalytics';

async function testPOSFunctionality() {
  console.log('Testing POS functionality...\n');

  try {
    // 1. Test database connectivity
    console.log('1. Testing database connectivity...');
    const userCount = await db.select().from(users).limit(1);
    console.log(`✓ Database connection successful, found ${userCount.length} user(s)\n`);

    // 2. Test creating a sale
    console.log('2. Testing sale creation...');
    
    // Get a sample user (assuming admin user exists)
    const [sampleUser] = await db.select().from(users).where(eq(users.email, 'admin@gmail.com')).limit(1);
    if (!sampleUser) {
      console.log('⚠ Admin user not found, using first available user...');
      const [firstUser] = await db.select().from(users).limit(1);
      if (!firstUser) {
        throw new Error('No users found in database');
      }
      sampleUser = firstUser;
    }

    // Get some sample products
    const sampleProducts = await db
      .select({ id: inventoryItems.id, name: inventoryItems.name, price: inventoryItems.price })
      .from(inventoryItems)
      .limit(2);
    
    if (sampleProducts.length === 0) {
      console.log('⚠ No products found, creating sample products...');
      // Create sample products for testing
      const [sampleCategory] = await db.insert(inventoryItems).values({
        name: 'Sample Product',
        description: 'Test product for POS functionality',
        sku: 'TEST-001',
        categoryId: '1', // This might fail if no category exists
        quantity: 100,
        minQuantity: 10,
        price: 1000, // 1000 cents = KES 10.00
        userId: sampleUser.id,
      }).returning();
      
      if (!sampleCategory) {
        throw new Error('Could not create sample product for testing');
      }
      
      sampleProducts.push(sampleCategory);
    }

    // Create a test sale
    const testSaleData = {
      items: sampleProducts.map((product, index) => ({
        productId: product.id,
        quantity: index + 1, // 1 for first, 2 for second
        priceAtSale: product.price, // Use the actual price from DB
      })),
      totalAmount: sampleProducts.reduce((sum, product, index) => sum + (product.price * (index + 1)), 0),
      paymentMethod: 'mpesa_till' as const,
      mpesaReference: 'TEST123456',
    };

    const saleResult = await createSale(testSaleData);
    
    if (saleResult.success) {
      console.log(`✓ Sale created successfully with ID: ${saleResult.saleId}`);
    } else {
      console.error('✗ Failed to create sale:', saleResult.error);
      return;
    }

    // 3. Test POS analytics
    console.log('\n3. Testing POS analytics...');
    
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Test daily sales report
    const dailySales = await getDailySalesReport(thirtyDaysAgo, today);
    console.log(`✓ Daily sales report: ${dailySales.length} days of data`);
    
    // Test sales by payment method
    const paymentMethods = await getSalesByPaymentMethodReport(thirtyDaysAgo, today);
    console.log(`✓ Sales by payment method: ${paymentMethods.length} methods`);
    
    // Test top selling products
    const topProducts = await getTopSellingProducts(thirtyDaysAgo, today);
    console.log(`✓ Top selling products: ${topProducts.length} products`);
    
    // Test sales summary
    const salesSummary = await getSalesSummary(thirtyDaysAgo, today);
    console.log(`✓ Sales summary: ${salesSummary.totalSales} total sales, KES ${salesSummary.totalAmount / 100} total revenue`);

    console.log('\n✓ All POS functionality tests passed!');
    
  } catch (error) {
    console.error('✗ Error during POS functionality test:', error);
  }
}

// Run the test
testPOSFunctionality();