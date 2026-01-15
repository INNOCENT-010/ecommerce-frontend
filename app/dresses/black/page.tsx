import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BlackDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Black' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gray-900 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CLASSIC
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Black Dresses
          </h1>
          <p className="text-gray-600">
            Timeless elegance in classic black
          </p>
        </div>
        
        <ProductGrid category="dresses" />
      </div>
    </main>
  );
}
