// app/components/home/ShopThisMatch.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch all products from Supabase
  useEffect(() => {
    const fetchShopThisMatch = async () => {
      try {
        setLoading(true);
        
        // Get total count of products
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Error counting products:', countError);
        } else {
          setTotalProducts(count || 0);
        }
        
        // Get a larger sample of products (40 for more variety)
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
          
          // Get 4 products for initial display (just one slide)
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          const initialProducts = shuffled.slice(0, 4);
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
  
  // Setup rotation interval after products are loaded
  useEffect(() => {
    if (allProducts.length > 0 && displayProducts.length > 0) {
      // Clear any existing interval
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
      
      // Set up new interval to rotate products every 15 seconds
      rotationIntervalRef.current = setInterval(() => {
        rotateProducts();
      }, 15000);
    }
    
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [allProducts, displayProducts]);
  
  // Function to rotate products with new random ones
  const rotateProducts = () => {
    if (allProducts.length <= 4) return;
    
    // Get new random products that aren't currently displayed
    const currentIds = displayProducts.map(p => p.id);
    const availableProducts = allProducts.filter(p => !currentIds.includes(p.id));
    
    // If we don't have enough new products, reset with completely new random selection
    if (availableProducts.length < 4) {
      const shuffledAll = [...allProducts].sort(() => Math.random() - 0.5);
      const newDisplay = shuffledAll.slice(0, 4);
      setDisplayProducts(newDisplay);
      return;
    }
    
    // Shuffle available products and get 4 new ones
    const shuffledAvailable = [...availableProducts].sort(() => Math.random() - 0.5);
    const newProducts = shuffledAvailable.slice(0, 4);
    
    setDisplayProducts(newProducts);
  };
  
  // Manually trigger rotation with the "New Picks" button
  const triggerRotation = () => {
    rotateProducts();
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-[74vh] min-h-[550px]">
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
  
  return (
    <div className="relative">
      {/* New Picks Button */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={triggerRotation}
          className="luxury-black-button gold-text bg-black/90 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transform transition-transform duration-200"
          aria-label="Show new products"
        >
          <span className="text-yellow-400 animate-spin-slow">⟳</span>
          New Picks
        </button>
      </div>
      
      {/* Product Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-[74vh] min-h-[550px]">
        {displayProducts.map((product) => (
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
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-gray-500 line-through text-sm">
                        {formatPrice(product.original_price)}
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
                    Buy This Match For You
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Info text about rotating products */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-6">
          <p className="text-gray-500 text-sm">
            Showing {displayProducts.length} of {totalProducts} products
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-500 text-xs">Auto-refreshing every 15 seconds</p>
          </div>
        </div>
        
        {/* Instruction for users */}
        <div className="mt-2">
          <p className="text-gray-400 text-xs">
            Click "New Picks" to refresh products • Hover for details
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShopThisMatch;