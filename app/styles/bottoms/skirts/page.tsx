import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function SkirtsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Bottoms', href: '/styles/bottoms' },
          { label: 'Skirts & Skorts' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-fuchsia-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            SKIRTS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Skirts & Skorts
          </h1>
          <p className="text-gray-600">
            Versatile skirts and skorts for every occasion
          </p>
        </div>
        
        <ProductGrid category="skirts" />
      </div>
    </main>
  );
}