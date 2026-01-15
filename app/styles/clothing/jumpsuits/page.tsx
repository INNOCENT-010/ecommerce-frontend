import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function JumpsuitsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Clothing', href: '/styles/clothing' },
          { label: 'Jumpsuits & Playsuits' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-teal-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            ONE PIECE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Jumpsuits & Playsuits
          </h1>
          <p className="text-gray-600">
            Effortlessly chic one-piece styles for any occasion
          </p>
        </div>
        
        <ProductGrid category="jumpsuits" />
      </div>
    </main>
  );
}