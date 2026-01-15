// src/app/checkout/error/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const errorMessage = searchParams.get('message') || 'Payment failed';
  const reference = searchParams.get('reference');
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    // Log the error for debugging
    console.error('Payment error:', {
      message: errorMessage,
      reference,
      orderNumber,
      timestamp: new Date().toISOString()
    });
  }, [errorMessage, reference, orderNumber]);

  const handleRetry = () => {
    // Clear any stored payment data
    localStorage.removeItem('last_payment_reference');
    localStorage.removeItem('last_failed_payment');
    
    // Redirect back to checkout
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-3xl text-red-600">⚠️</div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600">
              We couldn&apos;t process your payment. Please try again.
            </p>
          </div>

          {/* Error Details */}
          <div className="border rounded-xl p-6 mb-8 bg-red-50 border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Error Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Error Message</p>
                <p className="font-medium text-red-700">{errorMessage}</p>
              </div>
              
              {reference && (
                <div>
                  <p className="text-sm text-gray-600">Reference Number</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{reference}</p>
                </div>
              )}
              
              {orderNumber && (
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{orderNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Common Solutions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Possible Solutions</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Check Your Card Details</h3>
                  <p className="text-gray-600 text-sm">
                    Ensure your card number, expiration date, and CVV are correct.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Insufficient Funds</h3>
                  <p className="text-gray-600 text-sm">
                    Check if you have sufficient balance in your account.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Bank Restrictions</h3>
                  <p className="text-gray-600 text-sm">
                    Some banks restrict online payments. Contact your bank to enable online transactions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Try Another Method</h3>
                  <p className="text-gray-600 text-sm">
                    Use a different payment method (bank transfer, USSD, or another card).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRetry}
              className="flex-1 text-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Payment Again
            </button>
            
            <Link
              href="/checkout"
              className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Checkout
            </Link>
            
            <Link
              href="/products"
              className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-gray-600 mb-4">
              Still having issues? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-8">
              <a 
                href="mailto:support@yourstore.com" 
                className="text-blue-600 hover:underline flex items-center"
              >
                <span className="mr-2">📧</span>
                support@yourstore.com
              </a>
              <a 
                href="tel:+2348012345678" 
                className="text-blue-600 hover:underline flex items-center"
              >
                <span className="mr-2">📞</span>
                +234 801 234 5678
              </a>
              <button
                onClick={() => window.open('https://wa.me/2348012345678', '_blank')}
                className="text-green-600 hover:underline flex items-center"
              >
                <span className="mr-2">💬</span>
                WhatsApp Support
              </button>
            </div>
          </div>

          {/* Debug Info (Visible in development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
              <p className="font-mono text-gray-600">
                Error: {errorMessage}<br/>
                Reference: {reference || 'N/A'}<br/>
                Order: {orderNumber || 'N/A'}<br/>
                Time: {new Date().toISOString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
