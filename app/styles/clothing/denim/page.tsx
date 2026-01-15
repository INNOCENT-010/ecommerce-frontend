import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function ClothingDenimPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Clothing', href: '/styles/clothing' },
          { label: 'Denim' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-blue-800 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            DENIM WEAR
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Denim Clothing
          </h1>
          <p className="text-gray-600">
            Complete denim outfits and coordinated denim pieces
          </p>
        </div>
        
        <ProductGrid category="denim-clothing" />
      </div>
    </main>
  );
}
