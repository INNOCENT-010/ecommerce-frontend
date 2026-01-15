import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BridalShopPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Bridal Shop' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-white border border-gray-300 text-gray-900 text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BRIDAL
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Bridal Shop
          </h1>
          <p className="text-gray-600">
            Beautiful outfits for brides and bridal parties
          </p>
        </div>
        
        <ProductGrid category="bridal" />
      </div>
    </main>
  );
}
