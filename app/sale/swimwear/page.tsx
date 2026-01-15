import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SaleSwimwearPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sale', href: '/sale' },
          { label: 'Swimwear' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-red-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            SALE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sale Swimwear
          </h1>
          <p className="text-gray-600">
            Beach-ready styles at amazing prices
          </p>
        </div>
        
        <ProductGrid category="sale-swimwear" />
      </div>
    </main>
  );
}
