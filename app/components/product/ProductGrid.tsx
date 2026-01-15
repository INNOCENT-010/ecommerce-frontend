'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { Filter, Grid3x3, Grid2x2, Tag, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Determine if a category should have first card bigger
const shouldHaveFirstCardBigger = (category?: string, specialLayout?: 'newin' | 'occasion' | 'default') => {
  if (specialLayout === 'occasion') return false;
  if (specialLayout === 'newin') return true;
  
  const cat = category?.toLowerCase() || '';
  if (['occasion', 'sale', 'sales'].includes(cat)) return false;
  if (['swim', 'swimwear', 'styles', 'dresses', 'newin', 'new arrival', 'new arrivals'].includes(cat)) return true;
  
  return false; // default
};

// Create rows with 3 products per row
const createRows = (products: Product[], firstCardBigger: boolean) => {
  const rows = [];
  const rowHeight = '85vh';
  
  for (let i = 0; i < products.length; i += 3) {
    const rowProducts = products.slice(i, i + 3);
    
    rows.push({
      type: firstCardBigger ? 'first-bigger' as const : 'equal' as const,
      products: rowProducts,
      height: rowHeight
    });
  }
  
  return rows;
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [pendingFilters, setPendingFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('featured');
  const [gridView, setGridView] = useState<'grid-4' | 'grid-8'>(viewMode);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const stickyRef = useRef<HTMLDivElement>(null);
  const prevSearchParamsRef = useRef<string>('');

  // Configuration
  const PRODUCTS_PER_PAGE = 36;
  const MAX_PAGE_BUTTONS = 5;
  const ROW_HEIGHT = '85vh';

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        
        const transformedProducts: Product[] = data.map((item: any) => {
          const images = (item.product_images || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((img: any) => ({
              url: img.url || 'https://via.placeholder.com/600x800/cccccc/969696?text=Product',
              alt: img.alt_text || item.name
            }));
          
          return {
            id: item.id,
            slug: item.slug,
            name: item.name,
            description: item.description,
            price: item.price,
            originalPrice: item.original_price,
            isNew: item.tags?.includes('new') || item.is_new,
            isSale: item.original_price && item.original_price > item.price,
            category: item.category,
            tags: item.tags || [],
            sizes: item.sizes || [],
            colors: item.colors || [],
            images: images,
            created_at: item.created_at,
            updated_at: item.updated_at
          };
        });
        
        setAllProducts(transformedProducts);
        
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
    setTransitioning(true);
    
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
          setTransitioning(false);
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
          fetchedProducts = data.map((item: any) => {
            const images = (item.product_images || [])
              .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
              .map((img: any) => ({
                url: img.url || 'https://via.placeholder.com/600x800/cccccc/969696?text=Product',
                alt: img.alt_text || item.name
              }));
            
            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              description: item.description,
              price: item.price,
              originalPrice: item.original_price,
              isNew: item.tags?.includes('new') || item.is_new,
              isSale: item.original_price && item.original_price > item.price,
              category: item.category,
              tags: item.tags || [],
              sizes: item.sizes || [],
              colors: item.colors || [],
              images: images,
              created_at: item.created_at,
              updated_at: item.updated_at
            };
          });
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
          fetchedProducts = data.map((item: any) => {
            const images = (item.product_images || [])
              .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
              .map((img: any) => ({
                url: img.url || 'https://via.placeholder.com/600x800/cccccc/969696?text=Product',
                alt: img.alt_text || item.name
              }));
            
            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              description: item.description,
              price: item.price,
              originalPrice: item.original_price,
              isNew: item.tags?.includes('new') || item.is_new,
              isSale: item.original_price && item.original_price > item.price,
              category: item.category,
              tags: item.tags || [],
              sizes: item.sizes || [],
              colors: item.colors || [],
              images: images,
              created_at: item.created_at,
              updated_at: item.updated_at
            };
          });
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
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: return 0;
        }
      });
      
      setProducts(filteredProducts);
      
      setTimeout(() => {
        setTransitioning(false);
      }, 150);
      
      prevSearchParamsRef.current = currentParamsString;
      
    } catch (err) {
      console.error('Failed to fetch products', err);
      setTransitioning(false);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, activeFilters, tag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(activeFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [sortBy, category, tag, activeFilters]);

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
    setApplyingFilters(true);
    setActiveFilters(pendingFilters);
    setCurrentPage(1);
    
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
    
    setTimeout(() => {
      setApplyingFilters(false);
    }, 600);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setPendingFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setCurrentPage(1);
    
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
  
  // Determine layout type
  const firstCardBigger = shouldHaveFirstCardBigger(category, specialLayout);
  
  // Create rows from displayed products (3 products per row)
  const rows = createRows(displayedProducts, firstCardBigger);
  
  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const halfMax = Math.floor(MAX_PAGE_BUTTONS / 2);
    
    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);
    
    // Adjust if we're near the beginning
    if (currentPage <= halfMax) {
      endPage = Math.min(MAX_PAGE_BUTTONS, totalPages);
    }
    
    // Adjust if we're near the end
    if (currentPage > totalPages - halfMax) {
      startPage = Math.max(1, totalPages - MAX_PAGE_BUTTONS + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  if (loading && products.length === 0) {
    return (
      <div className="space-y-8">
        {showFilters && (
          <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
        )}
        
        <div className="space-y-8">
          {[...Array(4)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, colIndex) => (
                <div key={colIndex}>
                  <div className="bg-gray-200 rounded-lg h-[85vh] mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeFilterCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  const pendingFilterCount = getPendingFilterCount();

  return (
    <div className="space-y-8">
      {showFilters && (
        <div 
          ref={stickyRef}
          className={`sticky z-40 bg-white transition-all duration-300 ${
            isSticky 
              ? 'top-0 shadow-lg border-b border-gray-200 py-4 px-4 -mx-4' 
              : 'border-b border-gray-200 pb-4'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`text-sm font-medium transition-opacity duration-300 ${
                transitioning ? 'opacity-50' : 'opacity-100'
              }`}>
                {products.length} ITEMS • {firstCardBigger ? 'Featured First' : 'Equal Grid'}
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
            
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_OPTIONS.map((filter) => (
                <div key={filter.label} className="relative group">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                      pendingFilters[filter.label]?.length
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black hover:bg-gray-50'
                    } ${transitioning ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <Filter size={14} />
                    {filter.label}
                    {pendingFilters[filter.label]?.length > 0 && (
                      <span className="bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {pendingFilters[filter.label].length}
                      </span>
                    )}
                  </button>
                  
                  {filter.options.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-64 overflow-y-auto">
                      <div className="p-3">
                        {filter.label === 'Tags' && availableTags.length === 0 ? (
                          <p className="text-sm text-gray-500 p-2">No tags available</p>
                        ) : (
                          filter.options.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={pendingFilters[filter.label]?.includes(option) || false}
                                onChange={() => togglePendingFilter(filter.label, option)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm capitalize">{option}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {hasPendingChanges() && (
                <button
                  onClick={applyFilters}
                  disabled={applyingFilters}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    applyingFilters 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg scale-105'
                      : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02]'
                  } ${transitioning ? 'opacity-50' : 'opacity-100'}`}
                >
                  <Check size={14} className={applyingFilters ? 'animate-pulse' : ''} />
                  Apply Filters
                  {pendingFilterCount > 0 && (
                    <span className={`text-xs w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      applyingFilters ? 'bg-white text-yellow-600' : 'bg-white text-black'
                    }`}>
                      {pendingFilterCount}
                    </span>
                  )}
                </button>
              )}
              
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2 text-sm text-gray-600 hover:text-black transition-opacity duration-300 ${
                    transitioning ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 border border-gray-300 rounded-lg p-1 transition-opacity duration-300 ${
                transitioning ? 'opacity-50' : 'opacity-100'
              }`}>
                <button
                  onClick={() => setGridView('grid-4')}
                  className={`p-2 rounded transition-colors ${
                    gridView === 'grid-4' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setGridView('grid-8')}
                  className={`p-2 rounded transition-colors ${
                    gridView === 'grid-8' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <Grid2x2 size={16} />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white transition-opacity duration-300 ${
                  transitioning ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className={`sticky z-30 bg-white pt-2 transition-all duration-300 ${
          isSticky ? 'top-14' : 'top-0'
        } ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(activeFilters).map(([filter, values]) => (
              values.map(value => (
                <div
                  key={`${filter}-${value}`}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm animate-in slide-in-from-left-4"
                >
                  <span className="font-medium capitalize">{value}</span>
                  <button
                    onClick={() => {
                      const newFilters = { ...pendingFilters };
                      const currentValues = newFilters[filter] || [];
                      
                      if (currentValues.includes(value)) {
                        newFilters[filter] = currentValues.filter(v => v !== value);
                      } else {
                        newFilters[filter] = [...currentValues, value];
                      }
                      
                      if (newFilters[filter].length === 0) {
                        delete newFilters[filter];
                      }
                      
                      setPendingFilters(newFilters);
                    }}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      <div className={`space-y-8 pt-2 transition-opacity duration-300 ${
        transitioning ? 'opacity-50' : 'opacity-100'
      }`}>
        {products.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in">
            <p className="text-gray-600 text-lg mb-4">
              No products found{category ? ` in ${category}` : ''}{tag ? ` with tag "${tag}"` : ''}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          rows.map((row, rowIndex) => {
            if (row.type === 'equal') {
              // Equal layout: 3 equal cards per row
              return (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4"
                  style={{ minHeight: ROW_HEIGHT }}
                >
                  {row.products.map((product, idx) => (
                    <div key={product.id} className="col-span-1 h-full">
                      <ProductCard 
                        product={product}
                        size="default"
                        minHeight={ROW_HEIGHT}
                      />
                    </div>
                  ))}
                </div>
              );
            } else {
              // First card bigger layout: First card bigger, next 2 substantial
              return (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4"
                  style={{ minHeight: ROW_HEIGHT }}
                >
                  {/* First card - bigger (takes 2/4 width = 50%) */}
                  {row.products[0] && (
                    <div className="md:col-span-2 h-full">
                      <ProductCard 
                        product={row.products[0]}
                        size="large"
                        minHeight={ROW_HEIGHT}
                      />
                    </div>
                  )}
                  
                  {/* Next 2 cards - substantial (each takes 1/4 width = 25%) */}
                  {row.products[1] && (
                    <div className="md:col-span-1 h-full">
                      <ProductCard 
                        product={row.products[1]}
                        size="default"
                        minHeight={ROW_HEIGHT}
                      />
                    </div>
                  )}
                  
                  {row.products[2] && (
                    <div className="md:col-span-1 h-full">
                      <ProductCard 
                        product={row.products[2]}
                        size="default"
                        minHeight={ROW_HEIGHT}
                      />
                    </div>
                  )}
                </div>
              );
            }
          })
        )}
      </div>

      {/* Pagination - At the bottom */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center space-y-4 pt-12 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-4">
            Showing {startIndex + 1}-{endIndex} of {products.length} products • Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                currentPage === 1 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {pageNumbers.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {totalPages > MAX_PAGE_BUTTONS && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                currentPage === totalPages
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}