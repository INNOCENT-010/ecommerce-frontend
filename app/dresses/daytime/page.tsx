import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function DaytimeDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Daytime' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-sky-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            CASUAL
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Daytime Dresses
          </h1>
          <p className="text-gray-600">
            Comfortable and chic dresses perfect for daytime wear
          </p>
        </div>
        
        <ProductGrid category="daytime" />
      </div>
    </main>
  );
}
