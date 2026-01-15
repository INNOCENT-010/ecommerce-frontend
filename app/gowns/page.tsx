// app/gowns/page.tsx
import ProductGrid from '@/app/components/product/ProductGrid';
import { Filter } from 'lucide-react';

export default function GownsPage() {
  const categoryInfo = {
    title: "Gowns",
    description: "Elegant evening gowns for special occasions",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800&auto=format&fit=crop"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src={categoryInfo.image} 
            alt={categoryInfo.title}
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-end pb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{categoryInfo.title}</h1>
            <p className="text-xl text-white/90">{categoryInfo.description}</p>
          </div>
        </div>
      </section>

      {/* Page Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2"> Gowns</h2>
            <p className="text-gray-600">Showing 24 luxury gowns</p>
          </div>
          
          {/* Filter Button */}
          <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 mt-4 md:mt-0">
            <Filter size={18} />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black">
            <option>All Sizes</option>
            <option>XS (UK 6)</option>
            <option>S (UK 8-10)</option>
            <option>M (UK 12-14)</option>
            <option>L (UK 16-18)</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black">
            <option>All Colors</option>
            <option>Black</option>
            <option>Red</option>
            <option>White</option>
            <option>Gold</option>
            <option>Blue</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black">
            <option>All Styles</option>
            <option>Mermaid</option>
            <option>A-Line</option>
            <option>Ball Gown</option>
            <option>Sheath</option>
          </select>
        </div>

        {/* Product Grid */}
        <ProductGrid category="gowns" />
      </section>
    </div>
  );
}
