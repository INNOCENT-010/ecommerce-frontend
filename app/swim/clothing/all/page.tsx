import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function AllSwimClothingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Clothing', href: '/swim/clothing' },
          { label: 'All Clothing' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-400 to-teal-400 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            FULL COLLECTION
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            All Swim Clothing
          </h1>
          <p className="text-gray-600">
            Complete your beach wardrobe with our swim clothing collection
          </p>
        </div>
        
        <ProductGrid category="swim-clothing" />
      </div>
    </main>
  );
}
