// src/app/pre-order/page.tsx
import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function PreOrderPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Pre-Order' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            PRE-ORDER
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pre-Order
          </h1>
          <p className="text-gray-600">
            Reserve upcoming styles before they're released - be the first to get them
          </p>
        </div>
        
        <ProductGrid category="pre-order" />
      </div>
    </main>
  );
}
