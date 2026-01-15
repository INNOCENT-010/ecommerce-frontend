import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function PromPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Prom' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            PROM
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Prom Dresses
          </h1>
          <p className="text-gray-600">
            Dreamy dresses for your unforgettable prom night
          </p>
        </div>
        
        <ProductGrid category="prom" />
      </div>
    </main>
  );
}
