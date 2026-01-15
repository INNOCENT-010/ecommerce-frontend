// app/admin/orders/page.tsx - UPDATED VERSION
'use client';

import { useEffect, useState } from 'react';
import { adminAPI, type EnhancedOrder } from '@/lib/admin-api';
import { Search, Eye, Package, MapPin, Palette, Ruler, Download, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function EnhancedOrdersPage() {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const data = await adminAPI.getEnhancedOrders({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_status: paymentFilter !== 'all' ? paymentFilter : undefined,
        search: search || undefined
      });
      
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders(1);
  };

  const handleFilter = () => {
    fetchOrders(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3">Loading enhanced orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Orders</h1>
          <p className="text-gray-600">
            {pagination.total} total orders • Showing {orders.length} orders
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchOrders(pagination.page)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center gap-2 text-sm sm:text-base"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="border px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm sm:text-base">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setTimeout(() => handleFilter(), 100);
          }}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setTimeout(() => handleFilter(), 100);
          }}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
        >
          <option value="all">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders Grid - UPDATED TO 4 COLUMNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border">
            <div className="p-4">
              {/* Order Header - Compact */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate" title={order.order_number}>
                    {order.order_number}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-sm">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>

              {/* Customer Info - Compact */}
              <div className="mb-3">
                <p className="font-medium text-sm truncate" title={order.customer_name || 'Guest'}>
                  {order.customer_name || 'Guest'}
                </p>
                <p className="text-xs text-gray-600 truncate" title={order.customer_email}>
                  {order.customer_email}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.created_at)}
                </p>
              </div>

              {/* Items Preview - Compact */}
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <Package size={12} className="text-gray-400" />
                  <span className="text-xs font-medium">
                    {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {order.items_preview.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <div className="flex-1 truncate pr-2">
                        <span className="font-medium truncate" title={item.name}>
                          {item.name}
                        </span>
                        {(item.size || item.color) && (
                          <span className="text-gray-500 block truncate text-xs">
                            {item.size && `Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-medium">₦{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Badges - Only show if exists */}
              {(order.has_size || order.has_color) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {order.has_size && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      <Ruler size={10} />
                      <span className="truncate max-w-[60px]">
                        {order.size_variants[0]}
                        {order.size_variants.length > 1 && '+'}
                      </span>
                    </div>
                  )}
                  {order.has_color && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                      <Palette size={10} />
                      <span className="truncate max-w-[60px]">
                        {order.color_variants[0]}
                        {order.color_variants.length > 1 && '+'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions - Compact */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500 truncate pr-2">
                  {order.paid_at ? 'Paid' : 'Pending'}
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => fetchOrders(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
          >
            Previous
          </button>
          <span className="text-gray-600 text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchOrders(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow border">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            {search || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'No orders match your current filters.'
              : 'Orders will appear here when customers make purchases.'}
          </p>
          {(search || statusFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPaymentFilter('all');
                fetchOrders(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Refresh icon component
function RefreshCw(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}