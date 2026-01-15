import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function DropAGlintPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Drop a Glint' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            SPARKLE DROP
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Drop a Glint
          </h1>
          <p className="text-gray-600">
            Shimmering, sparkling, and sequined pieces for maximum impact
          </p>
        </div>
        
        <ProductGrid category="drop-a-glint" />
      </div>
    </main>
  );
}
