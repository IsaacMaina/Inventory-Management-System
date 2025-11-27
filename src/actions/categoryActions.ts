'use server'

import { db } from '@/lib/db';
import { AuthenticatedUser, Permission } from '@/lib/authorization';
import { checkPermission, requirePermission } from '@/lib/auth/server';
import {
  categories,
  inventoryItems,
  suppliers
} from '../../drizzle/schema';

import { eq, and } from 'drizzle-orm';

// Get all categories with their hierarchy
export async function getCategoriesWithHierarchy(userContext: AuthenticatedUser) {
  try {
    // Check if user has permission to read categories
    const hasPerm = await checkPermission(Permission.CATEGORY_READ, userContext);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view categories');
    }

    // First, get all categories
    const dbCategories = await db.select().from(categories).orderBy(categories.name);

    // Build the hierarchy with proper typing
    interface CategoryNode {
      id: string;
      name: string;
      description?: string | null;
      parentId?: string | null;
      children: CategoryNode[];
      createdAt: Date;
      updatedAt: Date;
    }

    const categoryMap = new Map<string, CategoryNode>();

    // Initialize all categories with empty children array
    for (const cat of dbCategories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        parentId: cat.parentId || undefined,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        children: []
      });
    }

    const rootCategories: CategoryNode[] = [];

    for (const category of dbCategories) {
      if (category.parentId) {
        // This is a child category
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category.id)!);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap.get(category.id)!);
      }
    }

    return rootCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

// Create a new category
export async function createCategory(data: {
  name: string;
  description?: string;
  parentId?: string;
}, userContext: AuthenticatedUser) {
  try {
    // Require permission to create categories
    await requirePermission(Permission.CATEGORY_CREATE, userContext);

    const insertedCategories = await db.insert(categories)
      .values({
        name: data.name,
        description: data.description,
        parentId: data.parentId
      })
      .returning() as typeof categories.$inferSelect[];

    const category = insertedCategories[0];
    if (!category) {
      throw new Error('Failed to create category');
    }

    return category;
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Error && error.message.includes('Access denied')) {
      throw error; // Re-throw authorization errors as-is
    }
    throw new Error('Failed to create category');
  }
}

