'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface LuxuryButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'solid' | 'outline';
  className?: string;
}

export default function LuxuryButton({ 
  children, 
  href, 
  onClick, 
  type = 'button',
  variant = 'solid',
  className = ''
}: LuxuryButtonProps) {
  
  const baseClasses = "inline-flex items-center justify-center font-medium tracking-wide transition-all luxury-black-button gold-text";
  const variantClasses = variant === 'solid' 
    ? "bg-black text-white hover:bg-gray-900" 
    : "bg-transparent border border-white text-white hover:bg-white/10 luxury-black-button border-button";
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }
  
  return (
    <button 
      type={type} 
      onClick={onClick}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}