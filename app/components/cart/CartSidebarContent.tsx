'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/app/context/CartonContext';

// Helper function to get first image URL from any format
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

export default function CartSidebarContent({ onClose }: { onClose: () => void }) {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-black text-white rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex items-start border-b pb-4"
          >
            {/* Clickable Product Image */}
            <Link 
              href={`/products/${item.slug || item.id}`}
              onClick={onClose}
              className="relative w-20 h-20 mr-4 flex-shrink-0"
            >
              <Image
                src={getFirstImageUrl(item.image)}
                alt={item.name}
                fill
                className="object-cover rounded hover:opacity-90 transition-opacity"
              />
            </Link>

            <div className="flex-1 min-w-0">
              {/* Clickable Product Name */}
              <Link 
                href={`/products/${item.slug || item.id}`}
                onClick={onClose}
                className="group"
              >
                <h3 className="text-sm font-medium hover:text-black transition-colors line-clamp-2">
                  {item.name}
                </h3>
              </Link>

              {/* Color and Size Info */}
              {(item.selectedColor || item.selectedSize) && (
                <div className="text-xs text-gray-500 mt-1">
                  {item.selectedColor && (
                    <span className="mr-3">
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

              <p className="text-sm font-bold mt-1">
                ₦{item.price.toLocaleString()}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex border rounded">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor);
                    }}
                    disabled={item.quantity <= 1}
                    className="px-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 min-w-[24px] text-center">{item.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor);
                    }}
                    className="px-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromCart(item.id, item.selectedSize, item.selectedColor);
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="text-sm font-bold ml-2 whitespace-nowrap">
              ₦{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t mt-4 pt-4 flex justify-between font-bold">
        <span>Total</span>
        <span>₦{totalPrice.toLocaleString()}</span>
      </div>
    </>
  );
}