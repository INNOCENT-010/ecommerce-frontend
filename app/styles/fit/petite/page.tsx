import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function PetitePage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Fit', href: '/styles/fit' },
          { label: 'Petite' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            PETITE FIT
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Petite Collection
          </h1>
          <p className="text-gray-600">
            Perfectly proportioned pieces designed for petite frames
          </p>
        </div>
        
        <ProductGrid category="petite" />
      </div>
    </main>
  );
}