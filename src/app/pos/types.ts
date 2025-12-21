// src/app/pos/types.ts

export interface POSProduct {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost?: number;
  location?: string;
  notes?: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  barcode?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export interface CreateSaleRequest {
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: string;
  mpesaReference?: string;
}