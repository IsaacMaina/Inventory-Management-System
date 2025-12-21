// src/actions/posActions.ts

'use server';

import { db } from '@/lib/db';
import { sales, saleItems, inventoryItems, inventoryTransactions, users } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { inventoryTransactionTypeEnum } from '../../drizzle/schema';
import { UserRole } from '@/lib/authorization';

// Zod schema for validating sale data
const CreateSaleSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      priceAtSale: z.number().int().nonnegative(),
    })
  ),
  totalAmount: z.number().int().nonnegative(),
  paymentMethod: z.enum(['mpesa_send', 'mpesa_paybill', 'mpesa_till', 'mpesa_pochi']),
  mpesaReference: z.string().optional(),
  customerPhone: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;

export async function createSale(input: CreateSaleInput) {
  try {
    // Validate input
    const validatedInput = CreateSaleSchema.parse(input);

    // Get current user
    const user = await getCurrentUserFromSession();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user has permission to create sales
    // The user.role is already an enum value from UserRole, so we need to check against enum values
    if (![
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.USER
    ].includes(user.role)) {
      throw new Error(`Insufficient permissions to create sales. Role: ${user.role}`);
    }

    // Check if customer phone is provided for M-Pesa prompt
    if (validatedInput.customerPhone && validatedInput.paymentMethod) {
      // If customer phone is provided, attempt to send M-Pesa prompt
      // This would call the M-Pesa Daraja API to send a prompt to customer
      try {
        const mpesaResult = await initiateMpesaPayment({
          phone: validatedInput.customerPhone,
          amount: validatedInput.totalAmount / 100, // Convert from cents to actual amount
          reference: `POS-${Date.now()}`, // Generate a reference for the transaction
          description: 'POS Sale',
          paymentMethod: validatedInput.paymentMethod
        });

        // If M-Pesa prompt was successful, update the sale with the reference
        validatedInput.mpesaReference = mpesaResult.MerchantRequestID || mpesaResult.CheckoutRequestID;
      } catch (mpesaError) {
        console.error('Error initiating M-Pesa payment:', mpesaError);
        return {
          success: false,
          error: 'Failed to initiate M-Pesa payment. Please check credentials and try again.',
        };
      }
    }

    // Start a transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Create the sale record
      const [newSale] = await tx.insert(sales).values({
        totalAmount: validatedInput.totalAmount,
        paymentMethod: validatedInput.paymentMethod,
        mpesaReference: validatedInput.mpesaReference,
        status: validatedInput.customerPhone ? 'pending' : 'paid', // Mark as pending if M-Pesa prompt sent, paid if manual
        cashierId: user.id,
      }).returning();

      // Process each item in the sale
      for (const item of validatedInput.items) {
        // Get the current product to check stock
        const [product] = await tx
          .select({
            id: inventoryItems.id,
            name: inventoryItems.name,
            quantity: inventoryItems.quantity,
            price: inventoryItems.price,
          })
          .from(inventoryItems)
          .where(eq(inventoryItems.id, item.productId));

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
        }

        // Create the sale item record
        await tx.insert(saleItems).values({
          saleId: newSale.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
        });

        // Update inventory quantity (reduce stock)
        // Ensure both values are valid numbers before calculation
        const currentQuantity = Number(product.quantity);
        const quantityToReduce = Number(item.quantity);

        if (isNaN(currentQuantity) || isNaN(quantityToReduce)) {
          throw new Error(`Invalid quantity values for product ${item.productId}: current=${currentQuantity}, requested=${quantityToReduce}`);
        }

        const newQuantity = currentQuantity - quantityToReduce;

        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for ${product.name}. Requested: ${quantityToReduce}, Available: ${currentQuantity}`);
        }

        await tx
          .update(inventoryItems)
          .set({
            quantity: newQuantity,
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, item.productId));

        // Create inventory transaction record for tracking
        await tx.insert(inventoryTransactions).values({
          type: inventoryTransactionTypeEnum.enumValues[1], // 'out' transaction
          quantity: -item.quantity, // Negative because it's going out
          notes: `POS sale #${newSale.id.substring(0, 8)}`,
          inventoryItemId: item.productId,
          userId: user.id,
        });
      }

      // Revalidate the dashboard and products page to reflect updated inventory
      revalidatePath('/dashboard');
      revalidatePath('/products');
      revalidatePath('/pos');

      return {
        success: true,
        saleId: newSale.id,
        message: validatedInput.customerPhone
          ? 'M-Pesa prompt sent to customer. Sale will be completed when payment is confirmed.'
          : 'Sale completed successfully',
        mpesaReference: validatedInput.mpesaReference
      };
    });
  } catch (error) {
    console.error('Error creating sale:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create sale',
    };
  }
}

