import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function TopsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Tops' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-pink-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            TOPS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tops Collection
          </h1>
          <p className="text-gray-600">
            Discover our collection of stylish tops for every occasion
          </p>
          
          {/* Subcategory Links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {['Corset', 'Going Out', 'Crop', 'Long Sleeve', 'Bodysuits', 'Embellished', 'Go-To'].map((type) => (
              <a
                key={type}
                href={`/styles/tops/${type.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                {type}
              </a>
            ))}
          </div>
        </div>
        
        <ProductGrid category="tops" />
      </div>
    </main>
  );
}
