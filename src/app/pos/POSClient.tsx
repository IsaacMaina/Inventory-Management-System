'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StaggerContainer, StaggerItem, FadeIn, SlideIn } from '@/components/animations/FramerAnimations';
import { HoverButton } from '@/components/animations/HoverAnimations';
import { Search, Plus, Minus, Trash2, CreditCard, Receipt, Printer, ShoppingCart } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { POSProduct, CartItem } from './types';
import { CompleteSaleModal } from './CompleteSaleModal';
import { POSCart } from './POSCart';
import { ProductSearch } from './ProductSearch';
import { createSale } from '@/actions/posActions';
import toast from 'react-hot-toast';

interface POSClientProps {
  initialProducts: POSProduct[];
}

const POSClient = ({ initialProducts }: POSClientProps) => {
  const [products] = useState<POSProduct[]>(initialProducts || []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showCompleteSaleModal, setShowCompleteSaleModal] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Calculate cart total (in cents)
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle adding product to cart
  const addToCart = (product: POSProduct) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);

      if (existingItem) {
        // Check if adding another unit would exceed available inventory
        const existingQuantityInCart = prevCart.find(item => item.id === product.id)?.quantity || 0;
        const availableInventory = product.quantity;
        const requestedQuantity = existingQuantityInCart + 1;

        if (requestedQuantity > availableInventory) {
          toast.error(`Cannot add more ${product.name}. Only ${availableInventory} available in inventory.`);
          return prevCart; // Return unchanged cart
        }

        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Check if we can add the product (at least 1 available in inventory)
        if (product.quantity < 1) {
          toast.error(`${product.name} is out of stock.`);
          return prevCart; // Return unchanged cart
        }

        // Convert price to cents (integer) if it's not already
        const priceInCents = Math.round(product.price * 100);

        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: priceInCents,
            quantity: 1,
            sku: product.sku,
            barcode: product.barcode,
          }
        ];
      }
    });
  };

  // Handle updating item quantity in cart
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Find the product in the products list to check inventory
    const product = products.find(p => p.id === id);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    // Check if requested quantity exceeds available inventory
    if (quantity > product.quantity) {
      toast.error(`Cannot set quantity to ${quantity}. Only ${product.quantity} available in inventory.`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Handle removing item from cart
  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Handle completing the sale
  const handleCompleteSale = async (mpesaReference: string, customerPhone?: string) => {
    setIsProcessingSale(true);

    try {
      // Prepare the sale data
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          priceAtSale: item.price, // price is already in cents (integers)
        })),
        totalAmount: cartTotal, // total is already in cents (integer)
        paymentMethod: selectedPaymentMethod as 'mpesa_send' | 'mpesa_paybill' | 'mpesa_till' | 'mpesa_pochi',
        mpesaReference: mpesaReference || undefined, // Only include if provided
        customerPhone, // Include customer phone for API request
      };

      // Call the createSale action
      const result = await createSale(saleData);

      if (result.success) {
        // Reset cart after successful sale
        setCart([]);
        setSelectedPaymentMethod('');
        setShowCompleteSaleModal(false);

        // Show success message
        toast.success(result.message || 'Sale completed successfully!');
      } else {
        console.error('Error creating sale:', result.error);
        toast.error(result.error || 'Error completing sale. Please try again.');
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error('Error completing sale. Please try again.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  return (
    <BaseLayout>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-muted-foreground">Process sales and manage transactions</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search Section */}
          <div className="lg:col-span-2">
            <SlideIn direction="up">
              <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
                <CardHeader>
                  <CardTitle>Product Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSearch 
                    products={products}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAddToCart={addToCart}
                  />
                </CardContent>
              </Card>
            </SlideIn>
          </div>

          {/* Cart Section */}
          <div>
            <SlideIn direction="up">
              <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <POSCart
                    cart={cart}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    cartTotal={cartTotal}
                    selectedPaymentMethod={selectedPaymentMethod}
                    setSelectedPaymentMethod={setSelectedPaymentMethod}
                    onProcessSale={() => setShowCompleteSaleModal(true)}
                    isProcessing={isProcessingSale}
                    inventoryData={products.reduce((acc, product) => {
                      acc[product.id] = { quantity: product.quantity };
                      return acc;
                    }, {} as Record<string, { quantity: number }>)}
                  />
                </CardContent>
              </Card>
            </SlideIn>
          </div>
        </div>
      </div>

      {/* Complete Sale Modal */}
      <CompleteSaleModal
        isOpen={showCompleteSaleModal}
        onClose={() => setShowCompleteSaleModal(false)}
        onSubmit={handleCompleteSale}
        totalAmount={cartTotal}
        paymentMethod={selectedPaymentMethod}
        isProcessing={isProcessingSale}
      />
    </BaseLayout>
  );
};

export default POSClient;