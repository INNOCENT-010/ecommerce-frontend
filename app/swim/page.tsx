// app/swim/page.tsx - CREATE THIS FILE
import ProductGrid from '@/app/components/product/ProductGrid';

export default function SwimPage() {
  const swimCategories = [
    { name: 'Bikini Sets', count: '42 styles' },
    { name: 'One Pieces', count: '28 styles' },
    { name: 'Cover Ups', count: '35 styles' },
    { name: 'Beach Dresses', count: '24 styles' },
  ];

  const beachEdits = [
    { name: 'Tropical Getaway', theme: 'bg-gradient-to-r from-orange-50 to-yellow-50' },
    { name: 'Pool Party', theme: 'bg-gradient-to-r from-cyan-50 to-blue-50' },
    { name: 'Island Resort', theme: 'bg-gradient-to-r from-emerald-50 to-teal-50' },
    { name: 'Beach Club', theme: 'bg-gradient-to-r from-pink-50 to-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&auto=format&fit=crop" 
            alt="Swim Collection"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">SWIM</h1>
          <p className="text-2xl text-white/90 mb-6">Make waves in our latest swim collection</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-black hover:text-white transition-colors">
              Shop Bikinis
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-black transition-colors">
              Shop One Pieces
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {/* Quick Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Shop Swimwear</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {swimCategories.map((category) => (
              <div 
                key={category.name} 
                className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-gray-700">{category.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Beach Edits */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Beach Edits</h2>
            <span className="bg-cyan-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              CURATED
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {beachEdits.map((edit) => (
              <div 
                key={edit.name} 
                className={`${edit.theme} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}
              >
                <h3 className="text-xl font-bold mb-3">{edit.name}</h3>
                <button className="text-sm font-medium hover:underline">
                  Explore Edit →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Swimwear Grid */}
        <ProductGrid category="swimwear" />
      </section>
    </div>
  );
}