import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function BumpApprovedPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles' },
          { label: 'Fit', href: '/styles/fit' },
          { label: 'Bump Approved' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-emerald-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            BUMP APPROVED
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bump Approved Collection
          </h1>
          <p className="text-gray-600">
            Comfortable and stylish pieces designed to grow with your bump
          </p>
        </div>
        
        <ProductGrid category="bump-approved" />
      </div>
    </main>
  );
}