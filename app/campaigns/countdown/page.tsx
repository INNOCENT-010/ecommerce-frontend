import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function CountdownPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Countdown' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            LIMITED TIME
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Countdown Collection
          </h1>
          <p className="text-gray-600">
            Limited edition pieces available for a short time only - don't miss out!
          </p>
        </div>
        
        <ProductGrid category="countdown" />
      </div>
    </main>
  );
}
