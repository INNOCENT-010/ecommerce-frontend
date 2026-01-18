'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Product, ProductImage } from '@/app/types/product';
import { useCart } from '@/app/context/CartonContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { sanitizePrice } from '@/lib/utils/priceUtils';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { addToCart } = useCart();
  const { convert } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  
  // Simple image states
  const [leftImageIndex, setLeftImageIndex] = useState(0);
  const [rightImageIndex, setRightImageIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const galleryRef = useRef<HTMLDivElement>(null);

  const requiresSize = product?.sizes && product.sizes.length > 0;
  const requiresColor = product?.colors && product.colors.length > 0;

  // Helper function to get images array in consistent format
  const getProductImages = (): ProductImage[] => {
    if (!product) return [];
    
    if (Array.isArray(product.image)) {
      // If it's already an array of ProductImage objects
      if (product.image.length > 0 && typeof product.image[0] === 'object') {
        return product.image as ProductImage[];
      }
      // If it's an array of strings
      return (product.image as string[]).map(url => ({ url, alt: product.name }));
    }
    
    // If it's a single string
    if (typeof product.image === 'string') {
      return [{ url: product.image, alt: product.name }];
    }
    
    return [];
  };

  const productImages = getProductImages();
  const totalImages = productImages.length;
  const canGoLeft = leftImageIndex > 0;
  const canGoRight = rightImageIndex < totalImages - 1;
  
  // Mobile swipe detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Simple slide left
  const slideLeft = useCallback(() => {
    if (isAnimating || !canGoLeft) return;
    
    setIsAnimating(true);
    const newRightIndex = leftImageIndex;
    const newLeftIndex = leftImageIndex - 1;
    
    setTimeout(() => {
      setLeftImageIndex(newLeftIndex);
      setRightImageIndex(newRightIndex);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, canGoLeft, leftImageIndex]);

  // Simple slide right
  const slideRight = useCallback(() => {
    if (isAnimating || !canGoRight) return;
    
    setIsAnimating(true);
    const newLeftIndex = rightImageIndex;
    const newRightIndex = rightImageIndex + 1;
    
    setTimeout(() => {
      setLeftImageIndex(newLeftIndex);
      setRightImageIndex(newRightIndex);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, canGoRight, rightImageIndex]);

  // Handle touch events for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 30; // Smaller for mobile

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && canGoRight) {
      slideRight();
    } else if (isRightSwipe && canGoLeft) {
      slideLeft();
    }
  };

  // Go to specific image pair
  const goToImagePair = useCallback((startIndex: number) => {
    if (isAnimating || startIndex < 0 || startIndex >= totalImages - 1) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setLeftImageIndex(startIndex);
      setRightImageIndex(startIndex + 1);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, totalImages]);

  // Lightbox
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  const openLightbox = useCallback((imageIndex: number) => {
    setLightboxImageIndex(imageIndex);
    setShowLightbox(true);
  }, []);

  const nextLightboxImage = useCallback(() => {
    setLightboxImageIndex((prev) => (prev + 1) % productImages.length);
  }, [productImages.length]);

  const prevLightboxImage = useCallback(() => {
    setLightboxImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  }, [productImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === 'ArrowLeft') prevLightboxImage();
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'Escape') setShowLightbox(false);
      } else if (!isAnimating && !isMobile) { // Only arrow navigation on desktop
        if (e.key === 'ArrowLeft' && canGoLeft) slideLeft();
        if (e.key === 'ArrowRight' && canGoRight) slideRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, prevLightboxImage, nextLightboxImage, isAnimating, canGoLeft, canGoRight, slideLeft, slideRight, isMobile]);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (url, alt_text, order_index)
          `)
          .eq('slug', slug)
          .single();

        if (error || !data) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        // Transform data to match Product interface
        const transformedProduct: Product = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          created_at: data.created_at,
          description: data.description || '',
          price: data.price,
          originalPrice: data.original_price || undefined,
          isNew: data.is_new || false,
          isSale: data.is_sale || false,
          category: data.category || '',
          tags: data.tags || [],
          sizes: data.sizes || [],
          colors: data.colors || [],
          // Ensure image is in correct format
          image: (data.product_images || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((img: any) => ({
              url: img.url || '',
              alt: img.alt_text || data.name
            }))
        };

        setProduct(transformedProduct);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const validateAndAddToCart = () => {
    if (!product) return;
    
    setValidationError(null);
    
    if (requiresSize && !selectedSize) {
      setValidationError('Please select a size');
      return;
    }
    
    if (requiresColor && !selectedColor) {
      setValidationError('Please select a color');
      return;
    }
    
    const sanitizedProduct = {
      ...product,
      price: sanitizePrice(product.price),
      originalPrice: product.originalPrice ? sanitizePrice(product.originalPrice) : undefined,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(sanitizedProduct, selectedSize, selectedColor);
    }

    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => router.push('/')} 
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go back home
        </button>
      </div>
    );
  }

  const displayPrice = sanitizePrice(product.price);
  const displayOriginalPrice = product.originalPrice 
    ? sanitizePrice(product.originalPrice) 
    : undefined;

  const leftImage = productImages[leftImageIndex] || { url: '', alt: product.name };
  const rightImage = productImages[rightImageIndex] || { url: '', alt: product.name };

  return (
    <>
      {/* Simple smooth slide layout */}
      <div className="w-full px-0 py-4 md:py-8 flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-0">
        
        {/* Left Column - Image Gallery */}
        <div className="lg:w-[60%] flex flex-col">
          {/* Main Image Container - 75vh on mobile, full height on desktop */}
          <div className="h-[75vh] md:h-[90vh] relative">
            <div 
              ref={galleryRef}
              className="relative w-full h-full overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Left Image */}
              <div 
                className={`absolute left-0 top-0 w-1/2 h-full bg-gray-100 overflow-hidden transition-opacity duration-300 ease-in-out ${
                  isAnimating ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {leftImage.url ? (
                  <>
                    <Image
                      src={leftImage.url}
                      alt={leftImage.alt || product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 50vw, 30vw"
                      onClick={() => openLightbox(leftImageIndex)}
                    />
                    <div 
                      className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 cursor-pointer"
                      onClick={() => openLightbox(leftImageIndex)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {/* Right Image */}
              <div 
                className={`absolute right-0 top-0 w-1/2 h-full bg-gray-100 overflow-hidden transition-opacity duration-300 ease-in-out ${
                  isAnimating ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {rightImage.url ? (
                  <>
                    <Image
                      src={rightImage.url}
                      alt={rightImage.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 30vw"
                      onClick={() => openLightbox(rightImageIndex)}
                    />
                    <div 
                      className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 cursor-pointer"
                      onClick={() => openLightbox(rightImageIndex)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {/* Navigation Arrows - Desktop only */}
              {!isMobile && (
                <>
                  <button
                    onClick={slideLeft}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                      canGoLeft && !isAnimating
                        ? 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 cursor-pointer shadow-lg'
                        : 'bg-gray-400/50 backdrop-blur-sm text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label="Previous image"
                    disabled={!canGoLeft || isAnimating}
                  >
                    <ChevronLeft size={32} />
                  </button>
                  
                  <button
                    onClick={slideRight}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 z-10 ${
                      canGoRight && !isAnimating
                        ? 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 cursor-pointer shadow-lg'
                        : 'bg-gray-400/50 backdrop-blur-sm text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label="Next image"
                    disabled={!canGoRight || isAnimating}
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              {/* Swipe Hint (mobile only, no arrows on mobile) */}
              {isMobile && totalImages > 2 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm z-10 animate-pulse">
                  ← Swipe to navigate →
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Strip - Smaller on mobile */}
          {productImages.length > 0 && (
            <div className="mt-3 md:mt-4">
              <div className="flex gap-1.5 md:gap-2 overflow-x-auto py-2 px-1 md:py-3 md:px-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (index < totalImages - 1) {
                        goToImagePair(index);
                      } else {
                        goToImagePair(index - 1);
                      }
                    }}
                    className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border transition-all duration-200 ${
                      (index === leftImageIndex || index === rightImageIndex)
                        ? 'border-black ring-1 md:ring-2 ring-black/20 transform scale-105 shadow-md md:shadow-lg' 
                        : 'border-transparent hover:border-gray-400 hover:scale-102'
                    }`}
                    aria-label={`View images starting at ${index + 1}`}
                    disabled={isAnimating}
                  >
                    <div className="relative w-full h-full bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 48px, (max-width: 1024px) 64px, 80px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:w-[40%] lg:sticky lg:top-8 lg:self-start lg:px-8">
          <div className="space-y-4 md:space-y-6 px-3 md:px-4 lg:px-0">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <p className="text-lg md:text-xl lg:text-2xl font-bold">
                  {convert(displayPrice)}
                </p>
                
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <>
                    <p className="text-base md:text-lg lg:text-xl text-gray-500 line-through">
                      {convert(displayOriginalPrice)}
                    </p>
                    <span className="text-xs md:text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 md:px-3 md:py-1.5 rounded">
                      {Math.round((1 - displayPrice / displayOriginalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs md:text-sm text-gray-500">
                Base price: ₦{displayPrice.toLocaleString()}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-medium text-base md:text-lg mb-1 md:mb-2">Description</h3>
                <p className="text-gray-600 text-sm md:text-base whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {requiresSize && (
              <div>
                <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                  <p className="font-medium text-base md:text-lg">Size</p>
                  <span className="text-xs text-red-500 font-medium">*</span>
                </div>
                <div className="flex gap-2 md:gap-3 flex-wrap">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setValidationError(null);
                      }}
                      className={`px-4 py-2 md:px-6 md:py-3 border rounded-lg transition-all duration-200 text-sm md:text-base ${
                        selectedSize === size 
                          ? 'border-black bg-black text-white transform scale-105' 
                          : 'border-gray-300 hover:border-black hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {requiresColor && (
              <div>
                <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                  <p className="font-medium text-base md:text-lg">Color</p>
                  <span className="text-xs text-red-500 font-medium">*</span>
                </div>
                <div className="flex gap-2 md:gap-3 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setValidationError(null);
                      }}
                      className={`px-3 py-2 md:px-5 md:py-3 border rounded-lg flex items-center gap-2 md:gap-3 transition-all duration-200 text-sm ${
                        selectedColor === color 
                          ? 'border-black bg-gray-100 transform scale-105' 
                          : 'border-gray-300 hover:border-black hover:bg-gray-50'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200"
                        style={{
                          backgroundColor: color.toLowerCase() === 'black' ? '#000' :
                                          color.toLowerCase() === 'white' ? '#fff' :
                                          color.toLowerCase() === 'red' ? '#ef4444' :
                                          color.toLowerCase() === 'blue' ? '#3b82f6' :
                                          color.toLowerCase() === 'green' ? '#10b981' :
                                          color.toLowerCase() === 'purple' ? '#8b5cf6' :
                                          color.toLowerCase() === 'pink' ? '#ec4899' :
                                          color.toLowerCase() === 'yellow' ? '#f59e0b' : '#d1d5db'
                        }}
                      />
                      <span className="font-medium text-xs md:text-sm">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 md:gap-3 animate-in fade-in">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                <p className="text-red-600 font-medium text-sm md:text-base">{validationError}</p>
              </div>
            )}

            <div>
              <p className="font-medium text-base md:text-lg mb-2 md:mb-3">Quantity</p>
              <div className="flex items-center border border-gray-300 md:border-2 rounded-lg w-fit overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 md:px-4 md:py-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} className="md:w-5 md:h-5" />
                </button>
                <span className="px-4 md:px-6 min-w-[40px] md:min-w-[60px] text-center text-base md:text-lg font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 md:px-4 md:py-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={validateAndAddToCart}
              className={`w-full py-3 md:py-4 text-base md:text-lg font-bold rounded-lg transition-all duration-300 ${
                (requiresSize && !selectedSize) || (requiresColor && !selectedColor)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
              disabled={(requiresSize && !selectedSize) || (requiresColor && !selectedColor)}
            >
              Add to Cart
            </button>

            <div className="pt-4 md:pt-6 border-t border-gray-200">
              <ul className="text-gray-600 text-sm md:text-base space-y-1 md:space-y-2">
                {product.isNew && (
                  <li className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 md:px-2 md:py-1 rounded text-xs md:text-sm font-medium">New Arrival</span>
                  </li>
                )}
                {product.isSale && (
                  <li className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 md:px-2 md:py-1 rounded text-xs md:text-sm font-medium">On Sale</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && productImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 md:p-4 animate-in fade-in">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 md:top-6 right-4 md:right-6 text-white p-2 md:p-3 hover:bg-white/10 rounded-full transition-colors z-50"
            aria-label="Close lightbox"
          >
            <X size={24} className="md:w-8 md:h-8" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevLightboxImage}
                  className="absolute left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white transition-all hover:bg-white/40 hover:scale-110 z-30"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="md:w-6 md:h-6 lg:w-9 lg:h-9" />
                </button>
                
                <button
                  onClick={nextLightboxImage}
                  className="absolute right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white transition-all hover:bg-white/40 hover:scale-110 z-30"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="md:w-6 md:h-6 lg:w-9 lg:h-9" />
                </button>
              </>
            )}

            <div className="relative w-full h-3/4 md:h-4/5 max-w-4xl">
              <Image
                src={productImages[lightboxImageIndex].url}
                alt={productImages[lightboxImageIndex].alt || product.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <div className="absolute bottom-12 md:bottom-16 lg:bottom-20 left-0 right-0 overflow-x-auto flex justify-center gap-2 md:gap-3 py-2 md:py-4 px-2 md:px-4 scrollbar-hide">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxImageIndex(index)}
                  className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded overflow-hidden border-2 md:border-3 transition-all duration-300 ${
                    lightboxImageIndex === index 
                      ? 'border-white ring-2 md:ring-4 ring-white/20 transform scale-105 md:scale-110' 
                      : 'border-transparent hover:border-white/50 hover:scale-102 md:hover:scale-105'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <div className="relative w-full h-full bg-gray-800">
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 40px, (max-width: 1024px) 48px, 64px"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}