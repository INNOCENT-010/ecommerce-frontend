'use client';

interface PaystackButtonProps {
  amount: number; 
  orderId: number;
  token: string; 
  text?: string;
  onSuccess: (response: any) => void;
  onClose?: () => void;
  className?: string;
}

export default function PaystackButton({
  amount,
  orderId,
  token,
  text = 'Pay with Paystack',
  onSuccess,
  onClose,
  className = '',
}: PaystackButtonProps) {

  const handlePayment = async () => {
    try {
      // 1️⃣ Simulate Paystack popup delay
      await new Promise((res) => setTimeout(res, 1500));

      // 2️⃣ Mock Paystack response (REALISTIC SHAPE)
      const mockPaystackResponse = {
        reference: `PSK_${Date.now()}`,
        status: 'success',
        message: 'Approved',
        amount,
        paid_at: new Date().toISOString(),
        channel: 'card',
        currency: 'NGN',
      };

      // 3️⃣ Notify backend that payment was successful
      await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_reference: mockPaystackResponse.reference,
          payment_status: 'paid',
          payment_provider: 'paystack',
        }),
      });

      // 4️⃣ Trigger success callback
      onSuccess(mockPaystackResponse);

      alert(`✅ Payment Successful!\nReference: ${mockPaystackResponse.reference}`);
    } catch (err) {
      console.error('❌ Payment failed:', err);
      alert('❌ Payment failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className={`w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition ${className}`}
    >
      {text}
    </button>
  );
}
