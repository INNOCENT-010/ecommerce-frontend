// lib/api.ts
// Based on your actual FastAPI endpoints + Supabase integration + Paystack

import { sanitizePrice } from './utils/priceUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ========== TYPES FIRST ==========
export interface UserInfo {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  parent_id?: number;
  created_at: string;
  updated_at?: string;
}
// Add this to your types in lib/api.ts
export interface DownloadStats {
  total_downloads: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    downloads: number;
  }>;
  downloads_by_date: Array<{
    date: string;
    downloads: number;
  }>;
}
export interface ProductImage {
  id: number;
  product_id: number;
  filename: string;
  filepath: string;
  url: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

// Extended Product interface with Supabase fields
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  category?: Category;
  stock: number;
  sku?: string;
  is_active: boolean;
  is_new: boolean;
  is_sale: boolean;
  download_count?: number;
  images: ProductImage[];
  attributes?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  
  // Additional fields for frontend
  slug?: string;
  colors?: string[];
  sizes?: string[];
  featured?: boolean;
  tags?: string[];
}

// Supabase Product interface
export interface SupabaseProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  tags: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  sku: string | null;
  featured: boolean;
  product_images: {
    url: string;
    alt_text: string | null;
  }[];
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface AddressResponse extends Address {
  id: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderCreatePayload {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: Address;
  billing_address?: Address;
  payment_method: string;
  customer_note?: string;
}

export interface GuestOrderCreatePayload extends OrderCreatePayload {
  customer_email: string;
  customer_phone: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface OrderResponse {
  id: number;
  order_number: string;
  user_id?: number;
  customer_email?: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: AddressResponse;
  billing_address?: AddressResponse;
  items: OrderItem[];
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentResponse {
  authorization_url?: string;
  access_code?: string;
  reference: string;
  status: string;
}

// ========== PAYSTACK TYPES ==========
export interface PaystackCartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  sku?: string;
}

export interface PaystackAddress {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string;
  country?: string;
  postal_code?: string;
  phone: string;
  email: string;
}

export interface PaystackOrderCreate {
  cart_items: PaystackCartItem[];
  shipping_address: PaystackAddress;
  billing_address?: PaystackAddress;
  email: string;
  total_amount: number;
  currency?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

export interface PaystackInitializeResponse {
  success: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
    order_number: string;
    public_key: string;
    order_id: number;
  };
}

export interface PaystackVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    order_number: string;
    order_id: number;
    status: string;
    payment_status: string;
    amount: number;
    paid_at: string;
    reference: string;
  };
}

export interface PaystackOrderResponse {
  id: number;
  order_number: string;
  customer_email?: string;
  customer_name?: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_reference?: string;
  paystack_authorization_url?: string;
  items: any[];
  shipping_address: any;
  created_at: string;
}

