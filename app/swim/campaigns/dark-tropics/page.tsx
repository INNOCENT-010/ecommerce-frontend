import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function DarkTropicsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Campaigns', href: '/swim/campaigns' },
          { label: 'Dark Tropics' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-gray-800 to-blue-900 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CAMPAIGN
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dark Tropics Campaign
          </h1>
          <p className="text-gray-600">
            Moody and dramatic swimwear with tropical influences
          </p>
        </div>
        
        <ProductGrid category="dark-tropics" />
      </div>
    </main>
  );
}