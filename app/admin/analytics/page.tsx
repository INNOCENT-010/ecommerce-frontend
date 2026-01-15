// app/admin/analytics/page.tsx - ENHANCED VERSION
'use client';

import { useEffect, useState } from 'react';
import { adminAPI, type Order, type OrderDetail } from '@/lib/admin-api';
import { BarChart3, TrendingUp, Users, DollarSign, Package, Calendar, Trophy, TrendingDown, Flame, Star } from 'lucide-react';

// Add supabase for product data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Analytics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  ordersByMonth: Array<{ month: string; revenue: number; orders: number }>;
  ordersByDay: Array<{ date: string; revenue: number; orders: number }>;
  bestSellingProducts: Array<{ 
    id: string; 
    name: string; 
    revenue: number; 
    orders: number; 
    quantity: number;
    image?: string;
    category?: string;
    growth?: number;
  }>;
  biggestRevenueDay: {
    date: string;
    revenue: number;
    orders: number;
  } | null;
  peakHour: {
    hour: string;
    orders: number;
    revenue: number;
  } | null;
}

interface ProductSalesData {
  [productId: string]: {
    name: string;
    revenue: number;
    orders: number;
    quantity: number;
    image?: string;
    category?: string;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: 0,
    ordersByMonth: [],
    ordersByDay: [],
    bestSellingProducts: [],
    biggestRevenueDay: null,
    peakHour: null
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // all, month, year
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [orders, productsData] = await Promise.all([
        adminAPI.getOrders(),
        fetchProductsFromSupabase()
      ]);

      setProducts(productsData || []);

      // Fetch order details for product-level analysis
      const orderDetailsPromises = orders.map(order => 
        adminAPI.getOrderDetails(order.id).catch(() => null)
      );
      const orderDetailsResults = await Promise.all(orderDetailsPromises);
      const validOrderDetails = orderDetailsResults.filter(Boolean) as OrderDetail[];
      setOrderDetails(validOrderDetails);

      // Filter by time range
      let filteredOrders = orders;
      let filteredOrderDetails = validOrderDetails;
      
      if (timeRange === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredOrders = orders.filter(order => 
          new Date(order.created_at) >= oneMonthAgo
        );
        filteredOrderDetails = validOrderDetails.filter(detail => {
          const orderDate = new Date(detail.order.created_at);
          return orderDate >= oneMonthAgo;
        });
      } else if (timeRange === 'year') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filteredOrders = orders.filter(order => 
          new Date(order.created_at) >= oneYearAgo
        );
        filteredOrderDetails = validOrderDetails.filter(detail => {
          const orderDate = new Date(detail.order.created_at);
          return orderDate >= oneYearAgo;
        });
      }

      // Calculate basic stats
      const paidOrders = filteredOrders.filter(o => o.payment_status === 'paid');
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      const averageOrderValue = paidOrders.length > 0 
        ? totalRevenue / paidOrders.length 
        : 0;
      
      // Get unique customers
      const customerEmails = [...new Set(
        filteredOrders.map(o => o.customer_email).filter(Boolean)
      )];

      // Calculate best-selling products
      const productSales: ProductSalesData = {};
      
      filteredOrderDetails.forEach(detail => {
        if (detail.order.payment_status === 'paid') {
          detail.items.forEach(item => {
            const productId = item.product_id.toString();
            if (!productSales[productId]) {
              const productInfo = productsData.find(p => p.id === productId) || {};
              productSales[productId] = {
                name: item.product_name || productInfo.name || 'Unknown Product',
                revenue: 0,
                orders: 0,
                quantity: 0,
                image: item.image || productInfo.images?.[0],
                category: productInfo.category
              };
            }
            
            const revenue = item.quantity * item.price;
            productSales[productId].revenue += revenue;
            productSales[productId].orders += 1;
            productSales[productId].quantity += item.quantity;
          });
        }
      });

      // Sort and get top 10 best-selling products
      const bestSellingProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          ...data
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Group by day for daily analysis
      const ordersByDay: Record<string, { revenue: number; orders: number }> = {};
      const ordersByHour: Record<string, { revenue: number; orders: number }> = {};
      
