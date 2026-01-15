import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function RotationPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Rotation' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-green-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            WEEKLY ROTATION
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Rotation
          </h1>
          <p className="text-gray-600">
            Fresh styles added weekly - always something new to discover
          </p>
        </div>
        
        <ProductGrid category="rotation" />
      </div>
    </main>
  );
}
