// app/context/CurrencyContext.tsx - UPDATED
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

// IMPORTANT: NGN is now the base currency (1 NGN = 1 NGN)
const rates: Record<Currency, number> = {
  'NGN': 1,           // Base currency
  'USD': 0.00067,     // 1 NGN = 0.00067 USD (approx 1 USD = 1493 NGN)
  'GBP': 0.00052,     // 1 NGN = 0.00052 GBP
  'EUR': 0.00062,     // 1 NGN = 0.00062 EUR
};

const symbols: Record<Currency, string> = {
  'NGN': '₦',
  'USD': '$',
  'GBP': '£',
  'EUR': '€',
};

const locales: Record<Currency, string> = {
  'NGN': 'en-NG',
  'USD': 'en-US',
  'GBP': 'en-GB',
  'EUR': 'en-DE',
};

const formats: Record<Currency, {
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}> = {
  'NGN': { minimumFractionDigits: 0, maximumFractionDigits: 0 }, // NGN typically doesn't use kobo
  'USD': { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  'GBP': { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  'EUR': { minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (price: number) => string;
  convertAmount: (price: number) => number;
  formatAmount: (amount: number) => string;
  getCurrencySymbol: () => string;
  getBaseAmount: (amount: number, fromCurrency: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('NGN'); // Default to NGN
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('preferredCurrency');
    if (stored && ['NGN', 'USD', 'GBP', 'EUR'].includes(stored)) {
      setCurrencyState(stored as Currency);
    } else {
      // Default to NGN if nothing stored
      setCurrencyState('NGN');
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (isMounted) {
      localStorage.setItem('preferredCurrency', c);
    }
  };

  // Convert from NGN to target currency (returns number)
  const convertAmount = (price: number): number => {
    return price * rates[currency];
  };

  // Convert from any currency to NGN (base currency)
  const getBaseAmount = (amount: number, fromCurrency: Currency): number => {
    return amount / rates[fromCurrency];
  };

  // Format amount with proper locale
  const formatAmount = (amount: number): string => {
    const locale = locales[currency];
    const formatOptions = formats[currency];
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      ...formatOptions,
    }).format(amount);
  };

  // Get just the currency symbol
  const getCurrencySymbol = (): string => {
    return symbols[currency];
  };

  // Main convert function (backward compatible)
  const convert = (price: number): string => {
    // IMPORTANT: Price is assumed to be in NGN (base currency)
    const converted = price * rates[currency];
    return formatAmount(converted);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      convert,
      convertAmount,
      formatAmount,
      getCurrencySymbol,
      getBaseAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
};