import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function LimitedEditionSwimPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Limited Edition' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-purple-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            EXCLUSIVE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Limited Edition Swimwear
          </h1>
          <p className="text-gray-600">
            Exclusive swim styles available for a limited time only
          </p>
        </div>
        
        <ProductGrid category="limited-edition" />
      </div>
    </main>
  );
}
