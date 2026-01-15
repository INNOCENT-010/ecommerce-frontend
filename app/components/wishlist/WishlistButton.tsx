// app/components/wishlist/WishlistButton.tsx
'use client';

import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { wishlistApi } from '@/lib/supabase';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

export default function WishlistButton({ 
  productId, 
  size = 'md', 
  className = '',
  onToggle 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);
  
  const checkWishlistStatus = async () => {
    try {
      const inWishlist = await wishlistApi.isInWishlist(productId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };
  
  const handleToggleWishlist = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(productId);
        setIsInWishlist(false);
        onToggle?.(false);
      } else {
        await wishlistApi.addToWishlist(productId);
        setIsInWishlist(true);
        onToggle?.(true);
      }
      
      // Update wishlist count in header (you can add a global state if needed)
      const event = new CustomEvent('wishlist-updated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center 
        bg-white rounded-full 
        shadow-md hover:shadow-lg 
        transition-all duration-300
        ${isInWishlist ? 'text-red-500' : 'text-gray-600'}
        hover:scale-105 active:scale-95
        ${className}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        size={iconSizes[size]} 
        className={isInWishlist ? 'fill-red-500' : ''}
      />
    </button>
  );
}