import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function CampaignPage() {
  const campaigns = [
    { name: 'Countdown', path: '/occasion/campaign/countdown', tag: 'LIMITED TIME' },
    { name: 'Private Members Club', path: '/occasion/campaign/private-members-club', tag: 'EXCLUSIVE' },
    { name: 'Rotation', path: '/occasion/campaign/rotation', tag: 'WEEKLY' },
    { name: 'Drop a Glint', path: '/occasion/campaign/drop-a-glint', tag: 'SPARKLE' },
    { name: 'Femme Lunch', path: '/occasion/campaign/femme-lunch', tag: 'DAYTIME' },
    { name: 'Balleric Nights', path: '/occasion/campaign/balleric-nights', tag: 'NIGHTLIFE' },
    { name: 'New Rotation', path: '/occasion/campaign/new-rotation', tag: 'FRESH' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Campaign' }
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
          
          <div className="flex flex-wrap gap-3 mt-6">
            {campaigns.map((campaign) => (
              <a
                key={campaign.path}
                href={campaign.path}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white hover:border-black transition-colors flex items-center gap-2"
              >
                <span>{campaign.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {campaign.tag}
                </span>
              </a>
            ))}
          </div>
        </div>
        
        <ProductGrid category="campaign" />
      </div>
    </main>
  );
}
