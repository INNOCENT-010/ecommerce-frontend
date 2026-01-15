// app/context/CartonContext.tsx - FIXED VERSION
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types/product';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string | number, size?: string, color?: string) => void;
  updateQuantity: (productId: string | number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getCartForCheckout: () => Array<{
    product_id: number | string; // CHANGED: Can be string or number
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
    sku?: string;
  }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    setReady(true);
  }, []);

  // Persist cart to localStorage and notify
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  }, [items, ready]);

  // Add to cart with color/size distinction
  const addToCart = (product: Product, size?: string, color?: string) => {
    setItems(prev => {
      // Find exact match (same product + same size + same color)
      const existingItem = prev.find(
        item =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingItem) {
        // Update quantity of existing item
        return prev.map(item =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item with color/size
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          selectedSize: size,
          selectedColor: color,
        },
      ];
    });
  };

  // Remove specific item with color/size
  const removeFromCart = (productId: string | number, size?: string, color?: string) => {
    setItems(prev =>
      prev.filter(item =>
        !(item.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color)
      )
    );
  };

  // Update quantity of specific item with color/size
  const updateQuantity = (productId: string | number, quantity: number, size?: string, color?: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Prepare cart data for checkout API - FIXED: Accept both string and number IDs
  const getCartForCheckout = () => {
    return items
      .filter(item => item.id != null) // Filter out items with null/undefined id
      .map(item => {
        // Use the original id as-is (could be string UUID or number)
        const productId = item.id;
        
        // If id is null or undefined after filtering, skip (shouldn't happen)
        if (productId == null) {
          console.warn('Item has null id after filtering:', item);
          return null;
        }
        
        return {
          product_id: productId, // Keep as original type (string or number)
          name: item.name || 'Product',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          size: item.selectedSize || null,
          color: item.selectedColor || null,
          image: item.images?.[0]?.url || item.image_url || '',
          sku: item.sku || (typeof productId === 'string' ? productId : `SKU-${productId}`)
        };
      })
      .filter(item => item != null) as Array<{
        product_id: number | string; // Can be string or number
        name: string;
        price: number;
        quantity: number;
        size?: string;
        color?: string;
        image?: string;
        sku?: string;
      }>;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        getCartForCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
