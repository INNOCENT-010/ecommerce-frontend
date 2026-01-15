// app/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { IMAGE_CONFIG } from '@/config/images';
import BestSellersGrid from '@/app/components/home/BestSellersGrid';
import ShopThisMatch from '@/app/components/home/ShopThisMatch';
import { HOMEPAGE_MEDIA } from '@/config/media';

// Star Rating Component
const StarRating = ({ rating = 4.5, reviewCount = 42 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
 
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />;
          } else {
            return <Star key={i} size={14} className="fill-gray-300 text-gray-300" />;
          }
        })}
      </div>
      <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-500">({reviewCount})</span>
    </div>
  );
};

// Product Card Component
const ProductCardWithRating = ({ product, size = 'normal', showWatermark = false }: { 
  product: any; 
  size?: 'normal' | 'large';
  showWatermark?: boolean;
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const cardHeight = size === 'large' ? 'h-[500px]' : 'h-[400px]';

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    setTimeout(() => setAdding(false), 1000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link href={product.href} className="group block cursor-pointer relative">
      {/* Image Container */}
      <div className={`relative ${cardHeight} overflow-hidden rounded-lg mb-3`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-[#5D2B42] text-white text-xs px-3 py-1 rounded-full font-bold">
              NEW
            </span>
          )}
          {product.isSale && (
            <span className="bg-[#D4AF37] text-[#5D2B42] text-xs px-3 py-1 rounded-full font-bold">
              SALE
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Star 
            size={20} 
            className={isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-700'}
          />
        </button>
        
        {/* Quick Add to Cart - GOLD BUTTON */}
        <button
          onClick={addToCart}
          disabled={adding}
          className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 py-2 rounded-full font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:shadow-lg disabled:opacity-50 whitespace-nowrap z-10 shadow-md absolute bottom-3 left-1/2 transform -translate-x-1/2"
        >
          {adding ? 'Adding...' : 'QUICK ADD'}
        </button>
      </div>
      
      {/* Product Info */}
      <div className="space-y-1 relative z-20">
        <h3 className="font-medium text-gray-900 truncate hover:text-[#5D2B42] transition-colors">
          {product.name}
        </h3>
        
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#5D2B42]">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-500 line-through text-sm">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Color Options */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            <span className="text-xs text-gray-500">Colors:</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color: string, idx: number) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BEST SELLER Watermark Tag */}
      {showWatermark && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-4 py-2 rounded-full text-xs font-bold tracking-wider whitespace-nowrap shadow-lg">
            ★ BEST SELLER
          </div>
        </div>
      )}
    </Link>
  );
};

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [homepageMedia, setHomepageMedia] = useState<typeof HOMEPAGE_MEDIA | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Categories data
  const categories = [
    { 
      name: 'New In', 
      href: '/products?category=Newin',
      image: HOMEPAGE_MEDIA.CATEGORIES.NEW_IN
    },
    { 
      name: 'Gowns', 
      href: '/products?category=dresses&tag=gowns',
      image: HOMEPAGE_MEDIA.CATEGORIES.GOWNS
    },
    { 
      name: 'Tops', 
      href: '/products?category=Styles&tag=tops',
      image: HOMEPAGE_MEDIA.CATEGORIES.TOPS
    },
    { 
      name: 'Brown', 
      href: '/products?category=dresses&tag=brown',
      image: HOMEPAGE_MEDIA.CATEGORIES.BROWN
    },
    { 
      name: 'Backless', 
      href: '/products?category=dresses&tag=backless',
      image: HOMEPAGE_MEDIA.CATEGORIES.BACKLESS
    },
  ];

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setHomepageMedia(HOMEPAGE_MEDIA);
      } catch (error) {
        console.error('Error fetching media:', error);
        setHomepageMedia(HOMEPAGE_MEDIA);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();

    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
          setIsVideoLoaded(true);
        } catch (error) {
          }
      }
    };

    playVideo();
  }, []);

  const handleUserInteraction = () => {
    if (videoRef.current && !isVideoLoaded) {
      videoRef.current.play().then(() => setIsVideoLoaded(true));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D2B42] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading luxury experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5]" onClick={handleUserInteraction}>
      {/* Hero Video Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setIsVideoLoaded(true)}
            poster={HOMEPAGE_MEDIA.HERO.FALLBACK}
          >
            <source src={HOMEPAGE_MEDIA.HERO.VIDEO} type="video/mp4" />
            <img 
              src={HOMEPAGE_MEDIA.HERO.FALLBACK}
              alt="Luxury fashion showcase"
              className="w-full h-full object-cover"
            />
          </video>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-[#5D2B42] flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
        
        <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-end pb-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Dress to <span className="italic">Impress</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-xl">
              Where luxury meets elegance. Discover gowns that make every moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* GOLD BUTTONS */}
              <Link 
                href="/products?category=dresses&tag=gowns"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-10 py-4 font-bold tracking-wider hover:shadow-xl transition-all text-sm uppercase inline-flex items-center justify-center rounded"
              >
                Explore Gowns
                <ArrowRight className="ml-2" size={18} />
              </Link>
              
              <Link 
                href="/products?category=Newin"
                className="bg-transparent border-2 border-white text-white px-10 py-4 font-bold tracking-wider hover:bg-white/10 transition-all text-sm uppercase inline-flex items-center justify-center rounded"
              >
                Shop New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="w-full">
        <div className="w-full px-0">
          <div className="grid grid-cols-5 h-[85vh] min-h-[600px]">
            {categories.map((category, index) => (
              <div key={category.name} className={`relative ${index < categories.length - 1 ? 'border-r border-[#E8D5D3]' : ''}`}>
                <Link 
                  href={category.href}
                  className="group relative overflow-hidden hover:z-10 block h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-block bg-black/80 text-white px-6 py-3 rounded-lg">
                      <h3 className="text-2xl font-serif font-light tracking-widest">{category.name}</h3>
                    </div>
                  </div>
                  {/* GOLD BUTTON */}
                  <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] absolute top-8 right-8 px-5 py-3 rounded-full text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg">
                    SHOP NOW
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 z-10"></div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== BEST SELLERS SECTION ===== */}
      <section className="w-full py-0">
        <div className="w-full px-0 relative">
          {/* Best Sellers Grid Component */}
          <BestSellersGrid />
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SWIM BANNER ===== */}
      <section className="relative h-[70vh] overflow-hidden bg-[#FAF7F5] mt-12">
        <div className="absolute inset-0">
          <img
            src={HOMEPAGE_MEDIA.BANNERS.SWIM}
            alt="Bikini Collection"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center';
            }}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        
        {/* Simple Mature Buttons at Bottom - GOLD BUTTON */}
        <div className="relative z-30 h-full flex items-end justify-center pb-12">
          <div className="text-center mb-8">
            <div className="bg-black/80 text-white px-6 py-3 rounded-lg mb-6 inline-block">
              <h2 className="text-xl font-medium tracking-wide">SWIM COLLECTION</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/products?category=Swimwear"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-8 py-3 font-medium tracking-wide hover:shadow-xl transition-all text-sm uppercase inline-flex items-center justify-center rounded"
              >
                Shop Now
                <ArrowRight className="ml-3" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SHOP THIS MATCH SECTION ===== */}
      <section className="w-full py-0">
        <div className="w-full px-0 relative">
          {/* No Section Header - Just the grid */}
          <ShopThisMatch />
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SPACE BETWEEN SHOP THIS MATCH AND PRE-ORDER ===== */}
      <div className="h-20 bg-[#FAF7F5]"></div>

      {/* ===== PRE-ORDER BANNER ===== */}
      <section className="relative h-[70vh] overflow-hidden bg-[#FAF7F5]">
        <div className="absolute inset-0">
          <img
            src={HOMEPAGE_MEDIA.BANNERS.PREORDER}
            alt="Pre-order collection"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop';
            }}
          />
        </div>
        
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Simple Mature Buttons at Bottom - GOLD BUTTONS */}
        <div className="relative z-30 h-full flex items-end justify-center pb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/products?tag=pre-order"
              className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-8 py-3 font-medium tracking-wide hover:shadow-xl transition-all text-sm uppercase inline-flex items-center justify-center rounded"
            >
              Pre-Order
              <ArrowRight className="ml-3" size={16} />
            </Link>
            
            <Link 
              href="/pre-order#notify"
              className="bg-transparent border border-white text-white px-8 py-3 font-medium tracking-wide hover:bg-white/10 transition-all text-sm uppercase inline-flex items-center justify-center rounded"
            >
              Notify Me
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SPACE BEFORE NEWSLETTER ===== */}
      <div className="h-20 bg-[#FAF7F5]"></div>

      {/* Newsletter Section */}
      <section className="py-16 border-t border-[#E8D5D3] bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Join The BLOOM&G Club</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get exclusive access to new collections, VIP sales, and style inspiration.
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#5D2B42] text-sm bg-white rounded"
              />
              {/* GOLD BUTTON */}
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-8 py-3 font-medium hover:shadow-xl transition-colors text-sm rounded"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}