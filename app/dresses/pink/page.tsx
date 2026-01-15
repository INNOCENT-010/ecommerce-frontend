import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function PinkDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Pink' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-pink-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            FEMININE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pink Dresses
          </h1>
          <p className="text-gray-600">
            Soft, romantic, and beautifully feminine
          </p>
        </div>
        
        <ProductGrid category="dresses" />
      </div>
    </main>
  );
}
