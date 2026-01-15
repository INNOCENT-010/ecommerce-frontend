// app/occasion/page.tsx - CREATE THIS FILE
import ProductGrid from '@/app/components/product/ProductGrid';

export default function OccasionPage() {
  const occasions = [
    { name: 'Wedding Guest', color: 'from-emerald-50 to-teal-100', count: '42 styles' },
    { name: 'Birthday', color: 'from-pink-50 to-rose-100', count: '28 styles' },
    { name: 'Date Night', color: 'from-purple-50 to-violet-100', count: '35 styles' },
    { name: 'Graduation', color: 'from-blue-50 to-cyan-100', count: '19 styles' },
    { name: 'New Years Eve', color: 'from-amber-50 to-yellow-100', count: '31 styles' },
    { name: 'Cocktail Party', color: 'from-fuchsia-50 to-pink-100', count: '27 styles' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 px-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              DRESS FOR EVERY OCCASION
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect outfit for your next special event. Curated collections for every moment.
            </p>
            
            {/* Occasion Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {occasions.slice(0, 4).map((occasion) => (
                <a
                  key={occasion.name}
                  href="#"
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-black hover:text-white hover:border-black transition-colors"
                >
                  {occasion.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Occasion Cards */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Shop By Occasion</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {occasions.map((occasion) => (
            <div 
              key={occasion.name} 
              className={`bg-gradient-to-br ${occasion.color} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}
            >
              <h3 className="text-xl font-bold mb-2">{occasion.name}</h3>
              <p className="text-gray-700 mb-4">{occasion.count} available</p>
              <button className="text-sm font-medium hover:underline">
                Shop Collection →
              </button>
            </div>
          ))}
        </div>

        {/* Wedding Guest Featured Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Wedding Guest Edit</h2>
            <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </span>
          </div>
          <ProductGrid category="dresses" />
        </div>
      </section>
    </div>
  );
}