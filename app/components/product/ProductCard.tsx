'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/app/types/product';
import { useCurrency } from '@/app/context/CurrencyContext';
import { 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Heart
} from 'lucide-react';
import { useCart } from '@/app/context/CartonContext';
import { wishlistApi } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
  size?: 'normal' | 'large';
  minHeight?: string;
}

export default function ProductCard({ 
  product, 
  size = 'normal',
  minHeight = 'auto'
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { convert, currency } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const getProductImages = () => {
    if (!product.image) return ['https://via.placeholder.com/600x800/cccccc/969696?text=Product+Image'];
    
    if (Array.isArray(product.image)) {
      if (product.image.length === 0) {
        return ['https://via.placeholder.com/600x800/cccccc/969696?text=Product+Image'];
      }
      
      const validImages = product.image
        .filter(img => {
          if (typeof img === 'string') {
            return img && img.trim() !== '';
          } else if (img && typeof img === 'object' && 'url' in img) {
            return img.url && img.url.trim() !== '';
          }
          return false;
        })
        .map(img => {
          if (typeof img === 'string') {
            return img;
          } else if (img && typeof img === 'object' && 'url' in img) {
            return img.url;
          }
          return '';
        })
        .filter(url => url && url.trim() !== '');
      
      if (validImages.length > 0) {
        return validImages;
      }
    } else if (typeof product.image === 'string' && product.image.trim() !== '') {
      return [product.image];
    }
    
    return ['https://via.placeholder.com/600x800/cccccc/969696?text=Product+Image'];
  };

  const productImages = getProductImages();
  const hasMultipleImages = productImages.length > 1;

  const requiresSize = product.sizes && product.sizes.length > 0;
  const requiresColor = product.colors && product.colors.length > 0;
  const requiresSelection = requiresSize || requiresColor;

  const availableSizes = product.sizes || [];
  const availableColors = product.colors || [];

  const canAddToCart = () => {
    if (requiresSize && !selectedSize) return false;
    if (requiresColor && !selectedColor) return false;
    return true;
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  const checkWishlistStatus = async () => {
    try {
      const isWishlisted = await wishlistApi.isInWishlist(product.id.toString());
      setIsWishlisted(isWishlisted);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (wishlistLoading) return;
    
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product.id.toString());
        setIsWishlisted(false);
      } else {
        await wishlistApi.addToWishlist(product.id.toString());
        setIsWishlisted(true);
      }
      
      const event = new CustomEvent('wishlist-updated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (requiresSize && !selectedSize) {
      setShowOptions(true);
      return;
    }
    
    if (requiresColor && !selectedColor) {
      setShowOptions(true);
      return;
    }
    
    setAdding(true);
    
    addToCart(product, selectedSize || undefined, selectedColor || undefined);
    
    setTimeout(() => {
      setAdding(false);
      setShowOptions(false);
      if (selectedSize || selectedColor) {
        resetSelection();
      }
    }, 500);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (requiresSelection) {
      setShowOptions(true);
    } else {
      handleAddToCart(e);
    }
  };

  const resetSelection = () => {
    setSelectedSize('');
    setSelectedColor('');
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }
  }, [productImages.length, hasMultipleImages]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  }, [productImages.length, hasMultipleImages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && hasMultipleImages && !showOptions) {
      interval = setInterval(() => {
        nextImage();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, nextImage, hasMultipleImages, showOptions]);

  return (
    <div 
      className="block group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!showOptions) setShowOptions(false);
        if (hasMultipleImages) {
          setCurrentImageIndex(0);
        }
      }}
    >
      <div className="relative">
        <Link 
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <div 
            className="relative overflow-hidden rounded-lg mb-3 bg-gray-100"
            style={{ 
              minHeight: minHeight,
              height: minHeight === 'auto' ? 'auto' : minHeight
            }}
          >
            <div className="relative w-full h-full aspect-[3/4]">
              {productImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} - View ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                    index === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
                  } ${showOptions ? 'scale-105 brightness-50' : 'group-hover:scale-105'} transition-transform duration-700`}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800/cccccc/969696?text=Image+Failed';
                    (e.target as HTMLImageElement).onerror = null;
                  }}
                />
              ))}

              {productImages.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-600 text-sm">No image available</p>
                  </div>
                </div>
              )}

              {showOptions && requiresSelection && (
                <div className="absolute inset-0 z-30 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                  <div className="bg-white rounded-lg p-4 shadow-xl">
                    {requiresSize && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-800 mb-2">
                          Select Size {!selectedSize && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedSize(size);
                              }}
                              className={`px-2 py-1.5 text-xs rounded border transition-all ${
                                selectedSize === size
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {requiresColor && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-800 mb-2">
                          Select Color {!selectedColor && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {availableColors.map((color) => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedColor(color);
                              }}
                              className={`px-2 py-1.5 text-xs rounded border transition-all flex items-center gap-1 ${
                                selectedColor === color
                                  ? 'bg-gray-100 text-gray-800 border-gray-400'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <div 
                                className="w-2 h-2 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: color.toLowerCase() === 'black' ? '#000' :
                                                  color.toLowerCase() === 'white' ? '#fff' :
                                                  color.toLowerCase() === 'red' ? '#ef4444' :
                                                  color.toLowerCase() === 'blue' ? '#3b82f6' :
                                                  color.toLowerCase() === 'green' ? '#10b981' :
                                                  color.toLowerCase() === 'gold' ? '#fbbf24' :
                                                  color.toLowerCase() === 'pink' ? '#f472b6' : '#d1d5db'
                                }}
                              />
                              <span className="truncate text-[10px]">{color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowOptions(false);
                          resetSelection();
                        }}
                        className="flex-1 px-2 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={adding || !canAddToCart()}
                        className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                          adding || !canAddToCart()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {adding ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {hasMultipleImages && !showOptions && (
                <>
                  <button
                    onClick={prevImage}
                    className={`absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white transition-all duration-300 hover:bg-black/80 hover:scale-110 z-10 ${
                      isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={12} className="md:w-[14px] md:h-[14px]" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className={`absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white transition-all duration-300 hover:bg-black/80 hover:scale-110 z-10 ${
                      isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    aria-label="Next image"
                  >
                    <ChevronRight size={12} className="md:w-[14px] md:h-[14px]" />
                  </button>
                </>
              )}

              {hasMultipleImages && !showOptions && (
                <div className={`absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 transition-opacity duration-300 z-10 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-[2px] h-[2px] md:w-2 md:h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white scale-150' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full z-20">
                SALE
              </div>
            )}

            {product.tags?.includes('new') || product.tags?.includes('newin') ? (
              <div className="absolute top-2 md:top-3 right-10 md:right-12 bg-green-600 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full z-20">
                NEW
              </div>
            ) : null}
          </div>
        </Link>

        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-2 md:top-3 right-2 md:right-3 bg-white p-1.5 md:p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            size={12} 
            className={`md:w-4 md:h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
          />
        </button>

        {!showOptions && (
          <button
            onClick={handleQuickAddClick}
            disabled={adding}
            className={`absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 shadow-lg hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap min-w-[100px] md:min-w-[140px] text-center min-h-[32px] md:min-h-[44px] flex items-center justify-center ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <ShoppingBag size={10} className="inline mr-1 md:mr-1.5 md:w-[12px] md:h-[12px]" />
            {adding ? 'Adding…' : 'Quick Add'}
          </button>
        )}
      </div>

      <div className="px-1 pt-2">
        <Link 
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <h3 className="font-medium text-gray-800 truncate mb-1 group-hover:text-black text-xs md:text-sm">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2 hidden md:block">
              {product.description}
            </p>
          )}
        </Link>
        
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          <p className="font-bold text-gray-900 text-sm md:text-base">
            {convert(product.price)}
          </p>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <p className="text-xs md:text-sm text-gray-500 line-through">
                {convert(product.originalPrice)}
              </p>
              <span className="text-[10px] md:text-xs font-bold text-red-600 bg-red-50 px-1 md:px-2 py-0.5 rounded">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}