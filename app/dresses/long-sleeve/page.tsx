import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function LongSleeveDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Long Sleeve' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-indigo-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            SLEEVED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Long Sleeve Dresses
          </h1>
          <p className="text-gray-600">
            Elegant dresses with sophisticated sleeve detailing
          </p>
        </div>
        
        <ProductGrid category="long-sleeve" />
      </div>
    </main>
  );
}
