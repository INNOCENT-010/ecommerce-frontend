// app/dresses/mini/page.tsx - CORRECTED
import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function MiniDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Mini' }
        ]}
      />
      
      {/* Simple Page Header - NOT a full hero section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mini Dresses
          </h1>
          <p className="text-gray-600">
            Short, chic, and perfect for any occasion. Shop our collection of mini dresses.
          </p>
        </div>
        
        <ProductGrid category="mini-dresses" />
      </div>
    </main>
  );
}
