import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function FitPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Fit' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-amber-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            FIT
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop By Fit
          </h1>
          <p className="text-gray-600">
            Styles tailored to different body types and sizes
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            {['Petite', 'Tall', 'Fuller Bust', 'Bump Approved'].map((type) => (
              <a
                key={type}
                href={`/styles/fit/${type.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                {type}
              </a>
            ))}
          </div>
        </div>
        
        <ProductGrid category="fit" />
      </div>
    </main>
  );
}
