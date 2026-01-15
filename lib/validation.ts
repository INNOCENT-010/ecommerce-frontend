// lib/validation.ts
export interface ValidationResult {
  isValid: boolean;
  errors?: {
    field: string;
    message: string;
  }[];
  error?: string; // Backward compatibility
}

export const validateShippingData = (shippingData: any): ValidationResult => {
  if (!shippingData) {
    return { 
      isValid: false, 
      error: 'Shipping information is incomplete',
      errors: [{ field: 'general', message: 'Shipping information is incomplete' }]
    };
  }

  const errors: { field: string; message: string }[] = [];
  
  // Required fields
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
  ];

  requiredFields.forEach(({ key, label }) => {
    if (!shippingData[key]?.trim()) {
      errors.push({ 
        field: key, 
        message: `${label} is required` 
      });
    }
  });

  // Email format
  if (shippingData.email && shippingData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingData.email)) {
      errors.push({ 
        field: 'email', 
        message: 'Please enter a valid email address' 
      });
    }
  }

  // Phone validation (Nigerian format)
  if (shippingData.phone && shippingData.phone.trim()) {
    const phoneRegex = /^(?:\+234|0)[789]\d{9}$/;
    const cleanPhone = shippingData.phone.replace(/\D/g, '');
    
    if (!phoneRegex.test(shippingData.phone) && cleanPhone.length !== 11) {
      errors.push({ 
        field: 'phone', 
        message: 'Please enter a valid Nigerian phone number' 
      });
    }
  }

  if (errors.length > 0) {
    return { 
      isValid: false, 
      errors,
      error: errors[0].message // For backward compatibility
    };
  }

  return { isValid: true };
};

export const validateCartItems = (items: any[]): ValidationResult => {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      error: 'Your cart is empty',
      errors: [{ field: 'cart', message: 'Your cart is empty' }]
    };
  }

  const errors: { field: string; message: string }[] = [];
  
  items.forEach((item, index) => {
    if (!item.id) {
      errors.push({
        field: `item-${index}`,
        message: `Item ${index + 1} is missing product ID`
      });
    }
    
    if (!item.quantity || item.quantity < 1) {
      errors.push({
        field: `item-${index}-quantity`,
        message: `Item "${item.name}" must have at least 1 quantity`
      });
    }
    
    if (!item.price || item.price <= 0) {
      errors.push({
        field: `item-${index}-price`,
        message: `Item "${item.name}" has an invalid price`
      });
    }
  });

  if (errors.length > 0) {
    return { 
      isValid: false, 
      errors,
      error: errors[0].message
    };
  }

  return { isValid: true };
};

export const validatePaymentAmount = (amount: number): ValidationResult => {
  if (!amount || amount <= 0) {
    return {
      isValid: false,
      error: 'Invalid payment amount',
      errors: [{ field: 'amount', message: 'Payment amount must be greater than 0' }]
    };
  }

  if (amount > 10000000) { // ₦10,000,000 limit
    return {
      isValid: false,
      error: 'Amount too large',
      errors: [{ field: 'amount', message: 'Amount cannot exceed ₦10,000,000' }]
    };
  }

  return { isValid: true };
};

// Main validation function for checkout
export const validateCheckout = (
  shippingData: any,
  cartItems: any[],
  totalAmount: number
): ValidationResult => {
  const shippingValidation = validateShippingData(shippingData);
  if (!shippingValidation.isValid) return shippingValidation;

  const cartValidation = validateCartItems(cartItems);
  if (!cartValidation.isValid) return cartValidation;

  const amountValidation = validatePaymentAmount(totalAmount);
  if (!amountValidation.isValid) return amountValidation;

  return { isValid: true };
};

// Utility to display errors in UI
export const getFieldError = (errors: { field: string; message: string }[] | undefined, fieldName: string): string | undefined => {
  if (!errors) return undefined;
  return errors.find(error => error.field === fieldName)?.message;
};