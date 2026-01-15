import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function WeddingGuestPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Wedding Guest' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-rose-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            ELEGANT
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Wedding Guest Dresses
          </h1>
          <p className="text-gray-600">
            Perfect dresses for celebrating love in style
          </p>
        </div>
        
        <ProductGrid category="wedding" />
      </div>
    </main>
  );
}
