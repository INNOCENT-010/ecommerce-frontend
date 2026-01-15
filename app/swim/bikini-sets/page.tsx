import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BikiniSetsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Bikini Sets' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-cyan-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BEACH READY
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bikini Sets
          </h1>
          <p className="text-gray-600">
            Coordinated swim sets for the perfect beach look
          </p>
        </div>
        
        <ProductGrid category="bikini" />
      </div>
    </main>
  );
}