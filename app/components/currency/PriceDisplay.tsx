// app/components/currency/PriceDisplay.tsx
'use client';

import { useCurrency } from '@/app/context/CurrencyContext';

interface PriceDisplayProps {
  amount: number;
  originalAmount?: number;
  className?: string;
  showCurrencyBadge?: boolean;
  showOriginal?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({
  amount,
  originalAmount,
  className = '',
  showCurrencyBadge = false,
  showOriginal = true,
  size = 'md',
}: PriceDisplayProps) {
  const { convert, currency } = useCurrency();
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`${sizeClasses[size]} font-bold text-black`}>
          {convert(amount)}
        </span>
        
        {showOriginal && originalAmount && originalAmount > amount && (
          <span className={`${sizeClasses[size].replace('text-', 'text-')} text-gray-500 line-through`}>
            {convert(originalAmount)}
          </span>
        )}
        
        {showCurrencyBadge && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {currency}
          </span>
        )}
      </div>
      
      {/* Save amount */}
      {showOriginal && originalAmount && originalAmount > amount && (
        <div className="text-xs text-red-600 font-medium mt-1">
          Save {convert(originalAmount - amount)}
        </div>
      )}
    </div>
  );
}
