'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { HoverButton } from '../animations/HoverAnimations';

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

interface AnimatedFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  className?: string;
}

export const AnimatedForm = ({ 
  title, 
  fields, 
  onSubmit, 
  submitText = 'Submit', 
  className = '' 
}: AnimatedFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`glass border-gray-700 bg-gray-800/30 backdrop-blur-md rounded-xl p-6 ${className}`}
    >
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <label htmlFor={field.id} className="block text-sm font-medium mb-2">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type={field.type}
                id={field.id}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: fields.length * 0.1 + 0.2 }}
          className="mt-6"
        >
          <HoverButton
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all"
          >
            {isSubmitting ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⬈
              </motion.span>
            ) : (
              submitText
            )}
          </HoverButton>
        </motion.div>
      </form>
    </motion.div>
  );
};

// Specific form components
interface AddProductFormProps {
  onSubmit: (data: any) => void;
  className?: string;
}

export const AddProductForm = ({ onSubmit, className = '' }: AddProductFormProps) => {
  const fields: FormField[] = [
    { id: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'Enter product name' },
    { id: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'Enter SKU' },
    { id: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Enter category' },
    { id: 'description', label: 'Description', type: 'text', placeholder: 'Enter product description' },
    { id: 'price', label: 'Price', type: 'number', required: true, placeholder: 'Enter price' },
    { id: 'quantity', label: 'Quantity', type: 'number', required: true, placeholder: 'Enter quantity' },
    { id: 'minQuantity', label: 'Minimum Quantity', type: 'number', required: true, placeholder: 'Enter minimum quantity' },
  ];

  return (
    <AnimatedForm
      title="Add New Product"
      fields={fields}
      onSubmit={onSubmit}
      submitText="Add Product"
      className={className}
    />
  );
};

interface AddSupplierFormProps {
  onSubmit: (data: any) => void;
  className?: string;
}

export const AddSupplierForm = ({ onSubmit, className = '' }: AddSupplierFormProps) => {
  const fields: FormField[] = [
    { id: 'name', label: 'Supplier Name', type: 'text', required: true, placeholder: 'Enter supplier name' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter email' },
    { id: 'phone', label: 'Phone', type: 'tel', placeholder: 'Enter phone number' },
    { id: 'address', label: 'Address', type: 'text', placeholder: 'Enter address' },
    { id: 'notes', label: 'Notes', type: 'text', placeholder: 'Enter notes' },
  ];

  return (
    <AnimatedForm
      title="Add New Supplier"
      fields={fields}
      onSubmit={onSubmit}
      submitText="Add Supplier"
      className={className}
    />
  );
};