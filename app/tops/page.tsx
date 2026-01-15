// app/tops/page.tsx
import ProductGrid from '@/app/components/product/ProductGrid';

export default function TopsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=1800&auto=format&fit=crop" 
            alt="Designer Tops Collection"
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-end pb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Tops</h1>
            <p className="text-xl text-white/90">Stylish tops, blouses, and shirts for your perfect look</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Designer Tops</h2>
            <p className="text-gray-600">Showing 18 luxury tops</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            All Tops
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Blouses
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Shirts
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Bodysuits
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Crop Tops
          </button>
        </div>

        <ProductGrid category="tops" />
      </section>
    </div>
  );
}