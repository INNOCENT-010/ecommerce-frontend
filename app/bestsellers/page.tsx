// src/app/bestsellers/page.tsx
import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BestsellersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Bestsellers' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BESTSELLERS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bestsellers
          </h1>
          <p className="text-gray-600">
            Shop our most loved and popular styles - customer favorites
          </p>
        </div>
        
        <ProductGrid category="bestsellers" />
      </div>
    </main>
  );
}
