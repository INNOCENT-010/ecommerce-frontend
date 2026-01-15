import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function ClubTropicsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Campaigns', href: '/swim/campaigns' },
          { label: 'Club Tropics' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-green-500 to-yellow-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CAMPAIGN
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Club Tropics Campaign
          </h1>
          <p className="text-gray-600">
            Party-ready swimwear with vibrant tropical prints
          </p>
        </div>
        
        <ProductGrid category="club-tropics" />
      </div>
    </main>
  );
}