      paidOrders.forEach(order => {
        const date = new Date(order.created_at);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const hour = date.getHours();
        const hourKey = `${hour}:00`;
        
        if (!ordersByDay[dateStr]) {
          ordersByDay[dateStr] = { revenue: 0, orders: 0 };
        }
        if (!ordersByHour[hourKey]) {
          ordersByHour[hourKey] = { revenue: 0, orders: 0 };
        }
        
        ordersByDay[dateStr].revenue += order.total_amount;
        ordersByDay[dateStr].orders += 1;
        
        ordersByHour[hourKey].revenue += order.total_amount;
        ordersByHour[hourKey].orders += 1;
      });

      // Find biggest revenue day
      let biggestRevenueDay = null;
      if (Object.keys(ordersByDay).length > 0) {
        const biggestDay = Object.entries(ordersByDay)
          .sort(([, a], [, b]) => b.revenue - a.revenue)[0];
        
        if (biggestDay) {
          biggestRevenueDay = {
            date: biggestDay[0],
            revenue: biggestDay[1].revenue,
            orders: biggestDay[1].orders
          };
        }
      }

      // Find peak hour
      let peakHour = null;
      if (Object.keys(ordersByHour).length > 0) {
        const peak = Object.entries(ordersByHour)
          .sort(([, a], [, b]) => b.orders - a.orders)[0];
        
        if (peak) {
          peakHour = {
            hour: peak[0],
            orders: peak[1].orders,
            revenue: peak[1].revenue
          };
        }
      }

