import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SportsSwimsuitPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Campaigns', href: '/swim/campaigns' },
          { label: 'B&G x Sports Swimsuit' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-red-500 to-black text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            COLLABORATION
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            B&G x Sports Swimsuit
          </h1>
          <p className="text-gray-600">
            Athletic-inspired swimwear collaboration for active beach days
          </p>
        </div>
        
        <ProductGrid category="sports-swimsuit" />
      </div>
    </main>
  );
}