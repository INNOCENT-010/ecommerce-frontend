// app/admin/dashboard/page.tsx - FIXED &  VERSION
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, type Order, type DashboardStats } from '@/lib/admin-api';
import { Package, AlertCircle, TrendingUp, ShoppingBag, Users, CreditCard } from 'lucide-react';

// Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  is_active: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    // Order stats (from FastAPI)
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    processing_orders: 0,
    paid_orders: 0,
    
    // Product stats (from Supabase)
    total_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
    total_categories: 0,
    average_price: 0,
    
    // Customer stats
    total_customers: 0,
    average_order_value: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Verify admin access
      await adminAPI.verifyAdmin();

      // 2. Fetch data in parallel
      const [ordersData, statsData, productsData] = await Promise.all([
        adminAPI.getOrders(),           // Your REAL orders
        adminAPI.getDashboardStats(),   // Your REAL stats
        fetchProductsFromSupabase()     // Your REAL products
      ]);

      // 3. Update state with REAL data
      setOrders(ordersData);
      setProducts(productsData || []);
      
      // 4. Calculate combined stats
      const totalProducts = productsData?.length || 0;
      const lowStockProducts = productsData?.filter(p => p.stock < 10 && p.stock > 0)?.length || 0;
      const outOfStockProducts = productsData?.filter(p => p.stock === 0)?.length || 0;
      const categories = [...new Set(productsData?.map(p => p.category).filter(Boolean))];
      const avgPrice = productsData?.length 
        ? productsData.reduce((sum: number, p: Product) => sum + p.price, 0) / productsData.length 
        : 0;
      
      // Get unique customers from orders
      const customerEmails = [...new Set(ordersData.map(o => o.customer_email).filter(Boolean))];
      
      // Count paid orders
      const paidOrders = ordersData.filter(o => o.payment_status === 'paid').length;

      setStats({
        // From FastAPI stats
        total_orders: statsData.total_orders || 0,
        total_revenue: statsData.total_revenue || 0,
        pending_orders: statsData.orders_by_status?.pending || 0,
        processing_orders: statsData.orders_by_status?.processing || 0,
        paid_orders: paidOrders,
        
        // From Supabase products
        total_products: totalProducts,
        low_stock_products: lowStockProducts,
        out_of_stock_products: outOfStockProducts,
        total_categories: categories.length,
        average_price: avgPrice,
        
        // Calculated
        total_customers: customerEmails.length,
        average_order_value: statsData.total_orders > 0 
          ? statsData.total_revenue / statsData.total_orders 
          : 0
      });

    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Not authenticated')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsFromSupabase = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      loadDashboardData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 5) return 'bg-orange-100 text-orange-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => adminAPI.logout()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right text-red-900">×</button>
          </div>
        )}

        {/* ========== REAL STATS CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Order Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_orders}</p>
              </div>
              <ShoppingBag className="text-blue-500" size={24} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{stats.paid_orders} paid • {stats.pending_orders} pending</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {formatCurrency(stats.total_revenue)}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Avg order: {formatCurrency(stats.average_order_value)}
            </p>
          </div>

          {/* Product Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">{stats.total_products}</p>
              </div>
              <Package className="text-purple-500" size={24} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-red-600">{stats.out_of_stock_products} out of stock</span>
              <span className="text-sm text-yellow-600">{stats.low_stock_products} low stock</span>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Customers</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.total_customers}</p>
              </div>
              <Users className="text-indigo-500" size={24} />
            </div>
            <p className="text-sm text-gray-500 mt-2">Unique customers</p>
          </div>
        </div>

        {/* ========== STATUS BREAKDOWN ========== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Pending
              </span>
              <span className="text-2xl font-bold text-gray-900">{stats.pending_orders}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Processing
              </span>
              <span className="text-2xl font-bold text-gray-900">{stats.processing_orders}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Paid
              </span>
              <span className="text-2xl font-bold text-gray-900">{stats.paid_orders}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Out of Stock
              </span>
              <span className="text-2xl font-bold text-gray-900">{stats.out_of_stock_products}</span>
            </div>
          </div>
        </div>

        {/* ========== TWO COLUMN LAYOUT ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => router.push('/admin/orders')}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                View All →
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Low Stock Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
              <button
                onClick={() => router.push('/admin/products')}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                Manage Products →
              </button>
            </div>
            
            {products.filter(p => p.stock < 10).length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <Package className="mx-auto text-gray-400 mb-3" size={32} />
                <h3 className="font-medium">All products have sufficient stock</h3>
                <p className="text-sm text-gray-500 mt-1">Great job managing inventory!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products
                      .filter(p => p.stock < 10)
                      .sort((a, b) => a.stock - b.stock)
                      .slice(0, 5)
                      .map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.images?.[0] && (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category || 'Uncategorized'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product.stock)}`}>
                            {product.stock === 0 ? 'OUT OF STOCK' : `${product.stock} left`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/products/new')}
            className="bg-black text-white p-4 rounded-lg hover:bg-gray-800 text-center flex items-center justify-center gap-2"
          >
            <Package size={20} />
            Add New Product
          </button>
          <button
            onClick={() => router.push('/admin/orders')}
            className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 text-center flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} />
            View All Orders
          </button>
          <button
            onClick={loadDashboardData}
            className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 text-center flex items-center justify-center gap-2"
          >
            ↻ Refresh Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}