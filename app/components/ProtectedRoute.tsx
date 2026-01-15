// app/components/ProtectedRoute.tsx - FIXED VERSION
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 🔒 Routes that require USER authentication (not admin)
  const protectedRoutes = ['/profile'];
  
  // Admin routes - handled separately by admin layout
  const adminRoutes = ['/admin'];
  
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Skip auth check for admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (isProtected && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isProtected, isAuthenticated, router]);

  if (isProtected && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}