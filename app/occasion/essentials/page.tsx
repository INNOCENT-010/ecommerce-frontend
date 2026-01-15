import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function ElevatedEssentialsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Elevated Essentials' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gray-800 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            ESSENTIALS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Elevated Essentials
          </h1>
          <p className="text-gray-600">
            Versatile pieces that work for any occasion
          </p>
        </div>
        
        <ProductGrid category="essentials" />
      </div>
    </main>
  );
}
