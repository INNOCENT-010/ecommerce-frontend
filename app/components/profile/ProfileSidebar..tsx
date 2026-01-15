// app/components/profile/ProfileSidebar.tsx - UPDATED WITH MINIMAL CHANGES
'use client';

import { useState, useEffect } from 'react';
import { 
  X, User, Star, Eye, Heart, Package, CreditCard, 
  MapPin, Mail, ChevronRight, ShoppingBag,
  TrendingUp, CheckCircle, LogOut, Loader2
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveTab = 'for-you' | 'orders' | 'profile';

export default function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('for-you');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'complete' | 'profile'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    sendVerificationCode, 
    verifyCode,
    completeRegistration 
  } = useAuth();
  const router = useRouter();

  // Fetch user orders when orders tab is active and user is authenticated
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated && user) {
      fetchUserOrders();
    }
  }, [activeTab, isAuthenticated, user]);
  // IN ProfileSidebar.tsx - JUST UPDATE THE fetchUserOrders FUNCTION
const fetchUserOrders = async () => {
  if (!user?.id) return;
  
  try {
    setOrdersLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    // Get token from localStorage (not from AuthProvider for now)
    const token = localStorage.getItem('token');
    
    // Add Authorization header
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/payments/user/${user.id}/orders`, {
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      setUserOrders(data);
    } else {
      console.error('Failed to fetch orders');
      // Try without auth header as fallback
      const fallbackResponse = await fetch(`${API_URL}/api/payments/user/${user.id}/orders`);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        setUserOrders(fallbackData);
      }
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
  } finally {
    setOrdersLoading(false);
  }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sendVerificationCode(email);
      if (result.success) {
        setStep('verify');
      } else {
        setError(result.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // In ProfileSidebar.tsx - UPDATE THE handleVerificationSubmit FUNCTION:

  const handleVerificationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await verifyCode(email, verificationCode);
    
    if (result.success) {
      if (result.userExists && result.user) {
        // ✅ EXISTING USER: Use the user data from verify-code response
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        
        // Get token for existing user
        const loginResponse = await fetch(`${API_URL}/auth/magic-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email,
            full_name: result.user.full_name || "",
            phone: result.user.phone || ""
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          login(data.access_token, data.user);
          setStep('profile');
          onClose();
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        // New user, collect additional info
        setStep('complete');
      }
    } else {
      setError(result.message || 'Invalid verification code');
    }
  } catch (error) {
    setError('Verification failed. Please try again.');
  } finally {
    setLoading(false);
  }
  };
  

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await completeRegistration(email, fullName, phone);
      if (result.success) {
        setStep('profile');
        onClose();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setFullName('');
    setPhone('');
    setError('');
    setUserOrders([]);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('profile-sidebar');
      if (sidebar && !sidebar.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when sidebar opens
  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        setStep('profile');
        setActiveTab('for-you');
      } else {
        setStep('email');
        setEmail('');
        setVerificationCode('');
        setFullName('');
        setPhone('');
        setError('');
      }
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Sidebar */}
      <div 
        id="profile-sidebar"
        className="fixed right-0 top-0 h-full w-full sm:w-1/4 bg-white z-50 shadow-2xl overflow-y-auto"
        style={{ width: '25%', minWidth: '320px' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold">
              {isAuthenticated ? 'My Profile' : 'Sign In'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!isAuthenticated ? (
            <div className="space-y-6">
              {/* Step 1: Email Entry */}
              {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send a verification code to this email
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Verification Code */}
              {step === 'verify' && (
                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                      {error}
                    </div>
                  )}
                  
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
                      disabled={loading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError('');
                    }}
                    className="w-full text-sm text-gray-600 hover:text-black disabled:opacity-50"
                    disabled={loading}
                  >
                    Use different email
                  </button>
                </form>
              )}

              {/* Step 3: Complete Registration (for new users) */}
              {step === 'complete' && (
                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <User className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-bold">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">Just a few more details</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Tabs Navigation */}
              <div className="flex border-b mb-6">
                <button
                  onClick={() => setActiveTab('for-you')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'for-you'
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'orders'
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Profile
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-8">
                {activeTab === 'for-you' && user && (
                  <>
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-purple-600" />
                        <div>
                          <h3 className="font-bold text-lg">Welcome back, {user.full_name.split(' ')[0]}!</h3>
                          <p className="text-sm text-gray-600">
                            Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Points Section */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                          <span className="text-sm font-medium text-amber-800">Member Tier</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-bold">0 Points</h4>
                          <span className="text-xs text-gray-600">Start earning points!</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onClose();
                          router.push('/rewards');
                        }}
                        className="text-sm font-medium text-purple-700 hover:text-purple-900"
                      >
                        How to earn points →
                      </button>
                    </div>

                    {/* Empty States */}
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Recently Viewed
                          </h3>
                        </div>
                        <p className="text-gray-500 text-sm text-center py-4">
                          Your recently viewed items will appear here
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Saved for Later
                          </h3>
                        </div>
                        <p className="text-gray-500 text-sm text-center py-4">
                          Items saved for later will appear here
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">My Orders</h3>
                      {userOrders.length > 0 && (
                        <button 
                          onClick={() => {
                            onClose();
                            router.push('/orders');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View All
                        </button>
                      )}
                    </div>
                    
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading orders...</p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">No Orders Yet</h3>
                        <p className="text-gray-600 mb-6">
                          Your order history will appear here
                        </p>
                        <button 
                          onClick={() => {
                            onClose();
                            router.push('/products');
                          }}
                          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {userOrders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <button
                                    onClick={() => {
                                      onClose();
                                      router.push(`/order-confirmation?order_number=${order.order_number}`);
                                    }}
                                    className="font-bold text-sm hover:text-blue-600 truncate text-left"
                                    title={order.order_number}
                                  >
                                    {order.order_number}
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm">{formatCurrency(order.total_amount)}</p>
                                <div className="flex items-center gap-1 justify-end mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Items:</span>
                                <span className="font-medium">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Payment:</span>
                                <span className={`font-medium ${
                                  order.payment_status === 'paid' ? 'text-green-600' : 
                                  order.payment_status === 'failed' ? 'text-red-600' : 
                                  'text-yellow-600'
                                }`}>
                                  {order.payment_status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  onClose();
                                  router.push(`/order-confirmation?order_number=${order.order_number}`);
                                }}
                                className="flex-1 text-center border border-gray-300 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition"
                              >
                                View Details
                              </button>
                              {order.status === 'shipped' || order.status === 'processing' ? (
                                <button
                                  className="flex-1 text-center border border-gray-300 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition"
                                  onClick={() => {
                                    onClose();
                                    router.push(`/orders/${order.order_number}/track`);
                                  }}
                                >
                                  Track
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                        
                        {userOrders.length > 5 && (
                          <div className="text-center pt-4 border-t">
                            <button
                              onClick={() => {
                                onClose();
                                router.push('/orders');
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                            >
                              View all {userOrders.length} order{userOrders.length !== 1 ? 's' : ''}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'profile' && user && (
                  <div className="space-y-6">
                    {/* Profile Info */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <h3 className="text-xl font-bold">{user.full_name || 'User'}</h3>
                      <p className="text-gray-600">{user.email}</p>
                    </div>

                    {/* Info Cards */}
                    <div className="space-y-4">
                      <div className="flex items-center p-4 border rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500 mr-3" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium truncate">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-4 border rounded-lg">
                        <User className="w-5 h-5 text-gray-500 mr-3" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">Full Name</div>
                          <div className="font-medium">{user.full_name || 'Not set'}</div>
                        </div>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center p-4 border rounded-lg">
                          <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium">{user.phone}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center p-4 border rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">Saved Address</div>
                          <div className="font-medium">No address saved</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 mt-8"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}