// ========== TOKEN HANDLING ==========
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// ========== SUPABASE HELPER ==========
async function supabaseRequest<T>(
  table: string,
  options: {
    select?: string;
    eq?: { column: string; value: any };
    order?: { column: string; ascending?: boolean };
    limit?: number;
  } = {}
): Promise<T[]> {
  try {
    // Dynamically import supabase to avoid build issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    let query = supabase.from(table).select(options.select || '*');
    
    if (options.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }
    
    if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending !== false 
      });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Supabase error (${table}):`, error);
      return [];
    }
    
    return data as T[];
  } catch (error) {
    console.error(`Failed to fetch from Supabase (${table}):`, error);
    return [];
  }
}

// lib/api.ts - Update convertSupabaseProduct
function convertSupabaseProduct(supabaseProduct: any): Product {
  // Debug image data
  const price = sanitizePrice(supabaseProduct.price || 0);
  const original_price = supabaseProduct.original_price 
    ? sanitizePrice(supabaseProduct.original_price)
    : undefined;
  
  // Create images array EXACTLY like ProductDetail.tsx does
  const images = (supabaseProduct.product_images || [])
    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    .map((img: any, index: number) => ({
      id: img.id || index,
      product_id: img.product_id || 0,
      filename: img.url?.split('/').pop() || `image-${index}.jpg`,
      filepath: img.url || '',
      url: img.url || '/fallbacks/product-placeholder.jpg', // Use directly like ProductDetail
      is_primary: img.is_primary || index === 0,
      order: img.order_index || index,
      created_at: img.created_at || new Date().toISOString()
    }));
  
  return {
    id: supabaseProduct.id 
      ? parseInt(supabaseProduct.id.replace(/-/g, '').substring(0, 8), 16) 
      : Math.floor(Math.random() * 1000000),
    name: supabaseProduct.name || 'Unnamed Product',
    slug: supabaseProduct.slug || '',
    description: supabaseProduct.description || undefined,
    price: price,
    original_price: original_price,
    category: { 
      id: 0, 
      name: supabaseProduct.category || 'Uncategorized', 
      slug: (supabaseProduct.category || 'uncategorized').toLowerCase(),
      created_at: new Date().toISOString()
    },
    category_id: 0,
    stock: supabaseProduct.stock || 0,
    sku: supabaseProduct.sku || undefined,
    is_active: true,
    is_new: supabaseProduct.tags?.includes('new') || false,
    is_sale: !!(original_price && original_price > price), 
    images: images,
    colors: supabaseProduct.colors || [],
    sizes: supabaseProduct.sizes || [],
    featured: supabaseProduct.featured || false,
    tags: supabaseProduct.tags || [],
    created_at: supabaseProduct.created_at || new Date().toISOString(),
    attributes: {}
  };
  }

// ========== GET PRODUCT BY SLUG FUNCTION ==========
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Direct Supabase query instead of using supabaseRequest helper
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('❌ Supabase query error:', error.message);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    const converted = convertSupabaseProduct(data);
    return converted;
    
  } catch (error) {
    console.error('❌ Error in getProductBySlug:', error);
    return null;
  }
}

// ========== CORE FETCH WRAPPER (for your existing API) ==========
async function request<T>(
  path: string,
  options: RequestInit = {},
  auth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {};
  
  // Set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Merge any existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Add Authorization header if needed
  if (auth) {
    const token = getToken();
    if (!token) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      throw new Error('Not authenticated');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const errorDetail = data.detail || data.message || `API Error: ${res.status}`;
    
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    
    if (res.status === 403 && errorDetail.includes('Admin access required')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    
    throw new Error(errorDetail);
  }

  return data as T;
}

// ========== PAYSTACK UTILITY FUNCTIONS ==========
export const paystackUtils = {
  // Load Paystack script
  loadScript: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  },

  // Initialize Paystack UI
  initializeUI: (
    email: string,
    amount: number,
    reference: string,
    publicKey: string,
    onSuccess: (response: any) => void,
    onClose?: () => void
  ) => {
    if (typeof window === 'undefined') return;

    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      currency: 'NGN',
      callback: onSuccess,
      onClose: onClose,
    });

    handler.openIframe();
  },

  // Create order reference
  generateOrderReference: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `BLOOMG_${timestamp}_${random}`;
  },

  // Validate shipping data
  validateShippingData: (shippingData: any): { isValid: boolean; error?: string } => {
    if (!shippingData) {
      return { isValid: false, error: 'Shipping information is incomplete' };
    }
    
    const requiredFields = [
      'firstName',
      'lastName', 
      'email',
      'phone',
      'address',
      'city',
      'state',
      'postalCode'
    ];
    
    for (const field of requiredFields) {
      if (!shippingData[field]?.trim()) {
        return { 
          isValid: false, 
          error: `Shipping information is incomplete: ${field} is required` 
        };
      }
    }
    
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(shippingData.email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    return { isValid: true };
  }
};

// ========== API METHODS ==========
export const api = {
  // ========== AUTH ENDPOINTS ==========
  login: (email: string, password: string) => {
    return request<{ 
      access_token: string; 
      token_type: string;
      user: UserInfo;
    }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then((data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    });
  },

  adminLogin: (email: string, password: string) => {
    return request<{ 
      access_token: string; 
      token_type: string;
      user: UserInfo;
    }>('/api/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then((data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    });
  },

  register: (payload: { email: string; password: string; full_name: string }) => {
    return request<UserInfo>('/api/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: () => {
    return request<UserInfo>('/api/me', {}, true);
  },

  checkAdminStatus: () => {
    return request<{ is_admin: boolean }>('/api/check-admin', {}, true);
  },

  checkAdminExists: () => {
    return request<{ admin_exists: boolean }>('/api/check-admin-exists');
  },

  verifyAdmin: () => {
    return request<{ 
      is_admin: boolean; 
      email: string; 
      user_id: number;
    }>('/api/verify-admin', {}, true);
  },

  createAdminUser: (payload: { email: string; password: string; full_name: string }) => {
    return request<UserInfo>('/api/create-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  createFirstAdmin: () => {
    return request<{ 
      message: string; 
      admin: UserInfo;
      credentials?: {
        email: string;
        password: string;
        warning: string;
      };
    }>('/api/create-first-admin', {
      method: 'POST',
    });
  },

  logout: () => {
    return request('/api/logout', {
      method: 'POST',
    }, true).then(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    });
  },

  // ========== CATEGORIES ==========
  getCategories: () => {
    return request<Category[]>('/api/categories');
  },

  getCategory: (categoryId: number) => {
    return request<Category>(`/api/${categoryId}`);
  },

  // ========== PRODUCTS ==========
  getProducts: async (): Promise<Product[]> => {
    try {
      // Try Supabase first
      const supabaseProducts = await supabaseRequest<SupabaseProduct>('products', {
        select: '*, product_images(*)',
        order: { column: 'created_at', ascending: false }
      });
      
      if (supabaseProducts.length > 0) {
        return supabaseProducts.map(convertSupabaseProduct);
      }
      
      // Fallback to your existing API
      return request<Product[]>('/api/products');
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getProduct: async (productId: number): Promise<Product | null> => {
    try {
      // Try your existing API first
      return await request<Product>(`/api/${productId}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  getProductsByCategory: async (categoryName: string, tag?: string): Promise<Product[]> => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      
      // FIRST: Get the category ID for the given category name
      // Note: Your categories table has names like "Newin", "Swimwear", "dresses" (lowercase)
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName) // Exact match to your database names
        .single();
      
      if (categoryError || !categoryData) {
        console.error(`❌ Category not found: "${categoryName}"`, categoryError);
        return [];
      }
      
      let query = supabase
        .from('products')
        .select('*, product_images(*)');
      
      // NOW filter by the category ID (UUID)
      query = query.eq('category', categoryData.id);
      
      // Apply tag filter if provided (search in tags array)
      if (tag) {
        query = query.contains('tags', [tag.toLowerCase()]);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data: supabaseProducts, error } = await query;
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        return [];
      }
      
      if (supabaseProducts && supabaseProducts.length > 0) {
        return supabaseProducts.map(convertSupabaseProduct);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      return [];
    }
  },

  updateProduct: (productId: number, payload: Partial<Product>) => {
    return request<Product>(`/api/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true);
  },

  deleteProduct: (productId: number) => {
    return request(`/api/${productId}`, {
      method: 'DELETE',
    }, true);
  },

  incrementDownload: (productId: number) => {
    return request(`/api/${productId}/download`, {
      method: 'POST',
    }, true);
  },

  uploadProductImages: (productId: number, formData: FormData) => {
    return request<ProductImage[]>(`/api/${productId}/upload-images`, {
      method: 'POST',
      body: formData,
    }, true);
  },

  // ========== CART ==========
  addToCart: (productId: number, quantity: number = 1) => {
    return request<CartItem>('/api/add', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    }, true);
  },

  updateCartItem: (cartItemId: number, quantity: number) => {
    return request<CartItem>(`/api/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, true);
  },

  removeFromCart: (cartItemId: number) => {
    return request(`/api/${cartItemId}`, {
      method: 'DELETE',
    }, true);
  },

  clearCart: () => {
    return request('/api/', {
      method: 'DELETE',
    }, true);
  },

  // ========== ORDERS ==========
  createOrder: (payload: OrderCreatePayload) => {
    return request<OrderResponse>('/api/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  createGuestOrder: (payload: GuestOrderCreatePayload) => {
    return request<OrderResponse>('/api/guest/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getOrder: (orderId: number) => {
    return request<OrderResponse>(`/api/${orderId}`, {}, true);
  },

  initiatePayment: (orderId: number) => {
    return request<PaymentResponse>(`/api/${orderId}/initiate-payment`, {
      method: 'POST',
    }, true);
  },

  initiateGuestPayment: (orderId: number) => {
    return request<PaymentResponse>(`/api/guest/${orderId}/initiate-payment`, {
      method: 'POST',
    });
  },

  confirmPayment: (orderId: number) => {
    return request<OrderResponse>(`/api/${orderId}/confirm-payment`, {
      method: 'POST',
    }, true);
  },

  confirmGuestPayment: (orderId: number) => {
    return request<OrderResponse>(`/api/guest/${orderId}/confirm-payment`, {
      method: 'POST',
    });
  },

  // ========== ADDRESSES ==========
  getUserAddresses: () => {
    return request<AddressResponse[]>('/api/');
  },

  createAddress: (payload: Address) => {
    return request<AddressResponse>('/api/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  updateAddress: (addressId: number, payload: Address) => {
    return request<AddressResponse>(`/api/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true);
  },

  deleteAddress: (addressId: number) => {
    return request(`/api/${addressId}`, {
      method: 'DELETE',
    }, true);
  },

  // ========== ADMIN ENDPOINTS ==========
  getAllUsers: () => {
    return request<UserInfo[]>('/api/users', {}, true);
  },

  deleteUser: (userId: number) => {
    return request(`/api/users/${userId}`, {
      method: 'DELETE',
    }, true);
  },

  toggleAdminStatus: (userId: number) => {
    return request<UserInfo>(`/api/users/${userId}/toggle-admin`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    }, true);
  },

  getDownloadStats: () => {
    return request<any>('/api/admin/stats/downloads', {}, true);
  },

  // ========== PAYSTACK PAYMENT ENDPOINTS ==========
  paystack: {
    // Initialize Paystack payment (new endpoint)
    initializePayment: (orderData: PaystackOrderCreate) => {
      return request<PaystackInitializeResponse>('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    // Verify Paystack payment (new endpoint)
    verifyPayment: (reference: string) => {
      return request<PaystackVerifyResponse>(`/api/payments/verify/${reference}`);
    },

    // Get order by order number (new endpoint)
    getOrderByNumber: (orderNumber: string) => {
      return request<PaystackOrderResponse>(`/api/payments/order/${orderNumber}`);
    },

    // Convert regular cart items to Paystack format
    convertToPaystackCart: (cartItems: any[]): PaystackCartItem[] => {
      return cartItems.map(item => ({
        id: item.id || 0,
        product_id: item.id || 0,
        name: item.name || 'Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.images?.[0]?.url || item.image || '',
        size: item.selectedSize,
        color: item.selectedColor,
        sku: item.sku || ''
      }));
    },

    // Convert address to Paystack format
    convertToPaystackAddress: (address: any, email: string): PaystackAddress => {
      const nameParts = (address.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        first_name: firstName || address.firstName || '',
        last_name: lastName || address.lastName || '',
        street: address.address_line1 || address.address || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || 'Nigeria',
        postal_code: address.postal_code || address.postalCode || '',
        phone: address.phone || '',
        email: email || address.email || ''
      };
    },

    // Helper to create Paystack order data
    prepareOrderData: (
      cartItems: any[], 
      shippingAddress: any, 
      email: string,
      totalAmount: number
    ): PaystackOrderCreate => {
      const nameParts = (shippingAddress.full_name || `${shippingAddress.firstName} ${shippingAddress.lastName}`).split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        cart_items: cartItems.map(item => ({
          id: item.id || 0,
          product_id: item.id || 0,
          name: item.name || 'Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.images?.[0]?.url || item.image || '',
          size: item.selectedSize,
          color: item.selectedColor,
          sku: item.sku || ''
        })),
        shipping_address: {
          first_name: firstName || shippingAddress.firstName || '',
          last_name: lastName || shippingAddress.lastName || '',
          street: shippingAddress.address_line1 || shippingAddress.address || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          country: shippingAddress.country || 'Nigeria',
          postal_code: shippingAddress.postal_code || shippingAddress.postalCode || '',
          phone: shippingAddress.phone || '',
          email: email || shippingAddress.email || ''
        },
        email: email || shippingAddress.email || '',
        total_amount: totalAmount,
        currency: 'NGN',
        customer_name: shippingAddress.full_name || `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        customer_phone: shippingAddress.phone || '',
        notes: 'Order from BLOOM&G'
      };
    }
  },

  // ========== DIRECT PAYSTACK API (Frontend-only fallback) ==========
  directPaystack: {
    // Direct Paystack initialization (frontend-only, no backend needed)
    initialize: async (
      email: string,
      amount: number,
      reference: string,
      metadata?: Record<string, any>
    ) => {
      if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
        throw new Error('Paystack public key not configured');
      }

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
          callback_url: typeof window !== 'undefined' 
            ? `${window.location.origin}/checkout/verify` 
            : '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize payment');
      }

      return response.json();
    },

    // Verify Paystack payment
    verify: async (reference: string) => {
      if (!process.env.PAYSTACK_SECRET_KEY) {
        throw new Error('Paystack secret key not configured');
      }

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify payment');
      }

      return response.json();
    },
  },

  // ========== HEALTH & DIAGNOSTICS ==========
  healthCheck: () => {
    return request<{ status: string; message: string }>('/health');
  },

  testConnection: () => {
    return request<{
      status: string;
      backend: string;
      frontend: string;
      timestamp: string;
    }>('/test-connection');
  },

  getApiRoot: () => {
    return request<any>('/api');
  },
};

// ========== HELPER FUNCTIONS ==========
export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  try {
    const user: UserInfo = JSON.parse(userStr);
    return user.is_admin === true;
  } catch {
    return false;
  }
};

export const getCurrentUser = (): UserInfo | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserInfo;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};