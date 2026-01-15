// src/lib/cart.ts (create if doesn't exist)
export const cartService = {
  getCart: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },


  addToCart: (product: CartItem): CartItem[] => {
    const cart = cartService.getCart();
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      cart.push({ ...product, quantity: product.quantity || 1 });
    }
    
    cartService.saveCart(cart);
    return cart;
  },

  removeFromCart: (id: number): CartItem[] => {
    const cart = cartService.getCart();
    const updated = cart.filter(item => item.id !== id);
    cartService.saveCart(updated);
    return updated;
  },

  updateQuantity: (id: number, quantity: number): CartItem[] => {
    const cart = cartService.getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
      item.quantity = quantity;
      cartService.saveCart(cart);
    }
    
    return cart;
  },

  clearCart: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('cart');
  }
};