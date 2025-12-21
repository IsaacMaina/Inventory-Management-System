// src/app/pos/POSCart.tsx

import { CartItem } from './types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface POSCartProps {
  cart: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  onProcessSale: () => void;
  isProcessing: boolean;
  inventoryData?: Record<string, { quantity: number }>; // Added inventory data
}

export const POSCart = ({
  cart,
  updateQuantity,
  removeFromCart,
  cartTotal,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onProcessSale,
  isProcessing,
  inventoryData = {}
}: POSCartProps) => {
  const paymentMethods = [
    { id: 'mpesa_send', name: 'M-Pesa Send Money' },
    { id: 'mpesa_paybill', name: 'M-Pesa Paybill' },
    { id: 'mpesa_till', name: 'M-Pesa Till Number' },
    { id: 'mpesa_pochi', name: 'M-Pesa Pochi La Biashara' },
  ];

  const handleProcessSale = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }
    onProcessSale();
  };

  // Calculate remaining inventory for a specific item
  const getRemainingInventory = (itemId: string, cartQuantity: number) => {
    const originalQuantity = inventoryData[itemId]?.quantity || 0;
    return originalQuantity - cartQuantity;
  };

  // Check if any item in cart has insufficient inventory
  const hasInsufficientInventory = cart.some(item => {
    const remaining = getRemainingInventory(item.id, item.quantity);
    return remaining < 0;
  });

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="max-h-60 overflow-y-auto space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            Cart is empty
          </div>
        ) : (
          cart.map((item) => {
            const remaining = getRemainingInventory(item.id, item.quantity);
            const isLowStock = remaining <= 0;
            const isLowStockWarning = remaining <= 5 && remaining > 0;

            return (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${
                isLowStock
                  ? 'bg-red-900/30 border border-red-700'
                  : isLowStockWarning
                  ? 'bg-yellow-900/30 border border-yellow-700'
                  : 'bg-gray-700/30 border border-gray-600'
              }`}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-xs text-gray-400">{item.sku}</p>
                  <div className="mt-1 text-xs">
                    <span className={isLowStock ? 'text-red-400' : isLowStockWarning ? 'text-yellow-400' : 'text-green-400'}>
                      Remaining: {Math.max(0, remaining)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-8 text-center font-medium">{item.quantity}</span>

                  <button
                    className="p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={remaining <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <div className="ml-2 w-16 text-right font-medium">
                    {formatCurrency((item.price * item.quantity) / 100)}
                  </div>

                  <button
                    className="ml-2 p-1 rounded text-red-400 hover:bg-red-500/20"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show inventory warning if any item has insufficient stock */}
      {hasInsufficientInventory && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm">
          <p className="text-red-400 font-medium">Warning: Some items have insufficient inventory!</p>
          <p className="text-red-300 text-xs mt-1">Please adjust quantities or check inventory before proceeding.</p>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Method
        </label>
        <select
          className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          <option value="">Select payment method</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* Total and Process Button */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-lg font-bold text-green-400">
            {formatCurrency(cartTotal / 100)}
          </span>
        </div>

        <button
          className={`w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium transition-all ${
            isProcessing || hasInsufficientInventory ? 'opacity-75 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-700'
          }`}
          onClick={handleProcessSale}
          disabled={isProcessing || cart.length === 0 || !selectedPaymentMethod || hasInsufficientInventory}
        >
          {isProcessing ? 'Processing...' : 'Process Sale'}
        </button>
      </div>
    </div>
  );
};