// Function to initiate M-Pesa payment via Daraja API
async function initiateMpesaPayment({
  phone,
  amount,
  reference,
  description,
  paymentMethod
}: {
  phone: string;
  amount: number;
  reference: string;
  description: string;
  paymentMethod: string;
}) {
  // In a real implementation, this would call the M-Pesa Daraja API
  // For now, this is a placeholder that simulates the API call

  // Remove any non-numeric characters from phone number and ensure it starts with 254
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  } else if (formattedPhone.length === 9 && formattedPhone.startsWith('7')) {
    formattedPhone = '254' + formattedPhone;
  }

  // Validate phone number format
  if (!/^(254|\+?254)?[7]\d{8}$/.test(formattedPhone)) {
    throw new Error('Invalid phone number format. Use format like 07XX XXX XXX or +2547XX XXX XXX');
  }

  // This is where the actual M-Pesa API call would happen
  // For demonstration purposes, I'll return mock data
  console.log(`M-Pesa payment initiated:`, {
    phone: formattedPhone,
    amount,
    reference,
    description,
    paymentMethod
  });

  // In a real implementation, this would make an API call to Safaricom's Daraja API
  // The actual implementation would vary based on which M-Pesa service is used:
  // - C2B (Customer to Business) for Paybill/Till
  // - B2C (Business to Customer) - No, that's for business paying customers
  // - STK Push for direct prompts to customer's phone

  // For STK Push (the prompt to customer's phone), you would use:
  // 1. Get access token from OAuth endpoint
  // 2. Call the STK Push endpoint with customer details

  // Since we don't have real API credentials, return mock data
  return {
    MerchantRequestID: `MERCHANT${Date.now()}`,
    CheckoutRequestID: `CHECKOUT${Date.now()}`,
    CustomerMessage: "Success. Request accepted for processing"
  };
}

// Function to get sales for a specific user or all sales for admin
export async function getSales(userId?: string) {
  try {
    const user = await getCurrentUserFromSession();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // If not admin, only return sales for the current user
    let salesQuery = db
      .select({
        id: sales.id,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        mpesaReference: sales.mpesaReference,
        status: sales.status,
        cashierId: sales.cashierId,
        createdAt: sales.createdAt,
        cashier: {
          name: sales.cashier.name,
          email: sales.cashier.email,
        },
      })
      .from(sales)
      .leftJoin(users, eq(sales.cashierId, users.id));

    if (user.role !== 'admin' && user.role !== 'manager') {
      salesQuery = salesQuery.where(eq(sales.cashierId, user.id));
    } else if (userId) {
      salesQuery = salesQuery.where(eq(sales.cashierId, userId));
    }

    const result = await salesQuery.orderBy(sales.createdAt.desc());

    return result;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
}

// Function to get a specific sale by ID
export async function getSaleById(saleId: string) {
  try {
    const user = await getCurrentUserFromSession();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const result = await db
      .select({
        id: sales.id,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        mpesaReference: sales.mpesaReference,
        status: sales.status,
        cashierId: sales.cashierId,
        createdAt: sales.createdAt,
        cashier: {
          name: sales.cashier.name,
          email: sales.cashier.email,
        },
        items: {
          id: saleItems.id,
          productId: saleItems.productId,
          quantity: saleItems.quantity,
          priceAtSale: saleItems.priceAtSale,
          product: {
            name: saleItems.product.name,
            sku: saleItems.product.sku,
          },
        },
      })
      .from(sales)
      .leftJoin(saleItems, eq(sales.id, saleItems.saleId))
      .leftJoin(users, eq(sales.cashierId, users.id))
      .leftJoin(inventoryItems, eq(saleItems.productId, inventoryItems.id))
      .where(eq(sales.id, saleId));

    // Check if user has permission to view this sale
    if (user.role !== 'admin' && user.role !== 'manager' && result[0]?.cashierId !== user.id) {
      throw new Error('Insufficient permissions to view this sale');
    }

    return result;
  } catch (error) {
    console.error('Error fetching sale:', error);
    throw error;
  }
}

// Function to update sale status (for cases where payment confirmation comes later)
export async function updateSaleStatus(saleId: string, status: 'pending' | 'paid' | 'failed') {
  try {
    const user = await getCurrentUserFromSession();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Only admin or manager can update sale status
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new Error('Insufficient permissions to update sale status');
    }

    const [updatedSale] = await db
      .update(sales)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(sales.id, saleId))
      .returning();

    revalidatePath('/pos');
    revalidatePath('/reports');

    return updatedSale;
  } catch (error) {
    console.error('Error updating sale status:', error);
    throw error;
  }
}