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
  minHeight?: '74vh' | '65vh' | string;
}

export default function ProductCard({ 
  product, 
  size = 'normal',
  minHeight = '65vh'
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;

  const getProductImages = () => {
  if (!product.image) return ['https://via.placeholder.com/600x800/cccccc/969696?text=Product+Image'];
  
  // Handle all possible cases
  if (Array.isArray(product.image)) {
    if (product.image.length === 0) {
      return ['https://via.placeholder.com/600x800/cccccc/969696?text=Product+Image'];
    }
    
    // Process array of images (could be strings or ProductImage objects)
    const validImages = product.image
      .filter(img => {
        if (typeof img === 'string') {
          return img && img.trim() !== '';
        } else if (img && typeof img === 'object' && 'url' in img) {
          // Handle ProductImage object
          return img.url && img.url.trim() !== '';
        }
        return false;
      })
      .map(img => {
        if (typeof img === 'string') {
          return img;
        } else if (img && typeof img === 'object' && 'url' in img) {
          // Return URL from ProductImage object
          return img.url;
        }
        return '';
      })
      .filter(url => url && url.trim() !== '');
    
    if (validImages.length > 0) {
      return validImages;
    }
  } else if (typeof product.image === 'string' && product.image.trim() !== '') {
    // Single string image
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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasMultipleImages) {
      nextImage();
    } else if (isRightSwipe && hasMultipleImages) {
      prevImage();
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
              height: minHeight
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative w-full h-full">
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
                              className={`px-3 py-2 text-xs rounded border transition-all ${
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
                              className={`px-3 py-2 text-xs rounded border transition-all flex items-center gap-1 ${
                                selectedColor === color
                                  ? 'bg-gray-100 text-gray-800 border-gray-400'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300"
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
                              <span className="truncate">{color}</span>
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
                        className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={adding || !canAddToCart()}
                        className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
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
                    className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white transition-all duration-300 hover:bg-black/80 hover:scale-110 z-10 ${
                      isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white transition-all duration-300 hover:bg-black/80 hover:scale-110 z-10 ${
                      isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {hasMultipleImages && !showOptions && (
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 transition-opacity duration-300 z-10 ${
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
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
                SALE
              </div>
            )}

            {product.tags?.includes('new') || product.tags?.includes('newin') ? (
              <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
                NEW
              </div>
            ) : null}
          </div>
        </Link>

        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 z-40"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            size={16} 
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'} 
          />
        </button>

        {!showOptions && (
          <button
            onClick={handleQuickAddClick}
            disabled={adding}
            className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 z-40 shadow-lg hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap min-w-[120px] text-center ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <ShoppingBag size={14} className="inline mr-1.5" />
            {adding ? 'Adding…' : 'Quick Add'}
          </button>
        )}
      </div>

      <div className="px-1 pt-2">
        <Link 
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <h3 className="font-medium text-gray-800 truncate mb-1 group-hover:text-black text-sm md:text-base">
            {product.name}
          </h3>
          
          {/* Product Description - Always visible initially */}
          {product.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </Link>
        
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-gray-900 text-base md:text-lg">
            {convert(product.price)}
          </p>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <p className="text-sm text-gray-500 line-through">
                {convert(product.originalPrice)}
              </p>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-400 mt-1">Displayed in {currency}</p>
      </div>
    </div>
  );
}