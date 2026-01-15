import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SwimDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Clothing', href: '/swim/clothing' },
          { label: 'Dresses' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BEACH DRESSES
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Swim Dresses
          </h1>
          <p className="text-gray-600">
            Beautiful dresses perfect for beach-to-bar transitions
          </p>
        </div>
        
        <ProductGrid category="swim-dresses" />
      </div>
    </main>
  );
}
