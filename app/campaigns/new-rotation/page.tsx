import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function NewRotationPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'New Rotation' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            JUST DROPPED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            New Rotation
          </h1>
          <p className="text-gray-600">
            The latest additions to our weekly rotation - fresh off the press
          </p>
        </div>
        
        <ProductGrid category="new-rotation" />
      </div>
    </main>
  );
}