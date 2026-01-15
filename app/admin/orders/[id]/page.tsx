'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI, type OrderDetail } from '@/lib/admin-api';
import { ArrowLeft, Package, CreditCard, Truck, User, MapPin, Ruler, Palette, Tag, FileText } from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getOrderDetails(orderId);
      setOrder(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      fetchOrder(); // Refresh order data
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Order not found</h2>
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Order {order.order.order_number}</h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.order.created_at)}
              {order.order.paid_at && ` • Paid on ${formatDate(order.order.paid_at)}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={order.order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: 
                order.order.status === 'pending' ? '#FEF3C7' :
                order.order.status === 'processing' ? '#DBEAFE' :
                order.order.status === 'shipped' ? '#E0E7FF' :
                order.order.status === 'delivered' ? '#D1FAE5' :
                '#FEE2E2',
              color:
                order.order.status === 'pending' ? '#92400E' :
                order.order.status === 'processing' ? '#1E40AF' :
                order.order.status === 'shipped' ? '#3730A3' :
                order.order.status === 'delivered' ? '#065F46' :
                '#991B1B'
            }}
          >
            <option value="pending">PENDING</option>
            <option value="processing">PROCESSING</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            order.order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {order.order.payment_status.toUpperCase()}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package size={20} />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}
                    <div>
                      <h4 className="font-bold">{item.product_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.size && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            <Ruler size={12} />
                            <span>Size: {item.size}</span>
                          </div>
                        )}
                        {item.color && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                            <Palette size={12} />
                            <span>Color: {item.color}</span>
                          </div>
                        )}
                        {item.sku && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                            <Tag size={12} />
                            <span>SKU: {item.sku}</span>
                          </div>
                        )}
                      </div>
                      {item.current_stock !== undefined && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Current stock: {item.current_stock} • 
                            Status: {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-bold mt-1">Total: {formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Stats */}
          {order.summary && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText size={20} />
                Order Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{order.summary.items_count}</p>
                  <p className="text-sm text-gray-600">Items</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{order.summary.total_quantity}</p>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{order.summary.size_variants.length}</p>
                  <p className="text-sm text-gray-600">Size Variants</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{order.summary.color_variants.length}</p>
                  <p className="text-sm text-gray-600">Color Variants</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User size={20} />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.order.customer_email}</p>
              </div>
              {order.order.customer_phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{order.order.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.order.shipping_address && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Shipping Address
              </h3>
              <div className="space-y-2">
                {order.order.shipping_address.full_address ? (
                  <p className="text-gray-700">{order.order.shipping_address.full_address}</p>
                ) : (
                  <>
                    {order.order.shipping_address.street && (
                      <p className="font-medium">{order.order.shipping_address.street}</p>
                    )}
                    <p className="text-gray-600">
                      {order.order.shipping_address.city}, {order.order.shipping_address.state}
                    </p>
                    <p className="text-gray-600">
                      {order.order.shipping_address.country} {order.order.shipping_address.postal_code && `- ${order.order.shipping_address.postal_code}`}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {order.transaction && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="font-medium">{order.transaction.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">{formatCurrency(order.transaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{order.transaction.status}</p>
                </div>
                {order.transaction.channel && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium capitalize">{order.transaction.channel}</p>
                  </div>
                )}
                {order.transaction.paid_at && (
                  <div>
                    <p className="text-sm text-gray-600">Paid At</p>
                    <p className="font-medium">{formatDate(order.transaction.paid_at)}</p>
                  </div>
                )}
                {order.transaction.card_last4 && (
                  <div>
                    <p className="text-sm text-gray-600">Card</p>
                    <p className="font-medium">
                      **** **** **** {order.transaction.card_last4} • {order.transaction.card_type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Order Notes</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 whitespace-pre-line">{order.order.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50"
              >
                Print Invoice
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(order.order.order_number)}
                className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50"
              >
                Copy Order Number
              </button>
              <button
                onClick={fetchOrder}
                className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50"
              >
                Refresh Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}