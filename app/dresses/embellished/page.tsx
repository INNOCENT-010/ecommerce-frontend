import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function EmbellishedPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Embellished' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gold-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            EMBELLISHED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Embellished Collection
          </h1>
          <p className="text-gray-600">
            Sparkling details, intricate beading, and dazzling embellishments for standout moments
          </p>
        </div>
        
        <ProductGrid category="embellished" />
      </div>
    </main>
  );
}