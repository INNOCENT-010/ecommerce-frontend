'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { IMAGE_CONFIG } from '@/config/images';
import BestSellersGrid from '@/app/components/home/BestSellersGrid';
import ShopThisMatch from '@/app/components/home/ShopThisMatch';
import { HOMEPAGE_MEDIA } from '@/config/media';

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Categories data - Beautiful grid on all devices
  const categories = [
    { 
      name: 'New In', 
      href: '/products?category=Newin',
      image: HOMEPAGE_MEDIA.CATEGORIES.NEW_IN,
      description: 'Latest arrivals'
    },
    { 
      name: 'Gowns', 
      href: '/products?category=dresses&tag=gowns',
      image: HOMEPAGE_MEDIA.CATEGORIES.GOWNS,
      description: 'Elegant evening wear'
    },
    { 
      name: 'Tops', 
      href: '/products?category=Styles&tag=tops',
      image: HOMEPAGE_MEDIA.CATEGORIES.TOPS,
      description: 'Statement pieces'
    },
    { 
      name: 'Brown', 
      href: '/products?category=dresses&tag=brown',
      image: HOMEPAGE_MEDIA.CATEGORIES.BROWN,
      description: 'Rich earth tones'
    },
    { 
      name: 'Backless', 
      href: '/products?category=dresses&tag=backless',
      image: HOMEPAGE_MEDIA.CATEGORIES.BACKLESS,
      description: 'Daring designs'
    },
  ];

  useEffect(() => {
    setLoading(false);

    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
          setIsVideoLoaded(true);
        } catch (error) {
          console.log('Video autoplay prevented:', error);
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
      {/* ===== HERO VIDEO SECTION ===== */}
      <section className="relative h-[90vh] md:h-[95vh] overflow-hidden">
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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-[#5D2B42] flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
        
        <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-end pb-12 md:pb-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Dress to <span className="italic">Impress</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-xl">
              Where luxury meets elegance. Discover gowns that make every moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link 
                href="/products?category=dresses&tag=gowns"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-10 py-3 md:py-4 font-bold tracking-wider hover:shadow-xl transition-all text-sm uppercase inline-flex items-center justify-center rounded-lg text-center"
              >
                Explore Gowns
                <ArrowRight className="ml-2" size={18} />
              </Link>
              
              <Link 
                href="/products?category=Newin"
                className="bg-transparent border-2 border-white text-white px-6 md:px-10 py-3 md:py-4 font-bold tracking-wider hover:bg-white/10 transition-all text-sm uppercase inline-flex items-center justify-center rounded-lg text-center"
              >
                Shop New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== BEAUTIFUL CATEGORIES GRID ===== */}
      <section className="w-full py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Shop Categories</h2>
            <p className="text-gray-600 max-w-md mx-auto">Discover our curated collections</p>
          </div>
          
          {/* Mobile: 2 columns, Desktop: 5 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <Link 
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square md:aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Gold badge - visible on all devices */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      {category.name}
                    </div>
                  </div>
                  
                  {/* Description - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white z-20">
                    <p className="text-sm md:text-base font-medium opacity-90">{category.description}</p>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5D2B42]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Shop Now Button - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 py-3 rounded-full text-sm font-bold shadow-2xl transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    SHOP NOW
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* View All Categories Button */}
          <div className="text-center mt-8 md:mt-12">
            <Link 
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300 rounded-lg"
            >
              View All Categories
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== BEST SELLERS SECTION ===== */}
      <section className="w-full py-8 md:py-16 bg-[#FAF7F5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Best Sellers</h2>
            <p className="text-gray-600 max-w-md mx-auto">Our most loved pieces this season</p>
          </div>
          <BestSellersGrid />
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SWIM BANNER ===== */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-white">
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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        <div className="relative z-30 h-full flex flex-col items-center justify-end pb-12 md:pb-16 px-4">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Summer Swim Collection</h2>
            <p className="text-white/90 mb-6 md:mb-8">Make waves with our exclusive swimwear collection</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products?category=Swimwear"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-8 py-3 font-medium tracking-wide hover:shadow-xl transition-all text-sm uppercase inline-flex items-center justify-center rounded-lg"
              >
                Shop Swimwear
                <ArrowRight className="ml-3" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SHOP THIS MATCH SECTION ===== */}
      <section className="w-full py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Complete The Look</h2>
            <p className="text-gray-600 max-w-md mx-auto">Perfectly paired outfits</p>
          </div>
          <ShopThisMatch />
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== PRE-ORDER BANNER ===== */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-white">
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
        
        <div className="relative z-30 h-full flex flex-col items-center justify-end pb-12 md:pb-16 px-4">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-white/90 mb-6 md:mb-8">Be the first to own our upcoming collection</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products?tag=pre-order"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-8 py-3 font-medium tracking-wide hover:shadow-xl transition-all text-sm uppercase inline-flex items-center justify-center rounded-lg"
              >
                View Pre-Order
                <ArrowRight className="ml-3" size={16} />
              </Link>
              
              <Link 
                href="/pre-order#notify"
                className="bg-transparent border border-white text-white px-6 md:px-8 py-3 font-medium tracking-wide hover:bg-white/10 transition-all text-sm uppercase inline-flex items-center justify-center rounded-lg"
              >
                Notify Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER SECTION ===== */}
      <section className="py-12 md:py-16 border-t border-[#E8D5D3] bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Join The BLOOM&G Club</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get exclusive access to new collections, VIP sales, and style inspiration.
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#5D2B42] text-sm bg-white rounded-lg"
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 py-3 font-medium hover:shadow-xl transition-all text-sm rounded-lg min-h-[44px]"
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