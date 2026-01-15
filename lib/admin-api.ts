// lib/admin-api.ts - UPDATED WITH CORRECT ENDPOINT USAGE
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ========== ADD THIS HELPER FUNCTION ==========
const getAuthToken = (): string | null => {
  // Try multiple possible keys to handle different login implementations
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token')
  );
};

// Existing types - KEEP ALL YOUR EXISTING TYPES
export interface Order {
  id: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items_count: number;
}

export interface OrderDetail {
  order: {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    total_amount: number;
    currency: string;
    status: string;
    payment_status: string;
    shipping_address: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
      full_address?: string;
    };
    notes?: string;
    created_at: string;
    paid_at?: string;
    order_data?: any;
  };
  items: OrderItem[];
  transaction?: {
    reference: string;
    amount: number;
    status: string;
    gateway_response?: string;
    channel?: string;
    card_last4?: string;
    card_type?: string;
    bank?: string;
    transaction_date?: string;
    paid_at?: string;
  };
  summary?: {
    items_count: number;
    total_quantity: number;
    has_size: boolean;
    has_color: boolean;
    size_variants: string[];
    color_variants: string[];
  };
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_id: number;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
  sku?: string;
  subtotal: number;
  current_stock?: number;
  is_active?: boolean;
}

// Enhanced types - ADD THESE NEW TYPES
export interface OrderItemPreview {
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  image?: string;
}

export interface EnhancedOrder {
  id: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  paid_at?: string;
  
  // Enhanced fields
  items_count: number;
  total_quantity: number;
  has_size: boolean;
  has_color: boolean;
  size_variants: string[];
  color_variants: string[];
  shipping_location: string;
  shipping_state: string;
  shipping_city: string;
  items_preview: OrderItemPreview[];
  notes?: string;
}

export interface PaginatedOrders {
  orders: EnhancedOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_users: number;
  total_products: number;
  orders_by_status: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recent_orders: number;
  currency: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  order_count: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  stock: number;
  is_active: boolean;
  is_new: boolean;
  is_sale: boolean;
  created_at: string;
  category: string;
}

export interface AuthResponse {
  isAdmin: boolean;
  user?: {
    id: number;
    email: string;
    full_name: string;
    is_admin: boolean;
    is_active: boolean;
  };
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// ==================== ADMIN API ====================
export const adminAPI = {
  // ========== AUTHENTICATION FUNCTIONS ==========
  async verifyAdmin(): Promise<AuthResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return { isAdmin: false };
      }
      
      const response = await fetch(`${API_URL}/auth/verify-admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Clear all possible token keys on failure
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        return { isAdmin: false };
      }
      
      const data = await response.json();
      return { isAdmin: true, user: data };
    } catch (error) {
      console.error('Error verifying admin:', error);
      // Clear all possible token keys on error
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      return { isAdmin: false };
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.access_token) {
        // Store with primary key 'admin_token' for consistency
        localStorage.setItem('admin_token', data.access_token);
        return { success: true, token: data.access_token };
      }
      
      return { success: false, message: data.detail || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  async logout(): Promise<void> {
    // Clear all possible token keys
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/login';
  },

  // ========== ORDER FUNCTIONS ==========
  async getOrders(): Promise<Order[]> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getEnhancedOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<PaginatedOrders> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.search) queryParams.append('search', params.search);
      
      const response = await fetch(
        `${API_URL}/api/admin/orders/enhanced?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch enhanced orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching enhanced orders:', error);
      throw error;
    }
  },

  async getOrderDetails(orderId: number): Promise<OrderDetail> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: number, status: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // ========== DASHBOARD FUNCTIONS ==========
  async getDashboardStats(): Promise<DashboardStats> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');
    
      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // ========== USER FUNCTIONS ==========
  async getUsers(): Promise<User[]> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // ========== PRODUCT FUNCTIONS ==========
  async getProducts(): Promise<Product[]> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async updateProductStock(productId: number, stock: number): Promise<{ success: boolean; message: string }> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product stock');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  // ========== EXPORT FUNCTIONS ==========
  async exportOrders(params?: {
    format?: 'csv' | 'excel';
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const queryParams = new URLSearchParams();
      if (params?.format) queryParams.append('format', params.format);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      
      const response = await fetch(
        `${API_URL}/api/admin/orders/export?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to export orders');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  },

  // ========== BULK ACTIONS ==========
  async bulkUpdateOrderStatus(orderIds: number[], status: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/api/admin/orders/bulk-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_ids: orderIds, status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to bulk update order status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error bulk updating order status:', error);
      throw error;
    }
  },


  normalizeToken(): void {
    // Ensure token is stored with correct key
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token && !localStorage.getItem('admin_token')) {
      localStorage.setItem('admin_token', token);
      }
  },

  // ========== NEW: TEST ALL ENDPOINTS ==========
  async testEndpoints(): Promise<{ [key: string]: boolean }> {
    const token = getAuthToken();
    const headers = token ? { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
    
    const endpoints = [
      '/api/admin/orders',
      '/api/admin/orders/enhanced',
      '/api/admin/dashboard/stats',
      '/api/admin/users',
      '/api/admin/products',
      '/auth/verify-admin'
    ];
    
    const results: { [key: string]: boolean } = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, { 
          headers,
          method: endpoint.includes('/dashboard/stats') ? 'GET' : 'GET'
        });
        results[endpoint] = response.ok;
        } catch (error) {
        results[endpoint] = false;
        }
    }
    
    return results;
  }
};