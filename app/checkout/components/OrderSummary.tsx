// src/app/checkout/components/OrderSummary.tsx
'use client';

import { useCart } from '../../context/CartonContext'; // ← FIXED IMPORT PATH
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OrderSummaryProps { 
  shippingData?: any;
  currentStep?: number;
}

export default function OrderSummary({ shippingData, currentStep = 1 }: OrderSummaryProps) {
  const { items: cartItems, totalPrice } = useCart(); // This should work now
  
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Debug: Check what's in cart
  useEffect(() => {
    }, [cartItems, totalPrice]);

  // Calculate shipping
  const shipping = totalPrice >= 50000 ? 0 : 2000;
  const grandTotal = totalPrice + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
        <h2 className="text-xl font-bold mb-6 pb-4 border-b">Order Summary</h2>
        
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <a 
            href="/products" 
            className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-xl font-bold mb-6 pb-4 border-b">Order Summary</h2>

      {/* Cart Items List */}
      <div className="mb-6 max-h-80 overflow-y-auto">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-start space-x-3">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                {item.images?.[0]?.url ? (
                  <Image
                    src={item.images[0].url}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-lg">📦</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  {item.selectedColor && <span>Color: {item.selectedColor} • </span>}
                  {item.selectedSize && <span>Size: {item.selectedSize} • </span>}
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString('en-NG')}</span>
                  <span className="text-xs text-gray-500">₦{item.price.toLocaleString('en-NG')} each</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Code */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Discount code"
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
            disabled={applyingDiscount}
          />
          <button
            onClick={() => {
              setApplyingDiscount(true);
              setTimeout(() => {
                setDiscount(totalPrice * 0.1);
                setApplyingDiscount(false);
              }, 1000);
            }}
            disabled={applyingDiscount || !discountCode.trim()}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            {applyingDiscount ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {discount > 0 && (
          <p className="text-green-600 text-sm mt-2">
            ✓ Discount applied: -₦{discount.toLocaleString('en-NG')}
          </p>
        )}
      </div>

      {/* Order Totals */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
          <span>₦{totalPrice.toLocaleString('en-NG')}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className={shipping === 0 ? 'text-green-600' : ''}>
            {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString('en-NG')}`}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-₦{discount.toLocaleString('en-NG')}</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-bold border-t pt-3">
          <span>Total</span>
          <span>₦{grandTotal.toLocaleString('en-NG')}</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 pt-6 border-t">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col items-center text-center">
            <div className="text-green-600 mb-1"></div>
            <span className="text-gray-600">Secure SSL encryption</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-green-600 mb-1"></div>
            <span className="text-gray-600">Free shipping over ₦50,000</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-green-600 mb-1">↩</div>
            <span className="text-gray-600">7-day return policy</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-green-600 mb-1"></div>
            <span className="text-gray-600">Authentic products</span>
          </div>
        </div>
      </div>
    </div>
  );
}