// Get all products with category details
export async function getProducts(userContext: AuthenticatedUser) {
  try {
    // Check if user has permission to read products
    const hasPerm = await checkPermission(Permission.PRODUCT_READ, userContext);
    if (!hasPerm) {
      throw new Error('Access denied: Insufficient permissions to view products');
    }

    // For non-admin users, limit to products they created
    const isAdmin = await checkPermission(Permission.SETTINGS_UPDATE, userContext); // Using this as a proxy for admin permission

    let whereCondition;
    if (!isAdmin) {
      whereCondition = and(
        eq(inventoryItems.isActive, true),
        eq(inventoryItems.userId, userContext.id)
      );
    } else {
      whereCondition = eq(inventoryItems.isActive, true);
    }

    const dbProducts = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        description: inventoryItems.description,
        sku: inventoryItems.sku,
        barcode: inventoryItems.barcode,
        categoryId: inventoryItems.categoryId,
        supplierId: inventoryItems.supplierId,
        quantity: inventoryItems.quantity,
        minQuantity: inventoryItems.minQuantity,
        price: inventoryItems.price,
        cost: inventoryItems.cost,
        location: inventoryItems.location,
        notes: inventoryItems.notes,
        images: inventoryItems.images,
        isActive: inventoryItems.isActive,
        userId: inventoryItems.userId,
        createdAt: inventoryItems.createdAt,
        updatedAt: inventoryItems.updatedAt,
        categoryName: categories.name,
        categoryDescription: categories.description,
        supplierName: suppliers.name,
        supplierEmail: suppliers.email,
      })
      .from(inventoryItems)
      .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
      .leftJoin(suppliers, eq(inventoryItems.supplierId, suppliers.id))
      .where(whereCondition)
      .orderBy(inventoryItems.name);

    // Convert price and cost from cents to dollars
    const products = dbProducts.map(product => ({
      ...product,
      // Convert cents to dollars for price and cost
      price: product.price / 100, // Assuming price was stored in cents
      cost: product.cost ? product.cost / 100 : null, // Assuming cost was stored in cents
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

// Create a new product
export async function createProduct(data: {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  supplierId?: string;
  quantity: number;
  price: number; // in dollars
  cost?: number; // in dollars
  minQuantity?: number;
  location?: string;
  notes?: string;
  images?: string[];
}, userContext: AuthenticatedUser) {
  try {
    // Require permission to create products
    await requirePermission(Permission.PRODUCT_CREATE, userContext);

    // Convert dollars to cents for storage
    const priceInCents = Math.round(data.price * 100);
    const costInCents = data.cost ? Math.round(data.cost * 100) : null;

    const insertedProducts = await db.insert(inventoryItems)
      .values({
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        quantity: data.quantity,
        minQuantity: data.minQuantity || 5, // Default to 5 if not provided
        price: priceInCents,
        cost: costInCents,
        location: data.location,
        notes: data.notes,
        images: data.images,
        userId: userContext.id // Use the authenticated user
      })
      .returning() as typeof inventoryItems.$inferSelect[];

    const product = insertedProducts[0];
    if (!product) {
      throw new Error('Failed to create product');
    }

    // Convert back to dollars for return
    return {
      ...product,
      price: product.price / 100,
      cost: product.cost ? product.cost / 100 : null
    };
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error && error.message.includes('Access denied')) {
      throw error; // Re-throw authorization errors as-is
    }
    throw new Error('Failed to create product');
  }
}

// Update an existing product
export async function updateProduct(id: string, data: {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  quantity?: number;
  price?: number; // in dollars
  cost?: number; // in dollars
  minQuantity?: number;
  location?: string;
  notes?: string;
  images?: string[];
  isActive?: boolean;
}, userContext: AuthenticatedUser) {
  try {
    // Require permission to update products
    await requirePermission(Permission.PRODUCT_UPDATE, userContext);

    // Check if the user has permission to update this specific product
    // First check if user owns the product
    const existingProducts = await db
      .select({ userId: inventoryItems.userId })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id)) as { userId: string }[];

    const existingProduct = existingProducts[0];
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Non-admin users can only update their own products
    const isAdmin = await checkPermission(Permission.SETTINGS_UPDATE, userContext);
    if (!isAdmin && existingProduct.userId !== userContext.id) {
      throw new Error('Access denied: You can only update products you created');
    }

    // Convert dollars to cents for price and cost if provided
    let updateData: any = { ...data };
    if (data.price !== undefined) {
      updateData.price = Math.round(data.price * 100);
    }
    if (data.cost !== undefined) {
      updateData.cost = Math.round(data.cost * 100);
    }

    const updatedProducts = await db
      .update(inventoryItems)
      .set(updateData)
      .where(eq(inventoryItems.id, id))
      .returning() as typeof inventoryItems.$inferSelect[];

    const product = updatedProducts[0];
    if (!product) {
      throw new Error('Failed to update product');
    }

    // Convert back to dollars for return
    return {
      ...product,
      price: product.price / 100,
      cost: product.cost ? product.cost / 100 : null
    };
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error && error.message.includes('Access denied')) {
      throw error; // Re-throw authorization errors as-is
    }
    throw new Error('Failed to update product');
  }
}

// Delete a product
export async function deleteProduct(id: string, userContext: AuthenticatedUser) {
  try {
    // Require permission to delete products
    await requirePermission(Permission.PRODUCT_DELETE, userContext);

    // Check if the user has permission to delete this specific product
    // First check if user owns the product
    const existingProducts = await db
      .select({ userId: inventoryItems.userId })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id)) as { userId: string }[];

    const existingProduct = existingProducts[0];
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Non-admin users can only delete their own products
    const isAdmin = await checkPermission(Permission.SETTINGS_UPDATE, userContext);
    if (!isAdmin && existingProduct.userId !== userContext.id) {
      throw new Error('Access denied: You can only delete products you created');
    }

    await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id));
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error instanceof Error && error.message.includes('Access denied')) {
      throw error; // Re-throw authorization errors as-is
    }
    throw new Error('Failed to delete product');
  }
}