// src/types/order.ts

// Cart Item Type
export interface CartItem {
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

// Address Type
export interface Address {
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

// Order Create Request
export interface OrderCreateRequest {
  cart_items: CartItem[];
  shipping_address: Address;
  billing_address?: Address;
  email: string;
  total_amount: number;
  currency?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

// Paystack Initialize Response
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

// Payment Verification Response
export interface PaymentVerificationResponse {
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

// Order Response
export interface Order {
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