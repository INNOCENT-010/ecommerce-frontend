'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/app/components/product/ProductCard';

interface ShopThisMatchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  category: string;
  tags: string[];
  sizes: string[];
  colors: string[];
  product_images: Array<{
    url: string;
    alt_text: string | null;
  }>;
  created_at: string;
}

function ShopThisMatch() {
  const [allProducts, setAllProducts] = useState<ShopThisMatchProduct[]>([]);
  const [displayProducts, setDisplayProducts] = useState<ShopThisMatchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [rotationCount, setRotationCount] = useState(0);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  
  // Fetch all products from Supabase
  useEffect(() => {
    const fetchShopThisMatch = async () => {
      try {
        setLoading(true);
        
        // Get total count of products
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        setTotalProducts(count || 0);
        
        // Get a larger sample of products
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*)
          `)
          .order('created_at', { ascending: false })
          .limit(40);
        
        if (error) {
          console.error('Error fetching shop this match products:', error);
          return;
        }
        
        if (data) {
          // Store all products
          setAllProducts(data);
          
          // Get initial display products - more for mobile carousel
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          const initialProducts = shuffled.slice(0, 20);
          setDisplayProducts(initialProducts);
        }
        
      } catch (error) {
        console.error('Failed to fetch shop this match products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopThisMatch();
    
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, []);
  
  // Setup rotation interval - every 20 seconds
  useEffect(() => {
    if (allProducts.length > 0 && displayProducts.length > 0) {
      // Clear any existing interval
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
      
      // Set up new interval to rotate products every 20 seconds
      rotationIntervalRef.current = setInterval(() => {
        rotateProducts();
        setRotationCount(prev => prev + 1);
      }, 20000); // 20 seconds
    }
    
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [allProducts, displayProducts]);
  
  // Function to rotate products with new random ones
  const rotateProducts = () => {
    if (allProducts.length <= 12) return;
    
    // Get new random products that aren't currently displayed
    const currentIds = displayProducts.map(p => p.id);
    const availableProducts = allProducts.filter(p => !currentIds.includes(p.id));
    
    // If we don't have enough new products, reset with completely new random selection
    if (availableProducts.length < 20) {
      const shuffledAll = [...allProducts].sort(() => Math.random() - 0.5);
      const newDisplay = shuffledAll.slice(0, 20);
      setDisplayProducts(newDisplay);
      setCurrentMobileIndex(0); // Reset mobile index
      return;
    }
    
    // Shuffle available products and get new ones
    const shuffledAvailable = [...availableProducts].sort(() => Math.random() - 0.5);
    const newProducts = shuffledAvailable.slice(0, 20);
    
    setDisplayProducts(newProducts);
    setCurrentMobileIndex(0); // Reset mobile index
  };
  
  // Manually trigger rotation with the "New Picks" button
  const triggerRotation = () => {
    rotateProducts();
    setRotationCount(prev => prev + 1);
  };
  
  // Mobile navigation
  const nextMobile = () => {
    if (currentMobileIndex < Math.ceil(displayProducts.length / 2) - 1) {
      setCurrentMobileIndex(prev => prev + 1);
    } else {
      setCurrentMobileIndex(0);
    }
  };
  
  const prevMobile = () => {
    if (currentMobileIndex > 0) {
      setCurrentMobileIndex(prev => prev - 1);
    } else {
      setCurrentMobileIndex(Math.ceil(displayProducts.length / 2) - 1);
    }
  };
  
  // Get current 2 products for mobile display
  const getCurrentMobileProducts = () => {
    const startIndex = currentMobileIndex * 2;
    return displayProducts.slice(startIndex, startIndex + 2);
  };
  
  if (loading) {
    return (
      <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:h-[74vh] md:min-h-[550px]">
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
  
  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">
          No products found
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-black text-white px-8 py-3 font-medium hover:bg-gray-900 transition-colors text-sm rounded-lg"
        >
          Shop All Products
        </Link>
      </div>
    );
  }
  
  // Convert product to format for ProductCard
  const convertToProductFormat = (product: ShopThisMatchProduct) => {
    const firstImage = product.product_images?.[0]?.url || '/placeholder-product.jpg';
    
    return {
      id: product.id,
      name: product.name,
      created_at: product.created_at,
      description: '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: firstImage,
      category: product.category,
      colors: product.colors || [],
      sizes: product.sizes || [],
      isNew: product.tags?.some(tag => tag.toLowerCase().includes('new')) || false,
      isSale: product.original_price !== null,
      slug: product.slug,
      tags: product.tags || []
    };
  };
  
  const currentMobileProducts = getCurrentMobileProducts();
  const mobilePagesCount = Math.ceil(displayProducts.length / 2);
  
  return (
    <div className="relative">
      {/* New Picks Button - Desktop: Top right, Mobile: Top center */}
      <div className="absolute top-4 right-4 md:right-4 z-30">
        <button
          onClick={triggerRotation}
          className="bg-black/90 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transform transition-transform duration-200"
          aria-label="Show new products"
        >
          <RefreshCw size={14} className="text-yellow-400" />
          <span className="hidden md:inline">New Picks</span>
          <span className="md:hidden">⟳</span>
        </button>
      </div>
      
      {/* MOBILE: Show 2 products at a time */}
      <div className="md:hidden relative">
        {/* Mobile Navigation Arrows */}
        <button
          onClick={prevMobile}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        
        <button
          onClick={nextMobile}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
        
        {/* 2 Products Grid with thin lines */}
        <div className="grid grid-cols-2 gap-3 px-2">
          {currentMobileProducts.map((product, index) => (
            <div key={product.id} className="col-span-1 relative">
              {/* Ultra thin 0.5px lines */}
              <div className={`absolute -right-[0.5px] top-1/4 bottom-1/4 w-[0.5px] bg-gray-100 ${index === 0 ? '' : 'hidden'}`}></div>
              <div className={`absolute -left-[0.5px] top-1/4 bottom-1/4 w-[0.5px] bg-gray-100 ${index === 1 ? '' : 'hidden'}`}></div>
              <div className="absolute left-1/4 right-1/4 -top-[0.5px] h-[0.5px] bg-gray-100"></div>
              <div className="absolute left-1/4 right-1/4 -bottom-[0.5px] h-[0.5px] bg-gray-100"></div>
              
              {/* Product Card */}
              <div className="h-[55vh]">
                <ProductCard 
                  product={convertToProductFormat(product)}
                  minHeight="55vh"
                />
              </div>
            </div>
          ))}
          
          {/* Fill empty slots if less than 2 products */}
          {currentMobileProducts.length < 2 && 
            Array.from({ length: 2 - currentMobileProducts.length }).map((_, index) => (
              <div key={`empty-${index}`} className="col-span-1">
                <div className="h-[55vh] opacity-0 pointer-events-none"></div>
              </div>
            ))
          }
        </div>
        
        {/* Mobile Page Indicators - Much smaller */}
        {mobilePagesCount > 1 && (
          <div className="flex justify-center mt-3 space-x-1">
            {Array.from({ length: mobilePagesCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMobileIndex(index)}
                className={`h-[2px] w-3 md:h-1 md:w-4 rounded-full transition-all duration-300 ${
                  index === currentMobileIndex 
                    ? 'bg-black' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* DESKTOP: Original Grid Layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 h-[74vh] min-h-[550px]">
        {displayProducts.slice(0, 4).map((product) => (
          <div key={product.id} className="col-span-1 group">
            {/* Product Image Container */}
            <div className="relative h-[74vh] min-h-[550px] overflow-hidden rounded-lg mb-3">
              <img
                src={product.product_images?.[0]?.url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Product Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl">
                  <h3 className="font-medium text-gray-900 truncate mb-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-black">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-gray-500 line-through text-sm">
                        ₦{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Color Options */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-gray-500">Available in:</span>
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ 
                              backgroundColor: color.toLowerCase() === 'black' ? '#000' :
                                            color.toLowerCase() === 'white' ? '#fff' :
                                            color.toLowerCase() === 'red' ? '#ef4444' :
                                            color.toLowerCase() === 'blue' ? '#3b82f6' :
                                            color.toLowerCase() === 'green' ? '#10b981' : '#d1d5db'
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* BUY THIS MATCH Button */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="block w-full bg-black text-white text-center py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors text-sm hover:scale-105 active:scale-95 transform transition-transform duration-200"
                  >
                    Buy This Match 
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Info text about rotating products */}
      <div className="text-center mt-4 md:mt-6">
        <div className="inline-flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <p className="text-gray-500 text-sm">
            {typeof window !== 'undefined' && window.innerWidth < 768 
              ? `Showing ${currentMobileProducts.length} of ${displayProducts.length} products`
              : `Showing ${displayProducts.slice(0, 4).length} of ${displayProducts.length} products`
            }
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-500 text-xs md:text-sm"></p>
          </div>
        </div>
        
        {/* Mobile instruction */}
        <div className="mt-2 md:hidden">
          <p className="text-gray-400 text-xs">
            
          </p>
        </div>
        
        {/* Desktop instruction */}
        <div className="mt-2 hidden md:block">
          <p className="text-gray-400 text-xs">
             
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShopThisMatch;