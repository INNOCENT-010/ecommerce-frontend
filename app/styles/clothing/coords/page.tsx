import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function CoordsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Clothing', href: '/styles/clothing' },
          { label: 'Co-ords' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            MATCHING SETS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Co-ords
          </h1>
          <p className="text-gray-600">
            Perfectly coordinated matching sets for effortless style
          </p>
        </div>
        
        <ProductGrid category="coords" />
      </div>
    </main>
  );
}