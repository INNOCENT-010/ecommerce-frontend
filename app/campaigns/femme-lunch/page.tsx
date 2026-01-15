import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function FemmeLunchPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Femme Lunch' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-pink-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            DAYTIME SOPHISTICATION
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Femme Lunch
          </h1>
          <p className="text-gray-600">
            Chic, sophisticated styles perfect for daytime events and lunches
          </p>
        </div>
        
        <ProductGrid category="femme-lunch" />
      </div>
    </main>
  );
}
