// app/admin/layout.tsx - UPDATED VERSION WITH THEME SUPPORT
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import { adminAPI } from '@/lib/admin-api';

// Pages that don't require authentication
const PUBLIC_ADMIN_PAGES = [
  '/admin/login',
  '/admin/manage-admins',
];

// Pages that don't need sidebar/header
const MINIMAL_ADMIN_PAGES = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRenderChildren, setShouldRenderChildren] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      // Check if current path is a public admin page
      if (PUBLIC_ADMIN_PAGES.includes(pathname)) {
        setIsLoading(false);
        setShouldRenderChildren(true);
        return;
      }

      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const isAdmin = localStorage.getItem('is_admin');

      // If no token or not admin, redirect to admin login
      if (!token || isAdmin !== 'true') {
        router.push('/admin/login');
        return;
      }

      // Verify token with backend
      try {
        const data = await adminAPI.verifyAdmin();
        setAdminData(data);
        
        // Token is valid
        setShouldRenderChildren(true);
      } catch (error) {
        console.error('Admin auth verification failed:', error);
        adminAPI.logout();
        router.push('/admin/login');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router, pathname]);

  // Check if current page should use minimal layout
  const isMinimalPage = MINIMAL_ADMIN_PAGES.includes(pathname);

  if (isLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Admin Panel...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // For minimal pages (login, etc.), render children directly with theme
  if (isMinimalPage) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </ThemeProvider>
    );
  }

  // For public admin pages that aren't minimal
  if (PUBLIC_ADMIN_PAGES.includes(pathname)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </ThemeProvider>
    );
  }

  // For protected pages, render the full admin layout with theme
  if (shouldRenderChildren) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <AdminHeader adminData={adminData} />
          <div className="flex pt-16">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:ml-64 transition-all duration-300">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // If we get here, something went wrong
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-300 dark:border-red-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-red-600 dark:text-red-400">Authentication Error</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}