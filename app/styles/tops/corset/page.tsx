import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function CorsetTopsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Tops', href: '/styles/tops' },
          { label: 'Corset' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-rose-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            STRUCTURED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Corset Tops
          </h1>
          <p className="text-gray-600">
            Structured tops for a defined and elevated silhouette
          </p>
        </div>
        
        <ProductGrid category="corset-tops" />
      </div>
    </main>
  );
}
