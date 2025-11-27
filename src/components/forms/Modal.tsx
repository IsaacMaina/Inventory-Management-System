'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { CategoryTreeSelector } from './CategoryTreeSelector';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div 
              className={`glass border-gray-700 bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Specific modal forms
interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: Category[];
  loading?: boolean;
}

// UpdateProductModal component
interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: Category[];
  product: Product; // Pass the existing product data
  loading?: boolean;
}

interface Product {
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
}

export const UpdateProductModal = ({ isOpen, onClose, onSubmit, categories, product, loading }: UpdateProductModalProps) => {
  // State for form data, initialized with existing product data
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    description: product?.description || '',
    price: product?.price ? product.price.toString() : '',
    quantity: product?.quantity ? product.quantity.toString() : '',
    minQuantity: product?.minQuantity ? product.minQuantity.toString() : '5', // Default value
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle category selection from tree
  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId: categoryId }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Product" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">SKU *</label>
          <input
            type="text"
            id="sku"
            value={formData.sku}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter SKU"
            required
          />
        </div>

        {/* Category Tree Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <div className="h-64 border border-gray-600 rounded-lg overflow-hidden">
            <CategoryTreeSelector
              categories={categories}
              selectedCategoryId={formData.categoryId}
              onSelectCategory={handleCategorySelect}
              maxDepth={3}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter product description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quantity *</label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Quantity</label>
            <input
              type="number"
              id="minQuantity"
              value={formData.minQuantity}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="5"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-gray-500 to-gray-600 opacity-60 cursor-not-allowed"
            disabled={true}
          >
            Demo Mode - Update Product
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AddProductModal = ({ isOpen, onClose, onSubmit, categories, loading }: AddProductModalProps) => {
  // State for form data and category selection
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    price: '',
    quantity: '',
    minQuantity: '5', // Default value
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle category selection from tree
  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId: categoryId }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    onSubmit(formData);
    // Reset form after submission
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      description: '',
      price: '',
      quantity: '',
      minQuantity: '5',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">SKU *</label>
          <input
            type="text"
            id="sku"
            value={formData.sku}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter SKU"
            required
          />
        </div>

        {/* Category Tree Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <div className="h-64 border border-gray-600 rounded-lg overflow-hidden">
            <CategoryTreeSelector
              categories={categories}
              selectedCategoryId={formData.categoryId}
              onSelectCategory={handleCategorySelect}
              maxDepth={3}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter product description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quantity *</label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Quantity</label>
            <input
              type="number"
              id="minQuantity"
              value={formData.minQuantity}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="5"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-gray-500 to-gray-600 opacity-60 cursor-not-allowed"
            disabled={true}
          >
            Demo Mode - Add Product
          </Button>
        </div>
      </form>
    </Modal>
  );
};