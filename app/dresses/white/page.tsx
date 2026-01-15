import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function WhiteDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'White' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gray-200 text-gray-900 text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            PURE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            White Dresses
          </h1>
          <p className="text-gray-600">
            Pure, clean, and effortlessly chic
          </p>
        </div>
        
        <ProductGrid category="dresses" />
      </div>
    </main>
  );
}
