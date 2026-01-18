'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  Tag,
  Image,
  DollarSign,
  Truck,
  Bell,
  TrendingUp,
  X
} from 'lucide-react';

// Define the props interface
interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/admin/dashboard',
    },
    {
      title: 'Products',
      icon: <Package size={20} />,
      href: '/admin/products',
    },
    {
      title: 'Categories',
      icon: <Tag size={20} />,
      href: '/admin/categories',
    },
    {
      title: 'Orders',
      icon: <ShoppingCart size={20} />,
      href: '/admin/orders',
    },
    {
      title: 'Customers',
      icon: <Users size={20} />,
      href: '/admin/customers',
    },
    {
      title: 'Media',
      icon: <Image size={20} />,
      href: '/admin/media',
    },
    {
      title: 'Analytics',
      icon: <BarChart3 size={20} />,
      href: '/admin/analytics',
    },
    {
      title: 'Payments',
      icon: <DollarSign size={20} />,
      href: '/admin/payments',
    },
    {
      title: 'Shipping',
      icon: <Truck size={20} />,
      href: '/admin/shipping',
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      href: '/admin/notifications',
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      href: '/admin/settings',
    }
  ];

  const isMenuActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  const handleMenuItemClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Mobile close button */}
      <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close menu"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-purple-600 dark:text-purple-300">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={handleMenuItemClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isMenuActive(item.href)
                    ? 'bg-black dark:bg-gray-700 text-white dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className={`${isMenuActive(item.href) ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm lg:text-base">{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Today's Stats
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Orders</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">12</p>
                </div>
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">₦245,800</p>
                </div>
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Visitors</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">342</p>
                </div>
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}