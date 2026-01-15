import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BikiniTopsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Bikini Tops' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-pink-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            TOPS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bikini Tops
          </h1>
          <p className="text-gray-600">
            Mix and match with our collection of bikini tops
          </p>
        </div>
        
        <ProductGrid category="bikini-tops" />
      </div>
    </main>
  );
}
