import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BluePage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Blue' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BLUE 
        
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Blue Collection
          </h1>
          <p className="text-gray-600">
            Every shade of blue from ocean hues to midnight navy
          </p>
        </div>
        
        <ProductGrid category="blue" />
      </div>
    </main>
  );
}