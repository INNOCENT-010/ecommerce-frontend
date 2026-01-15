// src/app/b-and-g-loved/page.tsx
import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BAndGLovedPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'B&G Loved' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            B&G LOVED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            B&G Loved
          </h1>
          <p className="text-gray-600">
            Curated collection of Boohoo & Garment favorites and most-wanted styles
          </p>
        </div>
        
        <ProductGrid category="b-and-g-loved" />
      </div>
    </main>
  );
}