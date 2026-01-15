// app/sets/page.tsx (updated)
import ProductGrid from '@/app/components/product/ProductGrid';
import { Filter } from 'lucide-react';

export default function SetsPage() {
  const categoryInfo = {
    title: "Sets",
    description: "Coordinated outfits for effortless style",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1800&auto=format&fit=crop"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Updated to Oh Polly style */}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Sets</h2>
            <p className="text-gray-600">Showing 12 coordinated sets</p>
          </div>
          
          <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 mt-4 md:mt-0">
            <Filter size={18} />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Casual Sets
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Evening Sets
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Two-Piece
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Three-Piece
          </button>
        </div>

        <ProductGrid category="sets" />
      </section>
    </div>
  );
}
