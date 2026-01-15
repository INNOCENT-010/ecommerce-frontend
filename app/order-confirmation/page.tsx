'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Mail, Phone, MapPin, Clock, Shield, Download, Truck, Home, ShoppingBag, Calendar, CreditCard, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const orderNumberFromUrl = searchParams.get('order_number');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const sendOrderConfirmationEmail = async (orderData: any) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const response = await fetch(`${API_URL}/api/payments/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderData.order_number,
          email: orderData.customer_email,
          customer_name: orderData.customer_name,
          total_amount: orderData.total_amount
        }),
      });
    } catch (error) {
      console.error('Error sending order email:', error);
    }
  };

  useEffect(() => {
    const processOrder = async () => {
      try {
        setLoading(true);
        
        // Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        
        if (reference) {
          await verifyPayment(reference);
        } 
        else if (orderNumberFromUrl) {
          await fetchOrder(orderNumberFromUrl);
        }
        else {
          setError('No order information found');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error processing order:', err);
        setError('Failed to load order details. Please check your email for confirmation.');
        setLoading(false);
      }
    };

    processOrder();
  }, [reference, orderNumberFromUrl, router]);

  const verifyPayment = async (paymentReference: string) => {
    try {
      setVerifying(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const response = await fetch(`${API_URL}/api/payments/verify/${paymentReference}`);
      const data = await response.json();
      
      if (data.success) {
        await fetchOrder(data.data.order_number);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('order-placed'));
        }
      } else {
        setError(`Payment verification failed: ${data.message}`);
        setLoading(false);
      }
    } catch (err: any) {
      setError('Failed to verify payment. Please contact support.');
      setLoading(false);
    } finally {
      setVerifying(false);
    }
  };

  const fetchOrder = async (orderNumber: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/payments/order/${orderNumber}`);
      
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        
        if (orderData.customer_email) {
          sendOrderConfirmationEmail(orderData);
        }
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getShippingAddress = () => {
    if (!order || !order.shipping_address) return null;
    
    if (typeof order.shipping_address === 'object') {
      return order.shipping_address;
    } else if (order.shipping_address_id) {
      return {
        street: 'Address details will be confirmed',
        city: 'Your shipping location',
        state: 'Your state',
        country: 'Nigeria'
      };
    }
    return null;
  };

  const getPaymentMethod = () => {
    if (order?.order_data?.payment_method) {
      return order.order_data.payment_method;
    }
    return 'Card Payment';
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          {verifying ? (
            <>
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
                </div>
                <div className="relative flex justify-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-3 border-blue-600"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Payment</h1>
              <p className="text-gray-600 mb-6">
                We're confirming your payment with our secure payment gateway...
              </p>
              <div className="space-y-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Almost there!</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full animate-pulse"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <ShoppingBag className="h-16 w-16 text-gray-300 animate-pulse" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Preparing Your Order</h1>
              <p className="text-gray-600">
                Fetching your order details...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                <Shield className="h-10 w-10 text-red-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Order</h1>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:from-gray-800 hover:to-black transition-all duration-300 text-center shadow-md hover:shadow-lg"
            >
              Continue Shopping
            </Link>
            <Link
              href="/contact"
              className="border-2 border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddress = getShippingAddress();
  const paymentMethod = getPaymentMethod();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-2xl">
              <CheckCircle className="h-20 w-20 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full animate-bounce">
              ✓
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Thank you for shopping with us! Your payment was successful and your order is being processed.
          </p>
          
          <div className="inline-flex items-center justify-center gap-6 bg-white rounded-xl p-4 shadow-md">
            <div className="text-left">
              <p className="text-sm text-gray-500 font-medium">Order Number</p>
              <p className="text-xl font-bold text-gray-900 tracking-wider">{order?.order_number}</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-left">
              <p className="text-sm text-gray-500 font-medium">Order Date</p>
              <p className="text-lg font-medium text-gray-900">{order && formatDate(order.created_at)}</p>
            </div>
          </div>
          
          {reference && (
            <p className="text-sm text-gray-500 mt-4">
              Payment Reference: <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg">{reference}</span>
            </p>
          )}
        </div>

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 p-3 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Order Status</h3>
                      <p className="text-sm text-gray-600">Current status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <p className="text-lg font-semibold capitalize text-gray-900">{order.status}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-600 p-3 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Payment Status</h3>
                      <p className="text-sm text-gray-600">Payment status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <p className="text-lg font-semibold capitalize text-gray-900">{order.payment_status}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-purple-600 p-3 rounded-xl">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Payment Method</h3>
                      <p className="text-sm text-gray-600">How you paid</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{paymentMethod}</p>
                </div>
              </div>

              {/* Order Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Order Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-8">
                    {[
                      { status: 'Order Placed', completed: true, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
                      { status: 'Processing', completed: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered', icon: Package, color: order.status === 'processing' ? 'text-blue-600' : 'text-gray-400', bg: order.status === 'processing' ? 'bg-blue-100' : 'bg-gray-100' },
                      { status: 'Shipping', completed: order.status === 'shipped' || order.status === 'delivered', icon: Truck, color: order.status === 'shipped' ? 'text-yellow-600' : 'text-gray-400', bg: order.status === 'shipped' ? 'bg-yellow-100' : 'bg-gray-100' },
                      { status: 'Delivered', completed: order.status === 'delivered', icon: Home, color: order.status === 'delivered' ? 'text-purple-600' : 'text-gray-400', bg: order.status === 'delivered' ? 'bg-purple-100' : 'bg-gray-100' }
                    ].map((step, index) => (
                      <div key={step.status} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${step.bg} flex items-center justify-center`}>
                          <step.icon className={`h-6 w-6 ${step.color}`} />
                          {step.completed && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-gray-900">{step.status}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${step.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {step.completed ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {step.status === 'Order Placed' && 'Your order has been received'}
                            {step.status === 'Processing' && 'We are preparing your items'}
                            {step.status === 'Shipping' && 'Your order is on its way'}
                            {step.status === 'Delivered' && 'Your order has been delivered'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-bold text-xl flex items-center gap-3">
                    <ShoppingBag className="h-6 w-6 text-gray-700" />
                    Order Items ({order.items?.length || 0})
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-32 h-32 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900 mb-1">{item.product_name}</h4>
                              {item.product_sku && (
                                <p className="text-sm text-gray-500 mb-2">SKU: {item.product_sku}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 mb-4">
                                {item.size && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Size:</span>
                                    <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                                      {item.size}
                                    </span>
                                  </div>
                                )}
                                {item.color && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Color:</span>
                                    <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                                      {item.color}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Unit Price</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Quantity</p>
                                <p className="text-lg font-bold text-gray-900">{item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Subtotal</p>
                                <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white rounded-b-2xl">
                  <h4 className="font-bold text-lg mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Shipping</span>
                      <span className="font-medium text-green-400">FREE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tax</span>
                      <span className="font-medium">N/A</span>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-2xl font-bold">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Shipping Info */}
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-600" />
                  Customer Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <User className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{order.customer_email}</p>
                    </div>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                      <Phone className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{order.customer_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-green-600" />
                  Shipping Address
                </h3>
                {shippingAddress ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                        <div className="space-y-2">
                          {shippingAddress.street && (
                            <p className="font-medium text-gray-900">{shippingAddress.street}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {shippingAddress.city && (
                              <>
                                <span>{shippingAddress.city}</span>
                                <span>•</span>
                              </>
                            )}
                            {shippingAddress.state && (
                              <>
                                <span>{shippingAddress.state}</span>
                                <span>•</span>
                              </>
                            )}
                            {shippingAddress.country && (
                              <span>{shippingAddress.country}</span>
                            )}
                          </div>
                          {shippingAddress.postal_code && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-500">Postal Code:</span>
                              <span className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-medium">
                                {shippingAddress.postal_code}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Your order will be shipped to this address. Please ensure someone is available to receive it.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-yellow-700 font-medium">Shipping address will be confirmed</p>
                    <p className="text-sm text-yellow-600 mt-1">We will contact you for delivery details.</p>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                    <span className="text-lg">📝</span>
                    Order Notes
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-700 italic">{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-xl mb-6">Need Help?</h3>
                <div className="space-y-4">
                  <Link
                    href="/contact"
                    className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Contact Support</p>
                        <p className="text-sm text-gray-300">Questions about your order?</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
                  </Link>
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Download className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Print Receipt</p>
                        <p className="text-sm text-gray-300">Download order summary</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Happens Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Confirmation Email</h3>
              <p className="text-gray-600 text-sm">
                You'll receive an order confirmation email with all the details.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Processing Time</h3>
              <p className="text-gray-600 text-sm">
                Orders are typically processed within 24-48 hours.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Shipping Updates</h3>
              <p className="text-gray-600 text-sm">
                You'll receive tracking information once your order ships.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-xl font-medium hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="h-5 w-5" />
              Continue Shopping
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}