      // Group by month for chart
      const ordersByMonth = filteredOrders.reduce((acc, order) => {
        const date = new Date(order.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = { revenue: 0, orders: 0 };
        }
        
        if (order.payment_status === 'paid') {
          acc[monthYear].revenue += order.total_amount;
        }
        acc[monthYear].orders += 1;
        
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);
      
      // Convert to array and sort
      const ordersByMonthArray = Object.entries(ordersByMonth)
        .map(([monthYear, data]) => ({
          month: monthYear,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      // Convert daily data to array
      const ordersByDayArray = Object.entries(ordersByDay)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 days

      setAnalytics({
        totalRevenue,
        averageOrderValue,
        totalOrders: filteredOrders.length,
        totalCustomers: customerEmails.length,
        conversionRate: paidOrders.length / filteredOrders.length * 100 || 0,
        ordersByMonth: ordersByMonthArray,
        ordersByDay: ordersByDayArray,
        bestSellingProducts,
        biggestRevenueDay,
        peakHour
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getGrowthIcon = (productIndex: number) => {
    if (productIndex === 0) return <Trophy className="text-yellow-500" size={16} />;
    if (productIndex === 1) return <Star className="text-gray-400" size={16} />;
    if (productIndex === 2) return <Star className="text-orange-500" size={16} />;
    return null;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Business insights from your orders</p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Time</option>
            <option value="year">Last Year</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.ordersByDay.length > 0 ? `${analytics.ordersByDay.length} days with sales` : 'No sales data'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(analytics.averageOrderValue)}
              </p>
            </div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.totalOrders > 0 ? `${analytics.conversionRate.toFixed(1)}% conversion rate` : 'No orders'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.totalOrders}
              </p>
            </div>
            <Package className="text-purple-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.totalCustomers} unique customers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Day</p>
              <p className="text-2xl font-bold text-orange-600">
                {analytics.biggestRevenueDay ? 
                  formatCurrency(analytics.biggestRevenueDay.revenue) : 
                  'N/A'
                }
              </p>
            </div>
            <Flame className="text-orange-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.biggestRevenueDay ? 
              formatDate(analytics.biggestRevenueDay.date) : 
              'No data'
            }
          </p>
        </div>
      </div>

      {/* Main Grid - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Best Selling Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-medium flex items-center gap-2">
              <Trophy size={20} />
              Top Selling Products
            </h3>
            <p className="text-sm text-gray-500">By revenue generated</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.bestSellingProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No product sales data available
                    </td>
                  </tr>
                ) : (
                  analytics.bestSellingProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {getGrowthIcon(index)}
                            <span className="ml-1">{index + 1}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.category && (
                              <div className="text-xs text-gray-500">{product.category}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(product.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.quantity > 0 ? 
                            `₦${Math.round(product.revenue / product.quantity)} avg.` : 
                            'No units'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.orders} orders
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {analytics.bestSellingProducts.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Total: {analytics.bestSellingProducts.length} products • 
                {' '}{analytics.bestSellingProducts.reduce((sum, p) => sum + p.quantity, 0)} units sold • 
                {' '}{formatCurrency(analytics.bestSellingProducts.reduce((sum, p) => sum + p.revenue, 0))} revenue
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Revenue Chart & Daily Performance */}
        <div className="space-y-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Revenue Trend ({timeRange === 'month' ? 'Last 30 Days' : timeRange === 'year' ? 'Last Year' : 'All Time'})
            </h3>
            <div className="space-y-4">
              {analytics.ordersByMonth.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No revenue data available
                </div>
              ) : (
                analytics.ordersByMonth.map((item) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{formatMonth(item.month)}</span>
                      <span className="font-medium">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (item.revenue / Math.max(...analytics.ordersByMonth.map(m => m.revenue)) * 100))}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{item.orders} orders</span>
                      <span>{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Performance & Peak Hour */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4">Daily Performance</h3>
            
            {analytics.biggestRevenueDay ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-orange-800">Biggest Revenue Day</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {formatCurrency(analytics.biggestRevenueDay.revenue)}
                      </p>
                      <p className="text-sm text-orange-600">{formatDate(analytics.biggestRevenueDay.date)}</p>
                    </div>
                    <Flame className="text-orange-500" size={32} />
                  </div>
                  <p className="text-xs text-orange-700 mt-2">
                    {analytics.biggestRevenueDay.orders} orders • 
                    {' '}{formatCurrency(analytics.biggestRevenueDay.revenue / analytics.biggestRevenueDay.orders)} avg. per order
                  </p>
                </div>

                {analytics.peakHour && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Peak Order Hour</p>
                        <p className="text-xl font-bold text-blue-900">{analytics.peakHour.hour}</p>
                        <p className="text-sm text-blue-600">{analytics.peakHour.orders} orders</p>
                      </div>
                      <TrendingUp className="text-blue-500" size={28} />
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      {formatCurrency(analytics.peakHour.revenue)} revenue during peak hour
                    </p>
                  </div>
                )}

                {analytics.ordersByDay.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Revenue Days</p>
                    <div className="space-y-2">
                      {analytics.ordersByDay.slice(0, 5).map((day, index) => (
                        <div key={day.date} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center">
                            <span className="w-6 text-center text-sm font-medium text-gray-500">{index + 1}.</span>
                            <span className="ml-2 text-sm text-gray-600">{formatDate(day.date)}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(day.revenue)}</div>
                            <div className="text-xs text-gray-500">{day.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No daily performance data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded">
            <p className="text-sm text-green-800">Revenue Growth</p>
            <p className="text-xl font-bold text-green-900">
              {analytics.ordersByMonth.length > 1 
                ? `${Math.round(((analytics.ordersByMonth[analytics.ordersByMonth.length - 1]?.revenue || 0) / 
                    (analytics.ordersByMonth[analytics.ordersByMonth.length - 2]?.revenue || 1) - 1) * 100)}%`
                : 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">Order Growth</p>
            <p className="text-xl font-bold text-blue-900">
              {analytics.ordersByMonth.length > 1 
                ? `${Math.round(((analytics.ordersByMonth[analytics.ordersByMonth.length - 1]?.orders || 0) / 
                    (analytics.ordersByMonth[analytics.ordersByMonth.length - 2]?.orders || 1) - 1) * 100)}%`
                : 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <p className="text-sm text-purple-800">Conversion Rate</p>
            <p className="text-xl font-bold text-purple-900">
              {analytics.conversionRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded">
            <p className="text-sm text-orange-800">Avg. Daily Revenue</p>
            <p className="text-xl font-bold text-orange-900">
              {analytics.ordersByDay.length > 0
                ? formatCurrency(analytics.totalRevenue / analytics.ordersByDay.length)
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}