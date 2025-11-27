'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StaggerContainer, StaggerItem, FadeIn, SlideIn } from '@/components/animations/FramerAnimations';
import { HoverButton } from '@/components/animations/HoverAnimations';
import { Search, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getProducts, getCategoriesWithHierarchy, createProduct, updateProduct, deleteProduct } from '@/actions/categoryActions';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { AddProductModal, UpdateProductModal } from '@/components/forms/Modal';
import { Pagination } from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: Category[];
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

const ProductsClient = ({ initialData }: { initialData: { products: Product[], categories: Category[] } | null }) => {
  const [products, setProducts] = useState<Product[]>(initialData?.products || []);
  const [categories, setCategories] = useState<Category[]>(initialData?.categories || []);
  const [loading, setLoading] = useState(!initialData);
  // State for Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  // State for Update Product Modal
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  // Track which product is being updated
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name');

  // Effect to reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch products and categories from the database if no initial data
  useEffect(() => {
    if (!initialData) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [fetchedProducts, fetchedCategories] = await Promise.all([
            getProducts(),
            getCategoriesWithHierarchy()
          ]);

          setProducts(fetchedProducts);
          setCategories(fetchedCategories);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [initialData]);

  // Filter products based on search term only
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'stock') {
      return b.quantity - a.quantity;
    } else if (sortOption === 'price') {
      return b.price - a.price;
    }
    return a.name.localeCompare(b.name);
  });

  // Pagination logic
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  // Handle adding a new product
  const handleAddProduct = async (productData: any) => {
    try {
      setLoading(true);

      // Create the new product via API
      const newProduct = await createProduct({
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        categoryId: productData.categoryId,
        quantity: parseInt(productData.quantity) || 0,
        price: parseFloat(productData.price) || 0,
        cost: parseFloat(productData.price) * 0.8, // assumed cost is 80% of price
        location: '', // optional field
        notes: productData.description || '', // using description as notes
      });

      // Add the new product to the current products list
      setProducts(prev => [newProduct, ...prev]);

      // Close the modal
      setIsAddProductModalOpen(false);

      toast.success('Product successfully added!');
      console.log('Product successfully added:', newProduct);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating an existing product
  const handleUpdateProduct = async (productData: any) => {
    if (!productToUpdate) return;

    try {
      setLoading(true);

      // Update the product via API
      const updatedProduct = await updateProduct(productToUpdate.id, {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        categoryId: productData.categoryId,
        quantity: parseInt(productData.quantity) || 0,
        price: parseFloat(productData.price) || 0,
        minQuantity: parseInt(productData.minQuantity) || 5,
      });

      // Update the product in the current products list
      setProducts(prev => prev.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      ));

      // Close the modal
      setIsUpdateProductModalOpen(false);
      setProductToUpdate(null);

      toast.success('Product successfully updated!');
      console.log('Product successfully updated:', updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      // Delete the product via API
      await deleteProduct(productId);

      // Remove the product from the current products list
      setProducts(prev => prev.filter(product => product.id !== productId));

      toast.success('Product successfully deleted!');
      console.log('Product successfully deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout>
        <div className="p-4 md:p-6">
          <ProductSkeleton />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage your inventory and product catalog</p>
          </div>
        </FadeIn>

        {/* Controls */}
        <SlideIn direction="up">
          <Card className="glass bg-gradient-subtle backdrop-blur-md">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none mb-2 sm:mb-0"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="stock">Sort by Stock</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>

                <div className="sm:col-span-1 lg:col-span-1">
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-sm font-medium transition-all hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Product</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        <div className="grid grid-cols-1 gap-6">

          {/* Product Table */}
          <div className="md:col-span-4">
            <Card className="glass bg-gradient-subtle backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Inventory</CardTitle>
                <span className="text-sm text-gray-400">{sortedProducts.length} products</span>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Product</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">SKU</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Category</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Supplier</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Stock</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Price</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-gray-800 last:border-b-0 hover:bg-gray-700/30 transition-colors"
                        >
                              <td className="py-3 px-4 text-sm">
                                <div className="font-medium hidden md:block">{product.name || 'Unnamed Product'}</div>
                                <div className="font-medium md:hidden block truncate max-w-[100px]">{product.name || 'Unnamed Product'}</div>
                                {product.description && (
                                  <div className="hidden md:block text-xs text-gray-400 mt-1 truncate max-w-[150px]">{product.description}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-400 hidden md:table-cell">{product.sku || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm text-gray-400 hidden md:table-cell">{product.category?.name || 'Uncategorized'}</td>
                              <td className="py-3 px-4 text-sm text-gray-400 hidden md:table-cell">{product.supplier?.name || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`px-2 py-1 rounded-full ${
                                  (product.quantity || 0) > (product.minQuantity || 0) ? 'bg-green-500/20 text-green-400' :
                                  (product.quantity || 0) > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {typeof product.quantity === 'number' ? product.quantity.toLocaleString() : '0'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">${typeof product.price === 'number' ? product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                              <td className="py-3 px-4 text-sm hidden md:table-cell">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  (product.quantity || 0) > (product.minQuantity || 0)
                                    ? 'bg-green-500/20 text-green-400'
                                    : (product.quantity || 0) > 0
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {(product.quantity || 0) > (product.minQuantity || 0)
                                    ? 'In Stock'
                                    : (product.quantity || 0) > 0
                                    ? 'Low Stock'
                                    : 'Out of Stock'
                                  }
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm flex space-x-2">
                                <button
                                  className="p-1 rounded text-gray-500 cursor-not-allowed"
                                  disabled
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 rounded text-gray-500 cursor-not-allowed"
                                  disabled
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {paginatedProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No products found matching your criteria
                  </div>
                )}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={setPageSize}
                      pageSizeOptions={[5, 10, 20, 50]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Add Product Modal */}
        <AddProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onSubmit={handleAddProduct}
          categories={categories}
        />

        {productToUpdate && (
          <UpdateProductModal
            isOpen={isUpdateProductModalOpen}
            onClose={() => {
              setIsUpdateProductModalOpen(false);
              setProductToUpdate(null);
            }}
            onSubmit={handleUpdateProduct}
            categories={categories}
            product={productToUpdate}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default ProductsClient;