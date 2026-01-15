// src/app/trending/page.tsx
import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function TrendingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Trending' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            TRENDING NOW
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trending Now
          </h1>
          <p className="text-gray-600">
            The most talked-about and trending styles of the moment
          </p>
        </div>
        
        <ProductGrid category="trending" />
      </div>
    </main>
  );
}
