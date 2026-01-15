import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BestSellersSwimPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Best Sellers' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-red-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            POPULAR
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Best Selling Swimwear
          </h1>
          <p className="text-gray-600">
            Our most loved swim styles, tried and tested by customers
          </p>
        </div>
        
        <ProductGrid category="swimwear" />
      </div>
    </main>
  );
}
