import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function PoolPartyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Edits', href: '/swim/edits' },
          { label: 'Pool Party' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-400 to-cyan-400 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            POOL PARTY
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pool Party Edit
          </h1>
          <p className="text-gray-600">
            Vibrant swimwear and party-ready looks for poolside celebrations
          </p>
        </div>
        
        <ProductGrid category="pool-party" />
      </div>
    </main>
  );
}
