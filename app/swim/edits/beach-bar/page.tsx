import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BeachToBarPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Swim', href: '/swim' },
          { label: 'Edits', href: '/swim/edits' },
          { label: 'Beach to Bar' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BEACH TO BAR
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Beach to Bar Edit
          </h1>
          <p className="text-gray-600">
            Versatile pieces that transition seamlessly from beach to evening
          </p>
        </div>
        
        <ProductGrid category="beach-to-bar" />
      </div>
    </main>
  );
}
