// app/components/layout/Breadcrumb.tsx - CREATE THIS FILE
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
 
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="container mx-auto px-4 py-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-black transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-black">{item.label}</span>
            )}
            
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}