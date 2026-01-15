// app/sale/page.tsx - UPDATE THIS FILE (if not already updated)
import ProductGrid from '@/app/components/product/ProductGrid';

export default function SalePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Sale Banner */}
      <section className="relative h-[70vh] overflow-hidden bg-gradient-to-r from-red-900 to-red-700">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1800&auto=format&fit=crop" 
            alt="Sale Collection"
            className="w-full h-full object-cover object-center opacity-30"
          />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">SALE</h1>
            <p className="text-2xl text-white/90 mb-6">Up to 50% OFF • Limited Time Only</p>
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">02</div>
                <div className="text-sm">DAYS</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-3xl font-bold">14</div>
                <div className="text-sm">HOURS</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-3xl font-bold">38</div>
                <div className="text-sm">MIN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Sale Items</h2>
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              HOT DEALS
            </span>
          </div>
          <p className="text-gray-600">Showing 42 items on sale - Don't miss out!</p>
        </div>

        {/* Sale Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
            All Sale
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            50% OFF
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            40% OFF
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            30% OFF
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Clearance
          </button>
        </div>

        {/* Use ProxductGrid */}
        <ProductGrid category="sale" />
      </section>
    </div>
  );
}