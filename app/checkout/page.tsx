// app/checkout/page.tsx - CORRECTED VERSION
'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartonContext';
import { useRouter } from 'next/navigation';
const getFirstImageUrl = (images: any): string => {
  if (!images) return '/placeholder-product.jpg';
  
  if (Array.isArray(images)) {
    if (images.length === 0) return '/placeholder-product.jpg';
    
    const firstImage = images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
      return firstImage.url || '/placeholder-product.jpg';
    }
    return '/placeholder-product.jpg';
  }
  
  // If images is a single string
  if (typeof images === 'string') {
    return images;
  }
  
  return '/placeholder-product.jpg';
};

export default function CheckoutPage() {
  const { items, totalPrice, getCartForCheckout } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    email: '',
    customer_name: '',
    customer_phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
  try {
    setLoading(true);
    setError('');

    // Validate shipping info
    if (!shippingInfo.email || !shippingInfo.customer_name || 
        !shippingInfo.street || !shippingInfo.city || !shippingInfo.state) {
      throw new Error('Please fill in all required shipping information');
    }

    if (!shippingInfo.customer_phone) {
      throw new Error('Phone number is required for delivery');
    }

    // Get cart items
    const cartItems = getCartForCheckout();
    
    
    // Create payload with your real cart data
    const payload = {
      cart_items: cartItems.map(item => {
        // Ensure product_id is a number
        let productId = item.product_id;
        if (typeof productId === 'string') {
          const num = parseInt(productId, 10);
          productId = isNaN(num) ? productId : num;
        }
        
        return {
          product_id: productId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size || null,
          color: item.color || null,
          image: item.image || '',
          sku: item.sku || ''
        };
      }),
      shipping_address: {
        street: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country,
        postal_code: shippingInfo.postal_code || ''
      },
      email: shippingInfo.email,
      total_amount: Number(totalPrice),
      currency: 'NGN',
      customer_name: shippingInfo.customer_name,
      customer_phone: shippingInfo.customer_phone,
      notes: ''
    };

    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    // FIRST: Test with debug endpoint
    const debugResponse = await fetch(`${API_URL}/api/payments/initialize-debug`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const debugData = await debugResponse.json();
    if (!debugData.success) {
      throw new Error(`Debug failed: ${JSON.stringify(debugData.errors || debugData.message)}`);
    }

    // SECOND: Try real payment endpoint
    const response = await fetch(`${API_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || `Payment failed with status ${response.status}`);
      }

      // Check for payment URL
      if (responseData.data && responseData.data.authorization_url) {
        window.location.href = responseData.data.authorization_url;
      } else if (responseData.authorization_url) {
      
      } else {
        console.error('❌ Unexpected response structure:', responseData);
        throw new Error('No payment URL received from server');
      }
    } else {
      // Response is not JSON
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
    }

  } catch (err: any) {
    console.error('Full checkout error:', err);
    setError(err.message || 'Checkout failed. Please try again.');
  } finally {
    setLoading(false);
  }
  };
  // Calculate subtotal
  const subtotal = totalPrice;
  const shipping: number= 0;
  const tax: number = 0;
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Shipping Information */}
        <div>
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={shippingInfo.customer_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={shippingInfo.customer_phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="+234 801 234 5678"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingInfo.street}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                    placeholder="Lagos"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                    placeholder="Lagos State"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={shippingInfo.postal_code}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                    placeholder="100001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value="Nigeria"
                    disabled
                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Order...
              </span>
            ) : 'Proceed to Payment'}
          </button>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            You'll be redirected to Paystack to complete your payment securely.
          </p>
        </div>
        
        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-white border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Items ({items.length})</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} 
                       className="flex items-start border-b pb-4">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      
                        <img 
                          src={getFirstImageUrl(item.image)} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      
        
                     
                        </div>
                      
                    
                    
                    {/* Product Details */}
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      
                      {/* Color/Size Display */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex items-center gap-2 mt-1">
                          {item.selectedColor && (
                            <div className="flex items-center text-xs text-gray-600">
                              <div 
                                className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                                style={{ backgroundColor: item.selectedColor.toLowerCase() }}
                              />
                              {item.selectedColor}
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="text-xs text-gray-600">
                              Size: {item.selectedSize}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </div>
                        <div className="font-medium">
                          ₦{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Totals */}
            <div className="border-t pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₦${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>{tax === 0 ? 'N/A' : `₦${tax.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>₦{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Payment Methods</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit/debit cards, bank transfers, and USSD via Paystack.
              </p>
              <div className="flex items-center mt-3">
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">VISA</span>
                  </div>
                  <div className="w-8 h-5 bg-yellow-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">MC</span>
                  </div>
                  <div className="w-8 h-5 bg-green-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">Verve</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continue Shopping Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/products')}
              className="text-sm text-gray-600 hover:text-black underline"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}