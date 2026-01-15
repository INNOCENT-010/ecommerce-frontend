import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function CampaignsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Campaigns' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CAMPAIGNS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Special Campaigns
          </h1>
          <p className="text-gray-600">
            Limited edition collections and exclusive campaigns
          </p>
        </div>
        
        <ProductGrid category="campaigns" />
      </div>
    </main>
  );
}

