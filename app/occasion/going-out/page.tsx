import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function GoingOutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Going Out' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-purple-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            NIGHT OUT
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Going Out Outfits
          </h1>
          <p className="text-gray-600">
            Perfect looks for nights out with friends
          </p>
        </div>
        
        <ProductGrid category="going-out" />
      </div>
    </main>
  );
}