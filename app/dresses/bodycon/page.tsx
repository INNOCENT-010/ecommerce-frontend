import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BodyconDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Bodycon' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-red-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            FITTED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bodycon Dresses
          </h1>
          <p className="text-gray-600">
            Figure-hugging styles that celebrate your curves
          </p>
        </div>
        
        <ProductGrid category="bodycon" />
      </div>
    </main>
  );
}
