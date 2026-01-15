// app/new-in/page.tsx - CREATE THIS FILE
import ProductGrid from '@/app/components/product/ProductGrid';

export default function NewInPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4">
            <span className="inline-block bg-green-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider">
              NEW IN
            </span>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Discover Your New Favorites
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fresh styles just dropped. Shop the latest arrivals before they're gone.
            </p>
            
            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {['Dresses', 'Tops', 'Bottoms', 'Jumpsuits', 'Swimwear', 'Accessories'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-black hover:text-white hover:border-black transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-2">BACK IN STOCK</h3>
            <p className="text-gray-600 mb-4">Popular styles restocked for a limited time</p>
            <button className="text-sm font-medium hover:underline">Shop Now →</button>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-2">TRENDING NOW</h3>
            <p className="text-gray-600 mb-4">What everyone's loving this season</p>
            <button className="text-sm font-medium hover:underline">Shop Now →</button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-violet-100 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-2">PRE-ORDER</h3>
            <p className="text-gray-600 mb-4">Be the first to get upcoming releases</p>
            <button className="text-sm font-medium hover:underline">Shop Now →</button>
          </div>
        </div>

        <ProductGrid category="new-in" />
      </section>
    </div>
  );
}
