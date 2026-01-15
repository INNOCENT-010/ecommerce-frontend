import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function StylesPage() {
  const categories = [
    { name: 'Tops', href: '/styles/tops', count: '120 items' },
    { name: 'Bottoms', href: '/styles/bottoms', count: '85 items' },
    { name: 'Clothing', href: '/styles/clothing', count: '95 items' },
    { name: 'Fit', href: '/styles/fit', count: '65 items' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Styles' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="inline-block bg-rose-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            STYLES
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop By Style
          </h1>
          <p className="text-gray-600">
            Discover your signature look with our curated style collections
          </p>
        </div>

        {/* Style Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.href}
              className="bg-gray-50 p-6 rounded-xl hover:bg-black hover:text-white transition-colors group"
            >
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-sm opacity-75">{category.count}</p>
              <div className="mt-4 text-sm font-medium group-hover:text-white">
                Shop Now →
              </div>
            </a>
          ))}
        </div>

        <ProductGrid category="styles" />
      </div>
    </main>
  );
}