// app/components/home/BestSellersGrid.tsx - MOBILE OPTIMIZED
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/app/components/product/ProductCard';
import { Product } from '@/app/types/product';

interface BestSellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string | null;
  category: string;
  tags: string[];
  sizes: string[];
  colors: string[];
  featured: boolean;
  product_images: Array<{
    url: string;
    alt_text: string | null;
    order_index?: number;
  }>;
  created_at: string;
}

function BestSellersGrid() {
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // MOBILE: 3 products per slide, DESKTOP: 4 products per slide (your original)
  const productsPerSlideMobile = 3;
  const productsPerSlideDesktop = 4;
  
  // Fetch ALL bestseller products from Supabase
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        
        // Fetch ALL products with bestseller tags
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*)
          `)
          .or('tags.cs.{bestsellers},tags.cs.{bestseller},tags.cs.{best-seller}')
          .order('created_at', { ascending: false });
        
        if (error) {
          await fetchBestSellersAlternative();
          return;
        }
        
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          await fetchBestSellersAlternative();
        }
        
      } catch (error) {
        await fetchBestSellersAlternative();
      } finally {
        setLoading(false);
      }
    };
    
    // Alternative: Fetch all products and filter client-side
    const fetchBestSellersAlternative = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*)
          `)
          .order('created_at', { ascending: false })
          .limit(50); // Increase limit to get enough products
        
        if (error) return;
        
        if (data) {
          // Filter for bestsellers or featured products
          const potentialBestsellers = data.filter(product => {
            if (!product.tags || !Array.isArray(product.tags)) return false;
            
            const tagString = product.tags.join(',').toLowerCase();
            return tagString.includes('bestseller') || 
                   tagString.includes('bestsellers') ||
                   tagString.includes('featured') ||
                   tagString.includes('top') ||
                   (product.featured === true);
          });
          
          // If we have enough bestsellers, use them
          if (potentialBestsellers.length >= 8) {
            setProducts(potentialBestsellers);
          } 
          // If we have some bestsellers but not enough, supplement with regular products
          else if (potentialBestsellers.length > 0) {
            const additionalProducts = data
              .filter(p => !potentialBestsellers.some(bp => bp.id === p.id))
              .slice(0, 12 - potentialBestsellers.length);
            setProducts([...potentialBestsellers, ...additionalProducts]);
          }
          // No bestsellers found, use featured or newest products
          else {
            // First try featured
            const featuredProducts = data.filter(p => p.featured === true);
            if (featuredProducts.length >= 8) {
              setProducts(featuredProducts);
            } else {
              // Fallback to newest products
              setProducts(data.slice(0, 16)); // Get enough for multiple slides
            }
          }
        }
        
      } catch (error) {
        // Silent fail
      }
    };
    
    fetchBestSellers();
  }, []);
  
  // Calculate slides count - DIFFERENT FOR MOBILE & DESKTOP
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const productsPerSlide = isMobile ? productsPerSlideMobile : productsPerSlideDesktop;
  const slidesCount = Math.max(1, Math.ceil(products.length / productsPerSlide));
  
  // Navigation functions
  const nextSlide = () => {
    if (currentSlide < slidesCount - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Loop back to first slide
      setCurrentSlide(0);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    } else {
      // Loop to last slide
      setCurrentSlide(slidesCount - 1);
    }
  };
  
  // Convert Supabase product to Product format
  const convertToProductFormat = (product: BestSellerProduct): Product => {
    const sortedImages = product.product_images
      ? [...product.product_images].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      : [];
    
    // Get the first image URL or use a placeholder
    const firstImageUrl = sortedImages.length > 0 
      ? sortedImages[0].url 
      : '/placeholder-product.jpg';
    
    return {
      id: product.id,
      name: product.name,
      created_at: product.created_at,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: firstImageUrl,
      category: product.category,
      colors: product.colors || [],
      sizes: product.sizes || [],
      isNew: product.tags?.some(tag => 
        tag.toLowerCase().includes('new')
      ) || false,
      isSale: product.original_price !== null,
      slug: product.slug,
      tags: product.tags || []
    };
  };
 
  // Get products for current slide
  const getCurrentSlideProducts = () => {
    const productsPerSlide = isMobile ? productsPerSlideMobile : productsPerSlideDesktop;
    const startIndex = currentSlide * productsPerSlide;
    const endIndex = startIndex + productsPerSlide;
    return products.slice(startIndex, endIndex);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 h-[70vh] min-h-[500px]">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="col-span-1">
            <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bestsellers Found</h3>
          <p className="text-gray-600 mb-6">
            Add "bestseller" or "featured" tags to your products.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors text-sm rounded-lg"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }
  
  const currentProducts = getCurrentSlideProducts();
  const currentProductsPerSlide = isMobile ? productsPerSlideMobile : productsPerSlideDesktop;
  
  return (
    <div className="relative">
      {/* Navigation Arrows - MOBILE: Smaller, DESKTOP: Your original */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 p-2 md:p-4 bg-black/0 hover:bg-black/5 rounded-full transition-all duration-300 z-30 group"
        aria-label="Previous slide"
      >
        <div className="p-2 md:p-3 bg-white/95 backdrop-blur-sm rounded-full group-hover:bg-white transition-all shadow-xl border border-gray-200">
          <ChevronLeft size={16} className="md:w-5 md:h-5 text-gray-800" />
        </div>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 p-2 md:p-4 bg-black/0 hover:bg-black/5 rounded-full transition-all duration-300 z-30 group"
        aria-label="Next slide"
      >
        <div className="p-2 md:p-3 bg-white/95 backdrop-blur-sm rounded-full group-hover:bg-white transition-all shadow-xl border border-gray-200">
          <ChevronRight size={16} className="md:w-5 md:h-5 text-gray-800" />
        </div>
      </button>
      
      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="overflow-hidden"
      >
        {/* MOBILE: 3 columns, DESKTOP: 4 columns (your original) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-4">
          {currentProducts.map((product) => {
            const productData = convertToProductFormat(product);
            const isBestseller = product.tags?.some(tag => 
              tag.toLowerCase().includes('bestseller') ||
              tag.toLowerCase().includes('bestsellers')
            );
            
            return (
              <div key={product.id} className="col-span-1 relative">
                {/* Bestseller badge - MOBILE: Smaller, DESKTOP: Your original */}
                {isBestseller && (
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 z-20">
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                      BESTSELLER
                    </span>
                  </div>
                )}
                
                {/* Product Card with 70vh height on mobile */}
                <div className="h-[70vh] md:h-[65vh]">
                  <ProductCard 
                    product={productData}
                    minHeight="70vh"
                  />
                </div>
              </div>
            );
          })}
          
          {/* Fill empty slots if needed */}
          {currentProducts.length < currentProductsPerSlide && 
            Array.from({ length: currentProductsPerSlide - currentProducts.length }).map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="col-span-1"
              >
                <div className="h-[70vh] md:h-[65vh] min-h-[400px] opacity-0 pointer-events-none"></div>
              </div>
            ))
          }
        </div>
      </div>
      
      {/* Slide Indicators - MOBILE: Smaller spacing */}
      {slidesCount > 1 && (
        <div className="flex justify-center mt-4 md:mt-8 space-x-1 md:space-x-2">
          {Array.from({ length: slidesCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 md:w-8 bg-black' 
                  : 'w-1.5 md:w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Products Count & Current Slide - MOBILE: Smaller text */}
      {products.length > 0 && (
        <div className="text-center mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
          Showing {currentProducts.length} of {products.length} bestsellers
          {slidesCount > 1 && ` • Page ${currentSlide + 1} of ${slidesCount}`}
        </div>
      )}
      
      {/* View All Link - MOBILE: Smaller button */}
      <div className="text-center mt-6 md:mt-8">
        <Link
          href="/products"
          className="inline-flex items-center justify-center border border-black text-black px-6 py-2.5 md:px-8 md:py-3 font-medium hover:bg-black hover:text-white transition-all text-sm rounded-lg group"
        >
          <span>View All Products</span>
          <ChevronRight size={14} className="ml-1.5 md:ml-2 group-hover:translate-x-0.5 md:group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default BestSellersGrid;