// src/app/pos/ProductSearch.tsx

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { POSProduct } from './types';

interface ProductSearchProps {
  products: POSProduct[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddToCart: (product: POSProduct) => void;
}

export const ProductSearch = ({ 
  products, 
  searchTerm, 
  setSearchTerm, 
  onAddToCart 
}: ProductSearchProps) => {
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search products by name, SKU, or barcode..."
          className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:bg-gray-700/40 transition-colors cursor-pointer"
                onClick={() => onAddToCart(product)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 truncate">{product.sku}</p>
                    {product.barcode && (
                      <p className="text-xs text-gray-500 mt-1">{product.barcode}</p>
                    )}
                    <p className="text-sm font-medium mt-2">
                      {new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                        minimumFractionDigits: 2
                      }).format(product.price)}
                    </p>
                  </div>
                  <button
                    className="ml-2 p-2 rounded-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};