import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function GraduationPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Occasion', href: '/occasion' },
          { label: 'Graduation' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            GRAD
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Graduation Outfits
          </h1>
          <p className="text-gray-600">
            Celebrate your achievement in style
          </p>
        </div>
        
        <ProductGrid category="graduation" />
      </div>
    </main>
  );
}
