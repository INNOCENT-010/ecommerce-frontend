'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types/product';

// Inherit image type from Product
interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  slug?: string;
  sku?: string;
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
    product_id: number | string;
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
        } as CartItem, // Type assertion to CartItem
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

  // Prepare cart data for checkout API
  const getCartForCheckout = () => {
    return items
      .filter(item => item.id != null)
      .map(item => {
        const productId = item.id;
        
        if (productId == null) {
          console.warn('Item has null id after filtering:', item);
          return null;
        }

        // Helper to get first image URL
        const getFirstImageUrl = (): string => {
          if (!item.image) return '';
          
          if (typeof item.image === 'string') {
            return item.image;
          } else if (Array.isArray(item.image)) {
            const firstItem = item.image[0];
            if (typeof firstItem === 'string') {
              return firstItem;
            } else if (firstItem && typeof firstItem === 'object' && 'url' in firstItem) {
              return firstItem.url;
            }
          }
          return '';
        };

        return {
          product_id: productId,
          name: item.name || 'Product',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          size: item.selectedSize || null,
          color: item.selectedColor || null,
          image: getFirstImageUrl(),
          sku: item.sku || (typeof productId === 'string' ? productId : `SKU-${productId}`)
        };
      })
      .filter(item => item != null) as Array<{
        product_id: number | string;
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
