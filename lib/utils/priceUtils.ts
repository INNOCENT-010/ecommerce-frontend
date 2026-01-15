// lib/utils/priceUtils.ts
export function sanitizePrice(price: any): number {
  if (price == null) return 0;
  
  if (typeof price === 'number') {
    return Math.round(price * 100) / 100; // Keep 2 decimal places
  }
  
  if (typeof price === 'string') {
    // Remove any currency symbols, commas, and spaces
    const cleaned = price
      .replace(/[₦$€£¥₹,]/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
  }
  
  return 0;
}

export function isPriceValid(price: any): boolean {
  const sanitized = sanitizePrice(price);
  return sanitized > 0 && !isNaN(sanitized);
}