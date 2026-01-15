// app/checkout/components/PaymentForm.tsx - CORRECTED
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartonContext';
import { orderAPI, type CartItem as OrderCartItem } from '@/lib/order-api';
import { validateCheckout } from '@/lib/validation';

interface PaymentFormProps {
  shippingData: any;
  onBack: () => void;
}

export default function PaymentForm({ shippingData, onBack }: PaymentFormProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Paystack script
    const loadPaystackScript = () => {
      return new Promise<void>((resolve, reject) => {
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
    };

    loadPaystackScript().catch(console.error);
  }, []);

  const handlePaystackPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Validate
      const validation = validateCheckout(shippingData, items, totalPrice);
      if (!validation.isValid) {
        setError(validation.error || 'Please check your information');
        return;
      }

      // 2. Prepare order data
      const orderData = {
        cart_items: items.map(item => ({
          product_id: item.id?.toString() || 'unknown',
          name: item.name || 'Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.images?.[0]?.url || item.image || '',
          size: item.selectedSize || '',
          color: item.selectedColor || '',
          sku: item.sku || ''
        })) as OrderCartItem[],
        shipping_address: {
          first_name: shippingData.firstName,
          last_name: shippingData.lastName,
          street: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          country: shippingData.country || 'Nigeria',
          postal_code: shippingData.postalCode || '000000',
          phone: shippingData.phone,
          email: shippingData.email
        },
        email: shippingData.email,
        total_amount: totalPrice,
        currency: 'NGN',
        customer_name: `${shippingData.firstName} ${shippingData.lastName}`,
        customer_phone: shippingData.phone,
        notes: 'Order from BLOOM&G'
      };

      // 3. Call FastAPI
      const orderResponse = await orderAPI.initializePayment(orderData);
      
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      // 4. Wait for Paystack script to load
      if (!(window as any).PaystackPop) {
        // Reload script if not loaded
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!(window as any).PaystackPop) {
          throw new Error('Paystack payment service failed to load');
        }
      }

      // 5. Define callback functions PROPERLY
      const handlePaymentSuccess = (response: any) => {
        // Verify payment with backend
        orderAPI.verifyPayment(response.reference)
          .then(verification => {
            if (verification.success) {
              clearCart();
              router.push(`/checkout/success?order=${verification.data?.order_number}`);
            } else {
              setError(`Payment verification failed: ${verification.message}`);
            }
          })
          .catch(verifyError => {
            console.error('❌ Verification error:', verifyError);
            setError('Payment successful! Order is being processed.');
            router.push(`/checkout/success?order=${orderResponse.data?.order_number}`);
          });
      };

      const handlePaymentClose = () => {
        setError('Payment was cancelled. You can try again.');
      };

      // 6. Initialize Paystack UI - CRITICAL FIX!
      // Make sure callback is a function reference, not a string
      const handler = (window as any).PaystackPop.setup({
        key: orderResponse.data.public_key || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: shippingData.email,
        amount: totalPrice * 100,
        ref: orderResponse.data.reference,
        currency: 'NGN',
        callback: handlePaymentSuccess,  // ✅ Function reference
        onClose: handlePaymentClose      // ✅ Function reference
      });

      handler.openIframe();

    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Payment</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Select Payment Method</h3>
        
        <div className="space-y-3">
          <button
            onClick={handlePaystackPayment}
            disabled={loading}
            className={`w-full p-4 border rounded-lg flex items-center justify-between ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">P</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Pay with Paystack</p>
                <p className="text-sm text-gray-500">Cards, Bank Transfer, USSD</p>
              </div>
            </div>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            ) : (
              <span className="text-gray-400">→</span>
            )}
          </button>

          <button
            disabled
            className="w-full p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">S</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Pay with Stripe</p>
                <p className="text-sm text-gray-500">International Cards</p>
              </div>
            </div>
            <span className="text-gray-400">Coming Soon</span>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} items)</span>
            <span>₦{totalPrice.toLocaleString('en-NG')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total</span>
            <span>₦{totalPrice.toLocaleString('en-NG')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back to Shipping
        </button>

        <button
          onClick={handlePaystackPayment}
          disabled={loading || items.length === 0}
          className="px-8 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : (
            `Pay ₦${totalPrice.toLocaleString('en-NG')}`
          )}
        </button>
      </div>
    </div>
  );
}