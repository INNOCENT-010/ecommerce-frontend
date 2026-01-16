// lib/order-api.ts - FIXED
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface OrderResponse {
  id: number;
  order_number: string;
  user_id?: number;
  customer_email?: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: any;
  billing_address?: any;
  items: OrderItem[];
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: { name: string };
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  sku?: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
}

export interface OrderRequest {
  cart_items: CartItem[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  email: string;
  total_amount: number;
  currency?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

export interface PaymentResponse {
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

export interface VerifyResponse {
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

export interface OrderAPI {
  initializePayment(orderData: OrderRequest): Promise<PaymentResponse>;
  verifyPayment(reference: string): Promise<VerifyResponse>;
  getOrder(orderNumber: string): Promise<any>;
  getUserOrders(): Promise<OrderResponse[]>;
}

export const orderAPI: OrderAPI = {
  async initializePayment(orderData: OrderRequest): Promise<PaymentResponse> {
    const response = await fetch(`${API_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Payment initialization failed');
    }

    return response.json();
  },

  async verifyPayment(reference: string): Promise<VerifyResponse> {
    const response = await fetch(`${API_URL}/api/payments/verify/${reference}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Payment verification failed');
    }
    
    return response.json();
  },

  async getOrder(orderNumber: string) {
    const response = await fetch(`${API_URL}/api/payments/order/${orderNumber}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Order not found');
    }
    
    return response.json();
  },

  async getUserOrders(): Promise<OrderResponse[]> {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    return response.json();
  }
};