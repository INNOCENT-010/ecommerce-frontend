// app/page.tsx - COMPLETE UPDATED VERSION
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
  const [homepageMedia, setHomepageMedia] = useState<typeof HOMEPAGE_MEDIA | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Categories data - MOBILE: 2 columns with last one full width, Desktop: 5 columns
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
      <section className="relative h-[60vh] md:h-[90vh] overflow-hidden">
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
        
        <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-end pb-12 md:pb-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Dress to <span className="italic">Impress</span>
            </h1>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-xl">
              Where luxury meets elegance. Discover gowns that make every moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link 
                href="/products?category=dresses&tag=gowns"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-10 py-3 md:py-4 font-bold tracking-wider hover:shadow-xl transition-all text-xs md:text-sm uppercase inline-flex items-center justify-center rounded"
              >
                Explore Gowns
                <ArrowRight className="ml-2" size={16} />
              </Link>
              
              <Link 
                href="/products?category=Newin"
                className="bg-transparent border-2 border-white text-white px-6 md:px-10 py-3 md:py-4 font-bold tracking-wider hover:bg-white/10 transition-all text-xs md:text-sm uppercase inline-flex items-center justify-center rounded"
              >
                Shop New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== CATEGORIES SECTION - MOBILE: 2 columns with last one full width ===== */}
      <section className="w-full py-6 md:py-0">
        <div className="w-full px-4 md:px-0">
          {/* Mobile: 2 columns with custom handling for odd number, Desktop: Your original 5 columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-0 h-auto md:h-[85vh] min-h-[50vh] md:min-h-[600px]">
            {categories.map((category, index) => {
              // On mobile, if it's the last category (5th one), make it full width
              const isLastCategory = index === categories.length - 1;
              const mobileColSpan = isLastCategory ? 'col-span-2' : 'col-span-1';
              
              return (
                <div 
                  key={category.name} 
                  className={`relative ${mobileColSpan} md:col-span-1 ${
                    index < categories.length - 1 ? 'md:border-r border-[#E8D5D3]' : ''
                  }`}
                >
                  <Link 
                    href={category.href}
                    className="group relative overflow-hidden hover:z-10 block h-[40vh] md:h-full w-full"
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 text-white z-20">
                      <div className="inline-block bg-black/80 text-white px-3 py-2 md:px-6 md:py-3 rounded-lg">
                        <h3 className="text-base md:text-2xl font-serif font-light tracking-widest">{category.name}</h3>
                      </div>
                    </div>
                    {/* SHOP NOW button */}
                    <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] absolute top-4 right-4 px-3 py-1.5 md:px-5 md:py-3 rounded-full text-xs md:text-base font-bold md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg">
                      SHOP NOW
                    </div>
                    <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/15 transition-colors duration-300 z-10"></div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== BEST SELLERS SECTION ===== */}
      <section className="w-full py-8 md:py-0">
        <div className="w-full px-4 md:px-0 relative">
          {/* Mobile: Add section header */}
          <div className="md:hidden text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bestsellers</h2>
            <p className="text-gray-600 text-sm">Our most loved pieces</p>
          </div>
          
          {/* Best Sellers Grid Component */}
          <BestSellersGrid />
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SWIM BANNER ===== */}
      <section className="relative h-[40vh] md:h-[70vh] overflow-hidden bg-[#FAF7F5] mt-8 md:mt-12">
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
        <div className="relative z-30 h-full flex items-end justify-center pb-6 md:pb-12">
          <div className="text-center mb-4 md:mb-8">
            <div className="bg-black/80 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg mb-4 md:mb-6 inline-block">
              <h2 className="text-lg md:text-xl font-medium tracking-wide">SWIM COLLECTION</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link 
                href="/products?category=Swimwear"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-8 py-2 md:py-3 font-medium tracking-wide hover:shadow-xl transition-all text-xs md:text-sm uppercase inline-flex items-center justify-center rounded"
              >
                Shop Now
                <ArrowRight className="ml-2 md:ml-3" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SHOP THIS MATCH SECTION ===== */}
      <section className="w-full py-8 md:py-0">
        <div className="w-full px-4 md:px-0 relative">
          {/* Mobile: Add section header */}
          <div className="md:hidden text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop This Match</h2>
            <p className="text-gray-600 text-sm">Curated selections just for you</p>
          </div>
          
          {/* No Section Header - Just the grid */}
          <ShopThisMatch />
        </div>
      </section>

      {/* ===== THIN DIVIDER LINE ===== */}
      <div className="w-full border-t border-[#E8D5D3]"></div>

      {/* ===== SPACE BETWEEN SHOP THIS MATCH AND PRE-ORDER ===== */}
      <div className="h-8 md:h-20 bg-[#FAF7F5]"></div>

      {/* ===== PRE-ORDER BANNER ===== */}
      <section className="relative h-[40vh] md:h-[70vh] overflow-hidden bg-[#FAF7F5]">
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
        <div className="relative z-30 h-full flex items-end justify-center pb-6 md:pb-12">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Link 
              href="/products?tag=pre-order"
              className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-8 py-2 md:py-3 font-medium tracking-wide hover:shadow-xl transition-all text-xs md:text-sm uppercase inline-flex items-center justify-center rounded"
            >
              Pre-Order
              <ArrowRight className="ml-2 md:ml-3" size={14} />
            </Link>
            
            <Link 
              href="/pre-order#notify"
              className="bg-transparent border border-white text-white px-6 md:px-8 py-2 md:py-3 font-medium tracking-wide hover:bg-white/10 transition-all text-xs md:text-sm uppercase inline-flex items-center justify-center rounded"
            >
              Notify Me
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SPACE BEFORE NEWSLETTER ===== */}
      <div className="h-8 md:h-20 bg-[#FAF7F5]"></div>

      {/* FEATURE 3: NEWSLETTER SECTION WITH ORIGINAL DESIGN */}
      <section className="py-8 md:py-16 border-t border-[#E8D5D3] bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">Join The BLOOM&G Club</h2>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base max-w-md mx-auto">
            Get exclusive access to new collections, VIP sales, and style inspiration.
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#5D2B42] text-sm bg-white rounded"
              />
              {/* GOLD BUTTON */}
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#5D2B42] px-6 md:px-8 py-3 font-medium hover:shadow-xl transition-colors text-sm rounded"
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