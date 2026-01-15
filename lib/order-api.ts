// lib/order-api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface CartItem {
  product_id: string;  // Supabase UUID
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

export const orderAPI = {
  async initializePayment(orderData: OrderRequest): Promise<PaymentResponse> {
    try {
      ); 
      
      const response = await fetch(`${API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Payment initialization failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Payment initialization error:', error);
      throw error;
    }
  },

  async verifyPayment(reference: string): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${API_URL}/api/payments/verify/${reference}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Payment verification failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      throw error;
    }
  },

  async getOrder(orderNumber: string) {
    try {
      const response = await fetch(`${API_URL}/api/payments/order/${orderNumber}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Order not found');
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ Get order error:', error);
      throw error;
    }
  }
};