import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SwimEditsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Edits' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CURATED EDITS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Swim Edits
          </h1>
          <p className="text-gray-600">
            Curated collections for different occasions and styles
          </p>
          
          {/* Subcategory Links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {['Bride Mode', 'Summer', 'Pool Party', 'Island Resort', 'Beach to Bar'].map((type) => (
              <a
                key={type}
                href={`/swim/edits/${type.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                {type}
              </a>
            ))}
          </div>
        </div>
        
        <ProductGrid category="swim-edits" />
      </div>
    </main>
  );
}
