'use client';

import { useMobileNav } from '@/app/context/MobileNavContext';
import { Home, ShoppingBag, User, Heart, Search, Menu, X, Settings, Package, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function MobileNav() {
  const { isOpen, closeNav } = useMobileNav();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: user ? '/account' : '/auth/login', icon: User, label: user ? 'Account' : 'Login' },
  ];

  const adminItems = user?.is_admin ? [
    { href: '/admin', icon: Settings, label: 'Admin', admin: true },
    { href: '/admin/products', icon: Package, label: 'Products', admin: true },
  ] : [];

  const handleLogout = () => {
    logout();
    closeNav();
  };

  return (
    <>
      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 ${isActive(item.href) ? 'text-black' : 'text-gray-500'}`}
              onClick={closeNav}
            >
              <item.icon size={22} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Full-screen Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeNav}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={closeNav} className="p-2">
                  <X size={24} />
                </button>
              </div>

              {user && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Welcome back!</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              )}

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg ${isActive(item.href) ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                    onClick={closeNav}
                  >
                    <item.icon size={20} className="mr-3" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center p-3 rounded-lg text-purple-600 hover:bg-purple-50"
                    onClick={closeNav}
                  >
                    <item.icon size={20} className="mr-3" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}