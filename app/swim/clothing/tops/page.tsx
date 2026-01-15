import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SwimTopsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Clothing', href: '/swim/clothing' },
          { label: 'Tops' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-yellow-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BEACH TOPS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Swim Tops
          </h1>
          <p className="text-gray-600">
            Stylish tops for your beach and poolside looks
          </p>
        </div>
        
        <ProductGrid category="swim-tops" />
      </div>
    </main>
  );
}
