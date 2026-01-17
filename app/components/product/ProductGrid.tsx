'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { Filter, Grid3x3, Grid2x2, Tag, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/app/types/product';

interface ProductGridProps {
  category?: string;
  tag?: string;
  viewMode?: 'grid-3' | 'grid-4' | 'grid-8';
  showFilters?: boolean;
  specialLayout?: 'newin' | 'occasion' | 'default';
}

const FILTER_OPTIONS = [
  { label: 'Price', options: ['Under NGN 25,000', 'NGN 25,000 - NGN 50,000', 'NGN 50,000+'] },
  { label: 'Colour', options: ['Red', 'Black', 'White', 'Gold', 'Pink', 'Blue', 'Green'] },
  { label: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Length', options: ['Mini', 'Midi', 'Maxi', 'Gown'] },
  { label: 'Tags', options: [] },
  { label: 'All filters', options: [] },
];

// Helper function to transform Supabase data to Product format
const transformSupabaseProduct = (item: any): Product => {
  let imageValue: string | string[];
  
  if (item.product_images && Array.isArray(item.product_images) && item.product_images.length > 0) {
    const sortedImages = item.product_images
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
    
    imageValue = sortedImages.map((img: any) => img.url || '');
  } else if (item.image) {
    imageValue = item.image;
  } else {
    imageValue = 'https://via.placeholder.com/600x800/cccccc/969696?text=Product';
  }

  if (Array.isArray(imageValue) && imageValue.length === 0) {
    imageValue = 'https://via.placeholder.com/600x800/cccccc/969696?text=Product';
  } else if (Array.isArray(imageValue) && imageValue.length === 1) {
    imageValue = imageValue[0];
  }

  return {
    id: item.id,
    slug: item.slug,
    created_at: item.created_at,
    name: item.name,
    description: item.description || '',
    price: item.price,
    originalPrice: item.original_price,
    image: imageValue,
    category: item.category || '',
    colors: item.colors || [],
    sizes: item.sizes || [],
    isNew: item.tags?.includes('new') || item.is_new || false,
    isSale: item.original_price && item.original_price > item.price,
    tags: item.tags || []
  };
};

export default function ProductGrid({ 
  category, 
  tag,
  viewMode = 'grid-4',
  showFilters = true,
  specialLayout = 'default'
}: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [pendingFilters, setPendingFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('featured');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const prevSearchParamsRef = useRef<string>('');

  // Configuration
  const PRODUCTS_PER_PAGE = 12;
  
  // Grid configuration based on viewMode
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-3':
        return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3';
      case 'grid-4':
        return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'grid-8':
        return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
      default:
        return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const gridClasses = getGridClasses();

  useEffect(() => {
    const filters: Record<string, string[]> = {};
    
    FILTER_OPTIONS.forEach(filter => {
      const values = searchParams.getAll(filter.label);
      if (values.length > 0) {
        filters[filter.label] = values;
      }
    });
    
    if (tag && !filters['Tags']?.includes(tag)) {
      filters['Tags'] = [tag];
    }
    
    setActiveFilters(filters);
    setPendingFilters(filters);
    setCurrentPage(1);
  }, [searchParams, tag]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images (url, alt_text, order_index)
          `)
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        
        if (error) {
          console.error('Failed to fetch products for filters', error);
          return;
        }
        
        if (!data) {
          return;
        }
        
        const transformedProducts: Product[] = data.map(transformSupabaseProduct);
        
        const allTags = Array.from(
          new Set(transformedProducts.flatMap(p => p.tags || []))
        ).filter(Boolean);
        
        const allSizes = Array.from(
          new Set(transformedProducts.flatMap(p => p.sizes || []))
        ).filter(Boolean);
        
        const allColors = Array.from(
          new Set(transformedProducts.flatMap(p => p.colors || []))
        ).filter(Boolean);
        
        setAvailableTags(allTags);
        setAvailableSizes(allSizes);
        setAvailableColors(allColors);
        
      } catch (err) {
        console.error('Failed to fetch products for filters', err);
      }
    };
    
    fetchAllProducts();
  }, []);

  const fetchProducts = useCallback(async (filters: Record<string, string[]> = activeFilters) => {
    const currentParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, values]) => {
      values.forEach(value => {
        currentParams.append(key, value);
      });
    });
    
    const currentParamsString = currentParams.toString();
    
    if (currentParamsString === prevSearchParamsRef.current && products.length > 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      let fetchedProducts: Product[] = [];
      
      if (category) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();
        
        if (categoryError || !categoryData) {
          console.error(`Category not found: "${category}"`, categoryError);
          setProducts([]);
          setLoading(false);
          return;
        }
        
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images (url, alt_text, order_index)
          `)
          .eq('category', categoryData.id);
        
        if (tag) {
          query = query.contains('tags', [tag.toLowerCase()]);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          fetchedProducts = [];
        } else if (data) {
          fetchedProducts = data.map(transformSupabaseProduct);
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (url, alt_text, order_index)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase query error:', error);
          fetchedProducts = [];
        } else if (data) {
          fetchedProducts = data.map(transformSupabaseProduct);
        }
      }
      
      let filteredProducts = fetchedProducts;
      
      FILTER_OPTIONS.forEach(filter => {
        const values = filters[filter.label];
        if (values && values.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            if (filter.label === 'Price') {
              if (values.includes('Under NGN 25,000')) {
                return product.price < 25000;
              }
              if (values.includes('NGN 25,000 - NGN 50,000')) {
                return product.price >= 25000 && product.price <= 50000;
              }
              if (values.includes('NGN 50,000+')) {
                return product.price > 50000;
              }
              return true;
            }
            
            if (filter.label === 'Colour') {
              return product.colors?.some(color => 
                values.includes(color.charAt(0).toUpperCase() + color.slice(1).toLowerCase())
              ) || false;
            }
            
            if (filter.label === 'Size') {
              return product.sizes?.some(size => values.includes(size)) || false;
            }
            
            if (filter.label === 'Length') {
              return values.some(length => 
                product.name.toLowerCase().includes(length.toLowerCase()) ||
                product.description?.toLowerCase().includes(length.toLowerCase()) ||
                product.tags?.some(tag => tag.toLowerCase().includes(length.toLowerCase()))
              );
            }
            
            if (filter.label === 'Tags') {
              return values.some(tag => 
                product.tags?.includes(tag.toLowerCase()) || 
                product.tags?.includes(tag.toUpperCase()) ||
                product.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
              );
            }
            
            return true;
          });
        }
      });
      
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price;
          case 'price-high': return b.price - a.price;
          case 'newest': 
            return 0;
          default: return 0;
        }
      });
      
      setProducts(filteredProducts);
      prevSearchParamsRef.current = currentParamsString;
      
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, activeFilters, tag, products.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(activeFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [sortBy, category, tag, activeFilters, fetchProducts]);

  const togglePendingFilter = (filterLabel: string, option: string) => {
    const newFilters = { ...pendingFilters };
    const currentValues = newFilters[filterLabel] || [];
    
    if (currentValues.includes(option)) {
      newFilters[filterLabel] = currentValues.filter(v => v !== option);
    } else {
      newFilters[filterLabel] = [...currentValues, option];
    }
    
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key].length === 0) {
        delete newFilters[key];
      }
    });
    
    setPendingFilters(newFilters);
  };

  const applyFilters = async () => {
    setActiveFilters(pendingFilters);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
    
    const params = new URLSearchParams();
    
    Object.entries(pendingFilters).forEach(([key, values]) => {
      values.forEach(value => {
        params.append(key, value);
      });
    });
    
    if (category) {
      params.append('category', category);
    }
    
    router.replace(`?${params.toString()}`, { scroll: false });
    
    await fetchProducts(pendingFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setPendingFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
    
    router.replace(category ? `?category=${category}` : '?', { scroll: false });
    
    fetchProducts(emptyFilters);
  };

  const hasPendingChanges = () => {
    return JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters);
  };

  const getPendingFilterCount = () => {
    return Object.values(pendingFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  // Calculate pagination
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  
  // Calculate products to show for current page
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
  const displayedProducts = products.slice(startIndex, endIndex);
  
  const activeFilterCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  if (loading && products.length === 0) {
    return (
      <div className="space-y-8">
        {showFilters && (
          <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
        )}
        
        <div className={`grid ${gridClasses} gap-4 md:gap-6`}>
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Filter Button */}
      {showFilters && (
        <div className="lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium"
          >
            <Filter size={20} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      )}

      {/* Desktop Filter Bar */}
      {showFilters && (
        <div className="hidden lg:block border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">
                {products.length} ITEMS
              </div>
              
              {tag && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Tag size={12} />
                  <span className="font-medium capitalize">{tag}</span>
                  <button 
                    onClick={() => clearFilters()}
                    className="text-blue-600 hover:text-blue-900 ml-1"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {Object.entries(activeFilters).map(([filter, values]) => (
                values.map(value => (
                  <div
                    key={`${filter}-${value}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    <span className="capitalize">{value}</span>
                    <button
                      onClick={() => {
                        const newFilters = { ...pendingFilters };
                        const currentValues = newFilters[filter] || [];
                        
                        newFilters[filter] = currentValues.filter(v => v !== value);
                        
                        if (newFilters[filter].length === 0) {
                          delete newFilters[filter];
                        }
                        
                        setPendingFilters(newFilters);
                      }}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </div>
                ))
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Filter Panel */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {FILTER_OPTIONS.map((filter) => (
                  filter.options.length > 0 && (
                    <div key={filter.label} className="space-y-3">
                      <h3 className="font-medium text-gray-900">{filter.label}</h3>
                      <div className="space-y-2">
                        {filter.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={pendingFilters[filter.label]?.includes(option) || false}
                              onChange={() => togglePendingFilter(filter.label, option)}
                              className="w-5 h-5 rounded border-gray-300"
                            />
                            <span className="text-sm capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            
            <div className="border-t p-4 space-y-3">
              {hasPendingChanges() && (
                <button
                  onClick={applyFilters}
                  className="w-full py-3 bg-black text-white rounded-lg font-medium"
                >
                  Apply Filters ({getPendingFilterCount()})
                </button>
              )}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className={`grid ${gridClasses} gap-4 md:gap-6`}>
        {displayedProducts.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            size="normal"
          />
        ))}
      </div>

      {/* No Products State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            No products found{category ? ` in ${category}` : ''}{tag ? ` with tag "${tag}"` : ''}
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center space-y-4 pt-12 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{endIndex} of {products.length} products
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === 1 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                const isNearCurrent = Math.abs(page - currentPage) <= 2;
                
                if (isNearCurrent || page === 1 || page === totalPages) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium ${
                        isCurrentPage
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}