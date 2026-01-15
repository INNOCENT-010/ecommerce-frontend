import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SwimClothingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Clothing' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-cyan-400 to-blue-400 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BEACH WEAR
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Swim Clothing
          </h1>
          <p className="text-gray-600">
            Stylish cover-ups and beachwear to complete your swim look
          </p>
          
          {/* Subcategory Links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {['Dresses', 'Tops', 'Trousers', 'Skirts', 'All'].map((type) => (
              <a
                key={type}
                href={`/swim/clothing/${type.toLowerCase()}`}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                {type}
              </a>
            ))}
          </div>
        </div>
        
        <ProductGrid category="swim-clothing" />
      </div>
    </main>
  );
}
