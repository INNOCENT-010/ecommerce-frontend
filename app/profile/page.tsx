// app/profile/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { 
  Star, Eye, Heart, Package, CreditCard, 
  MapPin, Mail, User, Lock, LogOut, TrendingUp,
  CheckCircle, ChevronRight, ShoppingBag, Settings
} from 'lucide-react';
import { Product } from '@/lib/api';
import { useCurrency } from '@/app/context/CurrencyContext';
import ProductCard from '@/app/components/product/ProductCard';

type ActiveTab = 'for-you' | 'orders' | 'profile';

// Create a compatible product type for ProductCard
interface ProductCardProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string | string[];
  category: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  created_at:string;
  isSale?: boolean;
  tags?: string[];
  slug?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('for-you');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [step, setStep] = useState<'email' | 'verify' | 'profile'>('email');
  const [recentlyViewed, setRecentlyViewed] = useState<ProductCardProduct[]>([]);
  const [savedItems, setSavedItems] = useState<ProductCardProduct[]>([]);
  const { convert } = useCurrency();

  // Mock data for points
  const pointsData = {
    total: 1250,
    level: 'Gold Member',
    nextLevelPoints: 250,
    progress: 75 // percentage
  };

  // Mock user profile
  const userProfile = {
    name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fashion Street, New York, NY 10001',
    joinDate: 'January 2024',
    tier: 'Gold'
  };

  // Mock products compatible with ProductCard
  const mockProducts: ProductCardProduct[] = [
    {
      id: 1,
      name: 'Satin Corset Dress',
      description: 'Elegant satin dress with corset detailing',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop',
      category: 'dresses',
      colors: ['Red', 'Black'],
      sizes: ['S', 'M', 'L'],
      isSale: true,
      tags: ['new'],
      created_at:'2026-01-10T09:15:00Z',
      slug: 'satin-corset-dress'
    },
    {
      id: 2,
      name: 'Embellished Evening Gown',
      description: 'Sparkling gown for special occasions',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&auto=format&fit=crop',
      category: 'dresses',
      colors: ['Gold', 'Silver'],
      sizes: ['XS', 'S', 'M'],
      isNew: true,
      tags: ['evening'],
      slug: 'embellished-evening-gown',
      created_at:'2026-01-10T09:15:00Z'
    },
    {
      id: 3,
      name: 'Floral Maxi Dress',
      description: 'Lightweight floral print maxi dress',
      price: 69.99,
      originalPrice: 89.99,
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&auto=format&fit=crop',
      category: 'dresses',
      colors: ['Pink', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      isSale: true,
      tags: ['floral'],
      created_at:'2026-01-10T09:15:00Z',
      slug: 'floral-maxi-dress'
    }
  ];

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setStep('profile');
      // Load user data
      setRecentlyViewed(mockProducts.slice(0, 2));
      setSavedItems(mockProducts.slice(1, 3));
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In production: Call API to send verification code
      setIsEmailSent(true);
      setStep('verify');
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '123456') { // Mock verification
      setIsLoggedIn(true);
      setStep('profile');
      // Store token
      localStorage.setItem('token', 'mock-jwt-token');
      // Load user data
      setRecentlyViewed(mockProducts.slice(0, 2));
      setSavedItems(mockProducts.slice(1, 3));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStep('email');
    setEmail('');
    setVerificationCode('');
    localStorage.removeItem('token');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your profile, orders, and rewards</p>
          </div>

          {/* Auth Flow */}
          <div className="space-y-6">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  Continue with Email
                </button>
                <p className="text-xs text-gray-500 text-center">
                  We'll send you a verification code to sign in
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Verification code sent to
                  </p>
                  <p className="font-medium">{email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  Verify & Sign In
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setIsEmailSent(false);
                  }}
                  className="w-full text-sm text-gray-600 hover:text-black"
                >
                  Use different email
                </button>
              </form>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-12 border-t pt-8">
            <h3 className="font-bold text-lg mb-4">Member Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="font-bold">Earn Points</h4>
                <p className="text-sm text-gray-600">Get rewards for every purchase</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-bold">Track Orders</h4>
                <p className="text-sm text-gray-600">Real-time order updates</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h4 className="font-bold">Wishlist</h4>
                <p className="text-sm text-gray-600">Save items for later</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-gray-600">Welcome back, {userProfile.name}!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{userProfile.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-amber-700">
                      {pointsData.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('for-you')}
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                    activeTab === 'for-you'
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  <span>For You</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5 mr-3" />
                  <span>Orders</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Profile</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 mt-8"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'for-you' && (
              <div className="space-y-8">
                {/* Points Card */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                        <span className="text-lg font-bold">{pointsData.total} Points</span>
                      </div>
                      <p className="text-amber-800">{pointsData.level}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Next Level in</div>
                      <div className="text-2xl font-bold">{pointsData.nextLevelPoints} pts</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>Progress to {pointsData.level}</span>
                      <span>{pointsData.progress}%</span>
                    </div>
                    <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                        style={{ width: `${pointsData.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <button className="text-sm font-medium text-amber-700 hover:text-amber-900">
                    Learn about rewards program →
                  </button>
                </div>

                {/* Recently Viewed */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Recently Viewed
                    </h2>
                    <button className="text-sm text-gray-600 hover:text-black">
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {mockProducts.slice(0, 3).map((product) => (
                      <div key={product.id}>
                        <ProductCard product={product as any} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved for Later */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Saved for Later
                    </h2>
                    <button className="text-sm text-gray-600 hover:text-black">
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {mockProducts.slice(1, 4).map((product) => (
                      <div key={product.id}>
                        <ProductCard product={product as any} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Today */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Popular Today
                    </h2>
                    <button className="text-sm text-gray-600 hover:text-black">
                      Shop Trending
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockProducts.map((product) => (
                      <div key={product.id} className="group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img 
                            src={typeof product.image === 'string' ? product.image : product.image[0] || '/placeholder.jpg'} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{convert(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through text-sm">
                              {convert(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="text-center py-12">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your order history will appear here once you make your first purchase.
                  </p>
                  <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900">
                    Start Shopping
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-8">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Email Address</div>
                            <div className="font-medium">{userProfile.email}</div>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Change Email
                        </button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Full Name</div>
                            <div className="font-medium">{userProfile.name}</div>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Edit Name
                        </button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Shipping Address</div>
                            <div className="font-medium">{userProfile.address}</div>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Edit Address
                        </button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Payment Methods</div>
                            <div className="font-medium">Add payment method</div>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Manage Payments
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4">Account Security</h3>
                    <div className="space-y-4">
                      <button className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">Password</div>
                            <div className="text-sm text-gray-500">Change your password</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <button className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">Order Preferences</div>
                            <div className="text-sm text-gray-500">Delivery and notification settings</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <button className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">Wishlist Settings</div>
                            <div className="text-sm text-gray-500">Manage your saved items</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}