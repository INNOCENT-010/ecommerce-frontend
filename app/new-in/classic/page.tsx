import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function NewInClassicPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'New In', href: '/new-in' },
          { label: 'Classic' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-amber-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            TIMELESS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            New In Classic
          </h1>
          <p className="text-gray-600">
            Timeless pieces with modern updates
          </p>
        </div>
        
        <ProductGrid category="classic" />
      </div>
    </main>
  );
}
