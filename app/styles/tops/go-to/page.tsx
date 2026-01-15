import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function GoToTopsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Tops', href: '/styles/tops' },
          { label: 'Go-To' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gray-700 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            ESSENTIAL
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Go-To Tops
          </h1>
          <p className="text-gray-600">
            Versatile tops you'll reach for again and again
          </p>
        </div>
        
        <ProductGrid category="go-to-tops" />
      </div>
    </main>
  );
}
