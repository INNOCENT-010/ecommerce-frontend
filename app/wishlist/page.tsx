// app/wishlist/page.tsx - CREATE THIS FILE
'use client';

import { useEffect, useState } from 'react';
import { Heart, Calendar, ShoppingBag, X, Clock, Tag } from 'lucide-react';
import { wishlistApi } from '@/lib/supabase';
import Link from 'next/link';
import { useCurrency } from '@/app/context/CurrencyContext';

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  description: string | null;
  category: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  product_images: { url: string; alt_text: string | null }[];
  added_at?: string;
}

export default function WishlistPage() {
  const [wishlistData, setWishlistData] = useState<Record<string, WishlistProduct[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [totalCount, setTotalCount] = useState(0);
  const { convert } = useCurrency();
  
  useEffect(() => {
    fetchWishlist();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };
    
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);
  
  // First, update the fetchWishlist function with better logging:
const fetchWishlist = async () => {
  setIsLoading(true);
  try {
    const result = await wishlistApi.getWishlist();
    // Check if we have groupedByMonth
    const groupedByMonth = result.groupedByMonth || {};
    
    
    // Log each month's items
    Object.entries(groupedByMonth).forEach(([month, items]) => {
      });
    
    setWishlistData(groupedByMonth);
    
    // Calculate total count
    let count = 0;
    Object.values(groupedByMonth).forEach(items => {
      if (Array.isArray(items)) {
        count += items.length;
      }
    });
    
    setTotalCount(count);
    
    // If still empty, check localStorage
    if (count === 0 && typeof window !== 'undefined') {
      const guestWishlist = localStorage.getItem('guest_wishlist');
      }
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    setWishlistData({});
    setTotalCount(0);
  } finally {
    setIsLoading(false);
  }
};


  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      
      // Update local state
      const updatedData = { ...wishlistData };
      Object.keys(updatedData).forEach(month => {
        updatedData[month] = updatedData[month].filter(item => item.id !== productId);
      });
      
      // Remove empty months
      Object.keys(updatedData).forEach(month => {
        if (updatedData[month].length === 0) {
          delete updatedData[month];
        }
      });
      
      setWishlistData(updatedData);
      
      // Update count
      setTotalCount(prev => prev - 1);
      
      // Trigger update event for header
      const event = new CustomEvent('wishlist-updated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };
  
  const getMonthTabs = () => {
    const months = Object.keys(wishlistData);
    return [
      { id: 'all', label: `All Items (${totalCount})` },
      ...months.map(month => ({
        id: month,
        label: `${month} (${wishlistData[month].length})`
      }))
    ];
  };
  
  const getFilteredProducts = () => {
    if (activeTab === 'all') {
      return Object.values(wishlistData).flat();
    }
    return wishlistData[activeTab] || [];
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (monthYear === currentMonth) return 'This Month';
    if (monthYear === lastMonthStr) return 'Last Month';
    return monthYear;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const monthTabs = getMonthTabs();
  const filteredProducts = getFilteredProducts();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-100 via-rose-100 to-purple-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full mb-4">
                <Heart className="text-pink-500" size={20} />
                <span className="text-sm font-medium text-pink-700">Your Wishlist</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Saved Items You Love
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl">
                {totalCount === 0 
                  ? 'Your wishlist is empty. Start saving your favorite items!'
                  : `You have ${totalCount} saved item${totalCount !== 1 ? 's' : ''} across ${Object.keys(wishlistData).length} time period${Object.keys(wishlistData).length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">{totalCount}</div>
                <div className="text-sm text-gray-600">Saved Items</div>
              </div>
              
              {totalCount > 0 && (
                <Link
                  href="/products"
                  className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Month Tabs */}
        {monthTabs.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
              {monthTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {totalCount === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-pink-100 rounded-full mb-6">
              <Heart className="text-pink-400" size={48} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start saving items you love! Click the heart icon on any product to add it here.
            </p>
            
            <div className="space-y-4">
              <Link
                href="/products"
                className="inline-block px-8 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors"
              >
                Browse Products
              </Link>
              <div className="text-sm text-gray-500">
                <p className="mb-2">💡 Tip: Items are organized by when you saved them</p>
                <p>This Month • Last Month •etc.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group relative"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {product.product_images && product.product_images.length > 0 ? (
                      <img
                        src={product.product_images[0].url}
                        alt={product.product_images[0].alt_text || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    
                    {/* Wishlist Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
                      title="Remove from wishlist"
                    >
                      <Heart className="fill-red-500 text-red-500" size={20} />
                    </button>
                    
                    {/* Date Added */}
                    {product.added_at && (
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 z-10">
                        <Calendar size={10} />
                        <span>Saved {formatDate(product.added_at)}</span>
                      </div>
                    )}
                    
                    {/* Month Badge */}
                    {product.added_at && (
                      <div className="absolute top-4 left-4 bg-white/90 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                        {getMonthName(product.added_at)}
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link 
                        href={`/products/${product.slug}`}
                        className="font-medium text-gray-900 line-clamp-1 hover:text-black"
                      >
                        {product.name}
                      </Link>
                      <span className="font-bold text-gray-900">
                        {convert(product.price)}
                      </span>
                    </div>
                    
                    {product.original_price && product.original_price > product.price && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500 line-through">
                          {convert(product.original_price)}
                        </span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                        </span>
                      </div>
                    )}
                    
                    {/* Tags & Colors */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        product.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={`tag-${idx}`}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))
                      )}
                      
                      {/* Colors */}
                      {product.colors && product.colors.length > 0 && (
                        product.colors.slice(0, 1).map((color, idx) => (
                          <span
                            key={`color-${idx}`}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
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
                            {color}
                          </span>
                        ))
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 py-2 text-center text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => {
                          // You can add to cart logic here
                          }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                        title="Add to cart"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Month Summary */}
            {activeTab === 'all' && Object.keys(wishlistData).length > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Wishlist by Month</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(wishlistData).map(([month, items]) => (
                    <div
                      key={month}
                      className="bg-white p-4 rounded-xl border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                      onClick={() => setActiveTab(month)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{month}</h4>
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {items.slice(0, 2).map(item => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                              {item.product_images && item.product_images.length > 0 ? (
                                <img
                                  src={item.product_images[0].url}
                                  alt={item.product_images[0].alt_text || item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {convert(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {items.length > 2 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 text-center">
                            +{items.length - 2} more item{items.length - 2 !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                      
                      <div className="w-full mt-4 py-2 text-center text-sm text-pink-600 hover:text-pink-700 font-medium">
                        View All →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tips Section */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span> Using Your Wishlist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/50 rounded-lg">
                  <div className="text-blue-600 font-bold mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Organized by Time
                  </div>
                  <p className="text-sm text-gray-600">
                    Items are automatically grouped by when you saved them, making it easy to find recent favorites.
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-lg">
                  <div className="text-blue-600 font-bold mb-2">Price Tracking</div>
                  <p className="text-sm text-gray-600">
                    Items on sale will show their original price crossed out, so you can see the savings.
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-lg">
                  <div className="text-blue-600 font-bold mb-2">Easy Organization</div>
                  <p className="text-sm text-gray-600">
                    Click on any month to view only those items, or view all items together.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}