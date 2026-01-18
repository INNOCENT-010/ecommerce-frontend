/// app/components/layout/header.tsx
'use client';
import { IMAGE_CONFIG } from '@/config/images';
import Link from 'next/link';
import { Heart, User, Menu, ChevronDown, ArrowRight, ShoppingBag, X, Search } from 'lucide-react';
import SearchBar from '../search/SearchBar';
import { useState, useRef, useEffect } from 'react';      
import { useCurrency } from '@/app/context/CurrencyContext';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar.'; 
import CartSidebarContent from '../cart/CartSidebarContent';
import { useCart } from '@/app/context/CartonContext';
import { supabase, wishlistApi } from '@/lib/supabase';
import { useMobileNav } from '@/app/context/MobileNavContext';

// Interface for dropdown images
interface DropdownImage {
  id: string;
  url: string;
  alt_text: string;
  category: string;
  button_text: string;
  button_link: string;
}

const navigation = [
  {
    name: 'New In',
    href: '/products?category=Newin',
    dropdown: {
      leftContent: [
        { 
          category: 'new-in',
          items: [
            { name: 'View All', href: '/products?category=Newin' },
            { name: 'New In This Month', href: '/products?category=Newin&tag=this-month' },
            { name: 'New In Classic', href: '/products?category=Newin&tag=classic' }
          ]
        },
        {
          category: 'FEATURED',
          items: [
            { name: 'Bestsellers', href: '/products?tag=bestsellers' },
            { name: 'Back in Stock', href: '/products?tag=back-in-stock' },
            { name: 'Trending', href: '/products?tag=trending' },
            { name: 'Rental', href: '/products?tag=rental' },
            { name: 'Pre-order', href: '/products?tag=pre-order' },
            { name: 'B&G Loved', href: '/products?tag=loved' }
          ]
        },
        {
          category: 'COLLECTIONS',
          items: [
            { name: 'Countdown', href: '/products?tag=countdown' },
            { name: 'Private Members Club', href: '/products?tag=members' },
            { name: 'Drop A Glint', href: '/products?tag=glint' }
          ]
        }
      ],
      rightImage: IMAGE_CONFIG.navigation.newIn,
      shopButtonText: 'Shop New Arrivals',
      shopButtonLink: '/products?category=Newin'
    }
  },
  {
    name: 'Occasion',
    href: '/products?category=Occasion',
    dropdown: {
      leftContent: [
        {
          category: 'EDITS',
          items: [
            { name: 'New Years Eve', href: '/products?category=Occasion&tag=new-years' },
            { name: 'Birthday', href: '/products?category=Occasion&tag=birthday' },
            { name: 'Going Out Out', href: '/products?category=Occasion&tag=going-out' },
            { name: 'The Bridal Shop', href: '/products?category=Occasion&tag=bridal' },
            { name: 'Wedding Guest', href: '/products?category=Occasion&tag=wedding' },
            { name: 'Prom', href: '/products?category=Occasion&tag=prom' },
            { name: 'Graduation', href: '/products?category=Occasion&tag=graduation' },
            { name: 'Elevated Essentials', href: '/products?category=Occasion&tag=essentials' },
            { name: 'Sunny', href: '/products?category=Occasion&tag=sunny' },
            { name: 'Rental', href: '/products?category=Occasion&tag=rental' }
          ]
        },
        {
          category: 'CAMPAIGNS',
          items: [
            { name: 'Countdown', href: '/products?tag=countdown' },
            { name: 'Private Members Club', href: '/products?tag=members' },
            { name: 'Rotation', href: '/products?tag=rotation' },
            { name: 'Drop A Glint: Gilded', href: '/products?tag=gilded' },
            { name: 'Femme Lunch', href: '/products?tag=femme-lunch' },
            { name: 'Balleric Nights', href: '/products?tag=balleric' },
            { name: 'New Rotation', href: '/products?tag=new-rotation' }
          ]
        }
      ],
      rightImage: IMAGE_CONFIG.navigation.occasion,
      shopButtonText: 'Shop By Occasion',
      shopButtonLink: '/products?category=Occasion'
    }
  },
  {
    name: 'Dresses',
    href: '/products?category=Dresses',
    dropdown: {
      leftContent: [
        {
          category: 'SHOP BY LENGTH',
          items: [
            { name: 'Mini', href: '/products?category=Dresses&tag=mini' },
            { name: 'Maxi', href: '/products?category=Dresses&tag=maxi' },
            { name: 'Midi', href: '/products?category=Dresses&tag=midi' },
            { name: 'Gowns', href: '/products?category=Dresses&tag=gowns' }
          ]
        },
        {
          category: 'SHOP BY COLOUR',
          items: [
            { name: 'Red', href: '/products?category=Dresses&tag=red' },
            { name: 'Black', href: '/products?category=Dresses&tag=black' },
            { name: 'White', href: '/products?category=Dresses&tag=white' },
            { name: 'Gold', href: '/products?category=Dresses&tag=gold' },
            { name: 'Brown', href: '/products?category=Dresses&tag=brown' },
            { name: 'Pink', href: '/products?category=Dresses&tag=pink' },
            { name: 'Blue', href: '/products?category=Dresses&tag=blue' }
          ]
        },
        {
          category: 'SHOP BY STYLE',
          items: [
            { name: 'Corset', href: '/products?category=Dresses&tag=corset' },
            { name: 'Long Sleeve', href: '/products?category=Dresses&tag=long-sleeve' },
            { name: 'Evening', href: '/products?category=Dresses&tag=evening' },
            { name: 'Embellished', href: '/products?category=Dresses&tag=embellished' },
            { name: 'Bodycon', href: '/products?category=Dresses&tag=bodycon' },
            { name: 'Backless', href: '/products?category=Dresses&tag=backless' },
            { name: 'Daytime', href: '/products?category=Dresses&tag=daytime' }
          ]
        }
      ],
      rightImage: IMAGE_CONFIG.navigation.dresses,
      shopButtonText: 'Shop All Dresses',
      shopButtonLink: '/products?category=Dresses'
    }
  },
  {
    name: 'Styles',
    href: '/products?category=Styles',
    dropdown: {
      leftContent: [
        {
          category: 'TOPS',
          items: [
            { name: 'Corset', href: '/products?category=Styles&tag=tops-corset' },
            { name: 'Going Out', href: '/products?category=Styles&tag=tops-going-out' },
            { name: 'Crop', href: '/products?category=Styles&tag=tops-crop' },
            { name: 'Long Sleeve', href: '/products?category=Styles&tag=tops-long-sleeve' },
            { name: 'Bodysuits', href: '/products?category=Styles&tag=tops-bodysuits' },
            { name: 'Embellished', href: '/products?category=Styles&tag=tops-embellished' },
            { name: 'Go-To', href: '/products?category=Styles&tag=tops-go-to' }
          ]
        },
        {
          category: 'BOTTOMS',
          items: [
            { name: 'Skirts & Skorts', href: '/products?category=Styles&tag=bottoms-skirts' },
            { name: 'Trousers', href: '/products?category=Styles&tag=bottoms-trousers' },
            { name: 'Shorts', href: '/products?category=Styles&tag=bottoms-shorts' },
            { name: 'Denim', href: '/products?category=Styles&tag=bottoms-denim' }
          ]
        },
        {
          category: 'CLOTHING',
          items: [
            { name: 'Co-ords', href: '/products?category=Styles&tag=clothing-coords' },
            { name: 'Jumpsuits & Playsuits', href: '/products?category=Styles&tag=clothing-jumpsuits' },
            { name: 'Denim', href: '/products?category=Styles&tag=clothing-denim' },
            { name: 'Lounge & Intimates', href: '/products?category=Styles&tag=clothinglounge' }
          ]
        },
        {
          category: 'FIT',
          items: [
            { name: 'Petite', href: '/products?category=Styles&tag=fit-petite' },
            { name: 'Tall', href: '/products?category=Styles&tag=fit-tall' },
            { name: 'Fuller Bust', href: '/products?category=Styles&tag=fit-fuller-bust' },
            { name: 'Bump Approved', href: '/products?category=Styles&tag=fit-bump-approved' }
          ]
        }
      ],
      rightImage: IMAGE_CONFIG.navigation.styles,
      shopButtonText: 'Shop All Styles',
      shopButtonLink: '/products?category=Styles'
    }
  },
  {
    name: 'Swim',
    href: '/products?category=Swimwear',
    dropdown: {
      leftContent: [
        {
          category: 'SWIMWEAR',
          items: [
            { name: 'Bikini Sets', href: '/products?category=Swimwear&tag=swimwear-bikini-sets' },
            { name: 'One Piece', href: '/products?category=Swimwear&tag=swimwear-one-piece' },
            { name: 'Bikini Tops', href: '/products?category=Swimwear&tag=swimwear-bikini-tops' },
            { name: 'Bikini Bottoms', href: '/products?category=Swimwear&tag=swimwear-bikini-bottoms' },
            { name: 'Best Sellers', href: '/products?category=Swimwear&tag=swimwear-best-sellers' },
            { name: 'Limited Edition Swimwear', href: '/products?category=Swimwear&tag=swimwear-limited-edition' },
            { name: 'Shop All Swimwear', href: '/products?category=Swimwear' }
          ]
        },
        {
          category: 'CLOTHING',
          items: [
            { name: 'Dresses', href: '/products?category=Swimwear&tag=dresses' },
            { name: 'Tops', href: '/products?category=Swimwear&tag=tops' },
            { name: 'Trousers & Shorts', href: '/products?category=Swimwear&tag=trousers' },
            { name: 'Skirts', href: '/products?category=Swimwear&tag=skirts' },
            { name: 'Shop All Clothing', href: '/products?category=Swimwear' }
          ]
        },
        {
          category: 'EDITS',
          items: [
            { name: 'Bride Mode', href: '/products?category=Swimwear&tag=swim-bride' },
            { name: 'Summer', href: '/products?category=Swimwear&tag=swim-summer' },
            { name: 'Pool Party', href: '/products?category=Swimwear&tag=swim-pool-party' },
            { name: 'Island Resort', href: '/products?category=Swimwear&tag=swim-island' },
            { name: 'Beach to Bar', href: '/products?category=Swimwear&tag=swim-beach-bar' }
          ]
        }
      ],
      rightImage: IMAGE_CONFIG.navigation.swim,
      shopButtonText: 'Shop Swimwear',
      shopButtonLink: '/products?category=Swimwear'
    }
  },
  {
    name: 'Sale',
    href: '/products?category=Sale',
    dropdown: {
      leftContent: [
        {
          category: 'SHOP SALE',
          items: [
            { name: 'Dresses', href: '/products?category=Sale&tag=sale-dresses' },
            { name: 'Tops', href: '/products?category=Sale&tag=sale-tops' },
            { name: 'Trousers', href: '/products?category=Sale&tag=sale-trousers' },
            { name: 'Swimwear', href: '/products?category=Sale&tag=sale-swimwear' },
            { name: 'Activewear', href: '/products?category=Sale&tag=sale-activewear' },
            { name: 'Last Chance to Buy', href: '/products?category=Sale&tag=sale-last-chance' }
          ]
        },
        {
          category: 'SHOP BY PRICE',
          items: [
            { name: 'Sale NGN39,040.69 & Under', href: '/products?category=Sale&maxPrice=39040.69' },
            { name: 'Sale NGN25,000 & Under', href: '/products?category=Sale&maxPrice=25000' },
            { name: 'Sale NGN10,000 & Under', href: '/products?category=Sale&maxPrice=10000' }
          ]
        }
      ],
      rightImage: IMAGE_CONFIG.navigation.sale,
      shopButtonText: 'Shop All Sale',
      shopButtonLink: '/products?category=Sale',
      badge: 'UP TO 50% OFF'
    }
  }
];

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMouseOverDropdown, setIsMouseOverDropdown] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [dropdownImages, setDropdownImages] = useState<Record<string, DropdownImage | null>>({});
  const [loadingImages, setLoadingImages] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { totalItems, totalPrice } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { openNav, isOpen: mobileNavOpen } = useMobileNav();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { currency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    fetchDropdownImages();
    fetchWishlistCount();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };
    
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  const fetchDropdownImages = async () => {
    try {
      setLoadingImages(true);
      const { data, error } = await supabase
        .from('dropdown_images')
        .select('*');

      if (error) throw error;

      // Map images by normalized category
      const imagesMap: Record<string, DropdownImage | null> = {};
      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');

      navigation.forEach(navItem => {
        const categoryImage = data?.find(
          img => normalize(img.category) === normalize(navItem.name)
        );
        imagesMap[navItem.name] = categoryImage || null;
      });

      setDropdownImages(imagesMap);
    } catch (error) {
      console.error('Error fetching dropdown images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const count = await wishlistApi.getWishlistCount();
      setWishlistCount(count);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistCount(0);
    }
  };

  const handleMouseEnterNav = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeaveNav = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isMouseOverDropdown) setActiveDropdown(null);
    }, 100);
  };

  const handleMouseEnterDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMouseOverDropdown(true);
  };

  const handleMouseLeaveDropdown = () => {
    setIsMouseOverDropdown(false);
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 100);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Currency change handler
  const handleCurrencyChange = (newCurrency: 'USD' | 'GBP' | 'EUR' | 'NGN') => {
    setCurrency(newCurrency);
    setCurrencyOpen(false);
    // Refresh page to update all prices
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setCurrencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCartOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, mobileMenuOpen]);

  const activeNavItem = navigation.find(item => item.name === activeDropdown);
  const activeDropdownImage = activeDropdown ? dropdownImages[activeDropdown] : null;

  return (
    <>
      {/* MAIN HEADER */}
      <header className="sticky top-0 z-40 bg-[#fceff2] shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
              aria-label="Menu"
            >
              <Menu size={24} className="text-gray-800" />
            </button>

            {/* Logo */}
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-gray-900">BLOOM&G</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnterNav(item.name)}
                  onMouseLeave={handleMouseLeaveNav}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = item.href;
                    }}
                    className="flex items-center font-medium text-gray-800 hover:text-black text-sm py-2"
                  >
                    {item.name}
                    {item.dropdown && <ChevronDown size={16} className="ml-1" />}
                    {item.name === 'Sale' && (
                      <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        SALE
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="lg:hidden p-2"
                aria-label="Search"
              >
                <Search size={22} />
              </button>

              {/* Desktop Search */}
              <div className="hidden lg:block">
                <SearchBar />
              </div>

              <Link href="/wishlist" className="relative p-1 md:p-2">
                <Heart size={20} className="md:w-5 md:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[1opx] font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <button 
                onClick={toggleCart}
                className="relative p-1 md:p-2 hover:opacity-80 transition-opacity"
              >
                <ShoppingBag size={20} className="md:w-5 md:h-5 text-gray-800" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Currency Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="text-sm font-medium flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded"
                >
                  <span className="font-bold">{currency}</span>
                  <ChevronDown size={14} className={`transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
                </button>

                {currencyOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-xl z-[9999] overflow-hidden">
                    {(['USD', 'GBP', 'EUR', 'NGN'] as const).map((cur) => (
                      <button
                        key={cur}
                        onClick={() => handleCurrencyChange(cur)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                          currency === cur ? 'bg-gray-50 font-bold' : ''
                        }`}
                      >
                        <span>{cur}</span>
                        <span className="text-xs text-gray-500">
                          {cur === 'USD' ? '$' : cur === 'GBP' ? '£' : cur === 'EUR' ? '€' : '₦'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User size={20} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="lg:hidden mt-4 animate-in slide-in-from-top duration-200">
              <SearchBar />
            </div>
          )}

          {/* === DROPDOWN MENU - THICK AND HIGH Z-INDEX === */}
          {activeNavItem?.dropdown && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-[10000]" 
              onMouseEnter={handleMouseEnterDropdown}
              onMouseLeave={handleMouseLeaveDropdown}
              style={{ 
                top: '100%',
              }}
            >
              <div className="container mx-auto px-4 py-8">
                <div className="flex gap-12">
                  <div className="flex-1 grid grid-cols-3 gap-12">
                    {activeNavItem.dropdown.leftContent.map((section, idx) => (
                      <div key={idx} className="pb-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                          {section.category}
                        </h4>
                        <ul className="space-y-3">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <Link
                                href={item.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = item.href;
                                }}
                                className="text-sm text-gray-700 hover:text-black hover:font-medium transition-colors"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Right Image Section with Supabase Integration */}
                  <div className="w-96 relative">
                    <div className="relative rounded-lg overflow-hidden mb-4 h-80">
                      {/* Use Supabase image if available, otherwise fallback */}
                      {loadingImages ? (
                        <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
                      ) : activeDropdownImage ? (
                        <img
                          src={activeDropdownImage.url}
                          alt={activeDropdownImage.alt_text || activeNavItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = activeNavItem.dropdown.rightImage;
                          }}
                        />
                      ) : (
                        <img
                          src={activeNavItem.dropdown.rightImage}
                          alt={activeNavItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = IMAGE_CONFIG.fallbacks.navigation;
                          }}
                        />
                      )}
                      
                      {/* Button positioned on top of the image */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <Link
                          href={activeDropdownImage?.button_link || activeNavItem.dropdown.shopButtonLink}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = activeDropdownImage?.button_link || activeNavItem.dropdown.shopButtonLink;
                          }}
                          className="inline-flex items-center justify-center w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-900 transition-colors text-sm shadow-lg"
                        >
                          {activeDropdownImage?.button_text || activeNavItem.dropdown.shopButtonText}
                          <ArrowRight className="ml-2" size={16} />
                        </Link>
                      </div>
                      
                      {/* Badge if exists */}
                      {activeNavItem.dropdown.badge && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                          {activeNavItem.dropdown.badge}
                        </span>
                      )}
                    </div>
                    
                    {/* Additional info text if needed */}
                    {activeDropdownImage?.alt_text && !activeDropdownImage.alt_text.includes('http') && (
                      <p className="text-xs text-gray-600 text-center mt-2">
                        {activeDropdownImage.alt_text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-lg font-bold">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-4">
                    {navigation.map((item) => (
                      <div key={item.name}>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = item.href;
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                        >
                          <span className="font-medium">{item.name}</span>
                          {item.dropdown && <ChevronDown size={16} />}
                        </Link>
                        
                        {/* Mobile Dropdown */}
                        {item.dropdown && (
                          <div className="pl-4 border-l ml-4">
                            {item.dropdown.leftContent.slice(0, 1).map((section, idx) => (
                              <div key={idx} className="space-y-2 py-2">
                                {section.items.slice(0, 5).map((subItem, subIdx) => (
                                  <Link
                                    key={subIdx}
                                    href={subItem.href}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.location.href = subItem.href;
                                      setMobileMenuOpen(false);
                                    }}
                                    className="block p-2 text-sm text-gray-600 hover:text-black"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="border-t p-4">
                  <div className="space-y-2">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                    >
                      <User size={20} className="mr-3" />
                      <span>Account</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                    >
                      <Heart size={20} className="mr-3" />
                      <span>Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-black text-white text-xs px-2 py-1 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <ProfileSidebar 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      </header>

      {/* === CART SIDEBAR === */}
      {isCartOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={toggleCart}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm lg:block" style={{ width: '60%' }} />
            <div className="absolute right-0 inset-y-0 lg:block" style={{ width: '40%' }} />
          </div>

          <div className="fixed right-0 top-0 h-full w-full lg:w-[40%] bg-white shadow-2xl z-[9999] overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 lg:p-6 border-b">
                <h2 className="text-xl lg:text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={toggleCart}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                {totalItems === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <button
                      onClick={toggleCart}
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <CartSidebarContent onClose={toggleCart} />
                )}
              </div>

              {totalItems > 0 && (
                <div className="border-t p-4 lg:p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">₦{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₦{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        toggleCart();
                        window.location.href = '/checkout';
                      }}
                      className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                    >
                      Proceed to Checkout
                    </button>
                    
                    <Link
                      href="/cart"
                      onClick={toggleCart}
                      className="block w-full py-3 border-2 border-black text-black rounded-lg font-bold text-center hover:bg-gray-50"
                    >
                      View Full Cart
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}