'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, Search, Filter, Package, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      
      // Get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');
      
      if (categoriesError) throw categoriesError;
      
      // Get product images (primary images only)
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, url')
        .eq('is_primary', true)
        .in('product_id', productsData.map(p => p.id));
      
      if (imagesError) console.error('Error fetching images:', imagesError);
      
      // Create maps for quick lookup
      const categoryMap = {};
      categoriesData.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });
      
      const imageMap = {};
      if (imagesData) {
        imagesData.forEach(img => {
          imageMap[img.product_id] = img.url;
        });
      }
      
      // Combine data
      const productsWithData = productsData.map(product => ({
        ...product,
        category_name: categoryMap[product.category] || product.category || 'Uncategorized',
        primary_image: imageMap[product.id] || null
      }));
      
      setProducts(productsWithData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update stock quantity
  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) {
      alert('Stock cannot be negative');
      return;
    }
    
    setUpdatingStock(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId);
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      ));
      
      alert('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    } finally {
      setUpdatingStock(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {product.primary_image ? (
                      <img 
                        src={product.primary_image} 
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">₦{product.price?.toLocaleString()}</span>
                  {product.original_price && (
                    <div className="text-sm text-gray-500 line-through">
                      ₦{product.original_price?.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock || 0} units
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))}
                        disabled={updatingStock === product.id || product.stock <= 0}
                        className="p-1 text-gray-600 hover:text-black disabled:opacity-50"
                        title="Reduce stock by 1"
                      >
                        -
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={product.stock || 0}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          setProducts(products.map(p =>
                            p.id === product.id ? { ...p, stock: newValue } : p
                          ));
                        }}
                        onBlur={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border rounded text-center text-sm"
                      />
                      
                      <button
                        onClick={() => updateStock(product.id, product.stock + 1)}
                        disabled={updatingStock === product.id}
                        className="p-1 text-gray-600 hover:text-black disabled:opacity-50"
                        title="Increase stock by 1"
                      >
                        +
                      </button>
                    </div>
                    
                    {updatingStock === product.id && (
                      <RefreshCw className="w-3 h-3 animate-spin text-gray-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {product.category_name}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Product"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium">No products found</h3>
          <p className="text-gray-500">Add your first product to get started</p>
        </div>
      )}
    </div>
  );
}