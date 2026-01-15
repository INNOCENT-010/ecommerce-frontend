import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function DenimBottomsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Bottoms', href: '/styles/bottoms' },
          { label: 'Denim' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-blue-800 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            DENIM
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Denim Bottoms
          </h1>
          <p className="text-gray-600">
            Classic denim jeans and bottoms in various styles
          </p>
        </div>
        
        <ProductGrid category="denim" />
      </div>
    </main>
  );
}
