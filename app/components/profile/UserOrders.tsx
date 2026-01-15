// app/components/profile/UserOrders.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, Truck, Home, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserOrdersProps {
  userId: number | null;
}

interface Order {
  id: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  shipping_info: string;
  created_at: string;
  paid_at?: string;
  items_count: number;
}

export default function UserOrders({ userId }: UserOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/payments/user/${userId}/orders`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
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
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
      case 'processing':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-lg mb-2">Sign in to view orders</h3>
        <p className="text-gray-600 mb-4">
          Sign in to see your order history and track your purchases
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">Unable to load orders</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchUserOrders}
          className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-lg mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-4">
          Your order history will appear here after you make a purchase
        </p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 text-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          {/* Order Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/order-confirmation?order_number=${order.order_number}`}
                  className="font-bold text-sm hover:text-blue-600 truncate"
                  title={order.order_number}
                >
                  {order.order_number}
                </Link>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm">{formatCurrency(order.total_amount)}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                {getStatusIcon(order.status)}
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Items:</span>
              <span className="font-medium">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Payment:</span>
              <span className={`font-medium ${
                order.payment_status === 'paid' ? 'text-green-600' : 
                order.payment_status === 'failed' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Shipping:</span>
              <span className="font-medium truncate max-w-[120px]" title={order.shipping_info}>
                {order.shipping_info}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/order-confirmation?order_number=${order.order_number}`}
              className="flex-1 text-center border border-gray-300 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition"
            >
              View Details
            </Link>
            {order.status === 'shipped' || order.status === 'processing' ? (
              <button
                className="flex-1 text-center border border-gray-300 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition"
                onClick={() => alert('Tracking info coming soon!')}
              >
                Track
              </button>
            ) : null}
          </div>
        </div>
      ))}
      
      {orders.length > 0 && (
        <div className="text-center pt-4 border-t">
          <Link
            href="/orders"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
          >
            View all {orders.length} order{orders.length !== 1 ? 's' : ''}
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}