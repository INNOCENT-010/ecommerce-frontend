import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BallericNightsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Campaigns', href: '/swim/campaigns' },
          { label: 'Balleric Nights' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CAMPAIGN
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Balleric Nights Campaign
          </h1>
          <p className="text-gray-600">
            Evening-inspired swimwear with a touch of glamour
          </p>
        </div>
        
        <ProductGrid category="balleric-nights" />
      </div>
    </main>
  );
}
