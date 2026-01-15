// app/cart/page.tsx - UPDATED
'use client';

import { useCart } from '@/app/context/CartonContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some products to get started!</p>
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-lg font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div 
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} 
              className="flex items-center border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Clickable Product Image */}
              <Link 
                href={`/products/${item.slug || item.id}`}
                className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 flex-shrink-0"
              >
                <Image
                  src={item.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Clickable Product Details */}
              <div className="ml-6 flex-1 min-w-0">
                <Link 
                  href={`/products/${item.slug || item.id}`}
                  className="group"
                >
                  <h3 className="font-medium hover:text-black transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                
                {/* Display Color/Size */}
                {(item.selectedColor || item.selectedSize) && (
                  <div className="text-sm text-gray-600 mt-1">
                    {item.selectedColor && (
                      <span className="mr-4">
                        Color: <span className="font-medium">{item.selectedColor}</span>
                      </span>
                    )}
                    {item.selectedSize && (
                      <span>
                        Size: <span className="font-medium">{item.selectedSize}</span>
                      </span>
                    )}
                  </div>
                )}

                <p className="font-bold mt-2">₦{item.price.toLocaleString()}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                  className="p-1 border rounded-l hover:bg-gray-100 transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-1 border-t border-b text-center min-w-[40px]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                  className="p-1 border rounded-r hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors p-2"
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {/* Clear Cart Button */}
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-black text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3"
            >
              Proceed to Checkout
            </Link>
            
            <Link
              href="/"
              className="block w-full border border-black text-black text-center py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}