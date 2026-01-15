import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SaleUnder10kPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sale', href: '/sale' },
          { label: 'Under NGN10,000' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-red-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            STEAL
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sale Under NGN10,000
          </h1>
          <p className="text-gray-600">
            Unbeatable deals under NGN10,000 - perfect for budget shopping
          </p>
        </div>
        
        <ProductGrid category="sale" />
      </div>
    </main>
  );
}