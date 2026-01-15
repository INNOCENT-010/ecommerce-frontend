import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function PrivateMembersClubPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Private Members Club' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-black text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            EXCLUSIVE ACCESS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Private Members Club
          </h1>
          <p className="text-gray-600">
            Exclusive styles, early access, and members-only benefits
          </p>
        </div>
        
        <ProductGrid category="private-members-club" />
      </div>
    </main>
  );
}
