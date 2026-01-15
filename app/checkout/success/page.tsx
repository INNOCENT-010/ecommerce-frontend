// app/checkout/success/page.tsx - UPDATED WITH REAL DATA
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Mail, Clock, Truck } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const orderNumber = searchParams.get('order');
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyOrder = async () => {
      try {
        setLoading(true);
        
        // Clear cart first
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        
        // If we have a reference, verify payment
        if (reference) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
          
          // Verify payment with backend
          const verifyResponse = await fetch(`${API_URL}/api/payments/verify/${reference}`);
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            // Get order details
            const orderResponse = await fetch(`${API_URL}/api/payments/order/${verifyData.data.order_number}`);
            
            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              setOrderDetails(orderData);
              // Trigger order update in profile
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('order-placed', {
                  detail: orderData
                }));
              }
            } else {
              setError('Order details not found');
            }
          } else {
            setError(`Payment verification failed: ${verifyData.message}`);
          }
        } else if (orderNumber) {
          // Fallback: Try to get order by order number
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
          const orderResponse = await fetch(`${API_URL}/api/payments/order/${orderNumber}`);
          
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            setOrderDetails(orderData);
          } else {
            setError('Order not found');
          }
        } else {
          // No reference or order number, redirect to home
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (err: any) {
        console.error('Error verifying order:', err);
        setError('Failed to verify order. Please check your email for confirmation.');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [reference, orderNumber, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {loading ? 'Processing Your Order...' : 'Order Confirmed! 🎉'}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Please wait while we process your payment...' : 'Thank you for your purchase. Your order is being processed.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing your order...</p>
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Order Number</p>
                    <p className="text-xl font-bold">{orderDetails.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold">{formatCurrency(orderDetails.total_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Status
                </h3>
                <div className="flex items-center">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs font-medium">Order Placed</p>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                  <div className="text-center">
                    <div className={`w-10 h-10 ${orderDetails.status === 'processing' ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Package className={`w-5 h-5 ${orderDetails.status === 'processing' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-xs">Processing</p>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Shipping</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{orderDetails.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{orderDetails.customer_email}</p>
                  </div>
                  {orderDetails.customer_phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{orderDetails.customer_phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{formatDate(orderDetails.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Unable to load order details.</p>
              <p className="text-sm text-gray-500 mt-2">Check your email for confirmation.</p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Order Confirmation Email</p>
                <p className="text-sm text-gray-600">You will receive an email with all order details</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600">2</span>
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-gray-600">We'll prepare your order within 24 hours</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-purple-600">3</span>
              </div>
              <div>
                <p className="font-medium">Shipping Updates</p>
                <p className="text-sm text-gray-600">Tracking information will be sent via email</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="flex-1 text-center px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
          {orderDetails && (
            <Link
              href={`/order-confirmation?order_number=${orderDetails.order_number}`}
              className="flex-1 text-center px-6 py-3 border-2 border-black text-black rounded-lg font-medium hover:bg-gray-50 transition"
            >
              View Order Details
            </Link>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Need help? Contact us at <a href="mailto:support@bloomg.com" className="text-blue-600 hover:underline">support@bloomg.com</a></p>
          <p className="mt-1">or call +234 800 000 0000</p>
          {reference && (
            <p className="mt-2 text-xs">
              Payment Reference: <span className="font-mono">{reference}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}