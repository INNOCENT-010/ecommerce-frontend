// app/components/search/SearchBar.tsx
'use client';

import { Search, X, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import debounce from 'lodash/debounce';

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  tags: string[];
  colors: string[];
  description: string | null;
  images: { url: string; alt_text: string | null }[];
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
}

// Enhanced natural language keywords mapping
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  // Occasion keywords
  'birthday': ['birthday', 'celebration', 'party', 'special day', 'festive', 'anniversary'],
  'wedding': ['wedding', 'bridal', 'bridesmaid', 'ceremony', 'matrimony', 'nuptials'],
  'graduation': ['graduation', 'commencement', 'convocation'],
  'prom': ['prom', 'formal', 'dance', 'homecoming'],
  'new years': ['new year', 'new years', 'eve', 'countdown'],
  'date night': ['date', 'romantic', 'dinner', 'evening out', 'night out'],
  'vacation': ['vacation', 'holiday', 'trip', 'getaway', 'resort', 'beach', 'travel'],
  'work': ['work', 'office', 'professional', 'business', 'corporate'],
  'cocktail': ['cocktail', 'drinks', 'bar', 'evening'],
  'brunch': ['brunch', 'lunch', 'daytime', 'day out'],
  
  // Style keywords
  'gown': ['gown', 'dress', 'evening dress', 'formal dress', 'frock'],
  'corset': ['corset', 'corset top', 'waist trainer', 'boned'],
  'backless': ['backless', 'open back', 'low back', 'cutout'],
  'bodycon': ['bodycon', 'fitted', 'tight', 'form-fitting', 'figure-hugging'],
  'maxi': ['maxi', 'long dress', 'floor length', 'ankle length'],
  'mini': ['mini', 'short dress', 'above knee', 'thigh length'],
  'midi': ['midi', 'knee length', 'tea length', 'below knee'],
  'wrap': ['wrap', 'wrap dress', 'tie waist'],
  'halter': ['halter', 'halterneck', 'neck tie'],
  'off shoulder': ['off shoulder', 'bardot', 'cold shoulder'],
  'high neck': ['high neck', 'turtle neck', 'mock neck'],
  
  // Color keywords - expanded
  'red': ['red', 'scarlet', 'crimson', 'ruby', 'burgundy', 'maroon', 'cherry', 'wine', 'berry'],
  'black': ['black', 'ebony', 'onyx', 'jet black', 'charcoal', 'raven'],
  'white': ['white', 'ivory', 'cream', 'off-white', 'eggshell', 'pearl', 'snow'],
  'gold': ['gold', 'golden', 'gilded', 'metallic', 'champagne', 'bronze'],
  'pink': ['pink', 'rose', 'blush', 'fuchsia', 'magenta', 'hot pink', 'baby pink', 'coral pink'],
  'blue': ['blue', 'navy', 'sapphire', 'azure', 'cobalt', 'sky blue', 'royal blue', 'teal', 'turquoise'],
  'green': ['green', 'emerald', 'forest', 'olive', 'mint', 'sage', 'lime', 'jade'],
  'yellow': ['yellow', 'goldenrod', 'mustard', 'lemon', 'sunflower', 'canary', 'amber'],
  'purple': ['purple', 'violet', 'lavender', 'lilac', 'plum', 'mauve', 'orchid'],
  'orange': ['orange', 'tangerine', 'coral', 'peach', 'amber', 'apricot', 'rust'],
  'brown': ['brown', 'chocolate', 'caramel', 'tan', 'beige', 'taupe', 'camel', 'khaki'],
  'gray': ['gray', 'grey', 'silver', 'ash', 'smoke', 'slate', 'graphite'],
  'multicolor': ['multicolor', 'colorful', 'patterned', 'print', 'floral', 'striped', 'polka dot'],
  
  // General clothing terms
  'dress': ['dress', 'gown', 'frock', 'garment', 'outfit', 'attire'],
  'top': ['top', 'blouse', 'shirt', 'tank', 'cami', 'tee', 't-shirt'],
  'skirt': ['skirt', 'skort', 'mini skirt', 'pencil skirt', 'a-line skirt'],
  'trousers': ['trousers', 'pants', 'slacks', 'jeans', 'leggings', 'tights'],
  'swimwear': ['swimwear', 'bikini', 'swimsuit', 'one piece', 'beachwear', 'swim'],
  'jumpsuit': ['jumpsuit', 'playsuit', 'romper', 'overall'],
  'coat': ['coat', 'jacket', 'blazer', 'cardigan', 'sweater'],
  
  // Descriptive terms
  'sexy': ['sexy', 'hot', 'alluring', 'seductive', 'provocative', 'sensual'],
  'elegant': ['elegant', 'classy', 'sophisticated', 'refined', 'chic', 'stylish'],
  'casual': ['casual', 'everyday', 'relaxed', 'informal', 'comfortable', 'laid-back'],
  'formal': ['formal', 'black tie', 'cocktail', 'evening', 'gala', 'ball'],
  'comfortable': ['comfortable', 'comfy', 'easy', 'relaxed', 'soft', 'stretchy'],
  'trendy': ['trendy', 'fashionable', 'in style', 'modern', 'current'],
  'vintage': ['vintage', 'retro', 'classic', 'old school', 'throwback'],
  'luxury': ['luxury', 'premium', 'high-end', 'designer', 'expensive'],
  'affordable': ['affordable', 'cheap', 'budget', 'inexpensive', 'value'],
};

// Expand color search to handle synonyms
const expandColorSearch = (keywords: string[]): string[] => {
  const expanded = new Set<string>();
  
  keywords.forEach(keyword => {
    expanded.add(keyword);
    
    // Check if keyword is a color or has color synonyms
    Object.entries(KEYWORD_MAPPINGS).forEach(([base, synonyms]) => {
      if (synonyms.some(syn => 
        keyword.toLowerCase().includes(syn) || 
        syn.includes(keyword.toLowerCase())
      )) {
        // Add all synonyms
        synonyms.forEach(syn => expanded.add(syn));
        expanded.add(base);
      }
    });
  });
  
  return Array.from(expanded);
};

// Common search patterns
const SEARCH_PATTERNS = [
  { pattern: /(?:dress|gown|outfit|attire)\s+(?:for|to)\s+(.+)/i, extract: (match: string) => match },
  { pattern: /(?:what|which)\s+(?:dress|outfit|attire)\s+(?:for|to)\s+(.+)/i, extract: (match: string) => match },
  { pattern: /(?:i need|looking for|want|searching for)\s+(?:a|an)?\s*(.+)/i, extract: (match: string) => match },
  { pattern: /(.+)\s+(?:dress|outfit|attire|gown)/i, extract: (match: string) => match },
  { pattern: /(?:show me|find me|recommend)\s+(.+)/i, extract: (match: string) => match },
];

// Extract keywords from natural language query
const extractKeywords = (query: string): string[] => {
  const keywords: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Check for pattern matches first
  for (const { pattern, extract } of SEARCH_PATTERNS) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const extracted = extract(match[1]);
      keywords.push(extracted.trim());
    }
  }
  
  // Extract individual words and phrases
  const words = lowerQuery.split(/[\s,]+/);
  
  // Add individual words
  keywords.push(...words.filter(word => word.length > 2));
  
  // Add multi-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    keywords.push(phrase);
  }
  
  // Add tri-grams for longer queries
  if (words.length >= 3) {
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      keywords.push(phrase);
    }
  }
  
  // Map synonyms and related terms
  const mappedKeywords = new Set<string>();
  keywords.forEach(keyword => {
    // Add the original keyword
    mappedKeywords.add(keyword);
    
    // Add mapped synonyms
    for (const [base, synonyms] of Object.entries(KEYWORD_MAPPINGS)) {
      if (synonyms.some(syn => keyword.includes(syn) || syn.includes(keyword))) {
        mappedKeywords.add(base);
      }
    }
  });
  
  return Array.from(mappedKeywords).filter(k => k.length > 2);
};

// Generate search queries from keywords
const generateSearchQueries = (keywords: string[]): string[] => {
  const queries: string[] = [];
  const expandedKeywords = expandColorSearch(keywords);
  
  // Direct keyword matches
  expandedKeywords.forEach(keyword => {
    queries.push(keyword);
    
    // Add partial matches for longer keywords
    if (keyword.length > 3) {
      const parts = keyword.split(' ');
      parts.forEach(part => {
        if (part.length > 2) {
          queries.push(part);
        }
      });
    }
  });
  
  return [...new Set(queries)];
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch categories and popular searches on mount
  useEffect(() => {
    fetchCategories();
    fetchPopularSearches();
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length >= 2) {
        await performSearch(searchQuery);
      }
    }, 300),
    [selectedCategory]
  );

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('display_order');

      if (!error && data) {
        setCategories(data as SearchCategory[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      // You can store popular searches in your database or use a static list
      const popular = [
        'birthday dress',
        'wedding guest dress',
        'prom gown',
        'black cocktail dress',
        'red evening gown',
        'backless dress',
        'bodycon dress',
        'maxi dress',
        'swimwear',
        'vacation outfits',
        'date night dress',
        'work dress',
        'cocktail dress',
        'mini dress',
        'wrap dress',
      ];
      setPopularSearches(popular);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Extract keywords from natural language query
      const keywords = extractKeywords(searchQuery);
      setExtractedKeywords(keywords);
      // Generate search queries from keywords
      const searchQueries = generateSearchQueries(keywords);
      // Build the search query
      let queryBuilder = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          category,
          tags,
          colors,
          description,
          images:product_images(url, alt_text)
        `)
        .limit(30); // Increased limit for better filtering

      // FIXED: Use smarter search logic that searches across all fields
      if (searchQueries.length > 0) {
        // Create an array of search conditions
        const searchConditions: string[] = [];
        
        // For each keyword, search across multiple fields
        searchQueries.forEach(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          
          // Search in name (partial match)
          searchConditions.push(`name.ilike.%${lowerKeyword}%`);
          
          // Search in tags (exact match in array)
          searchConditions.push(`tags.cs.{${lowerKeyword}}`);
          
          // Search in colors (exact match in array)
          searchConditions.push(`colors.cs.{${lowerKeyword}}`);
          
          // Search in description
          searchConditions.push(`description.ilike.%${lowerKeyword}%`);
          
          // Search in category
          searchConditions.push(`category.ilike.%${lowerKeyword}%`);
        });
        
        // Combine all conditions with OR
        queryBuilder = queryBuilder.or(searchConditions.join(','));
      }

      // Filter by category if not "all"
      if (selectedCategory !== 'all') {
        queryBuilder = queryBuilder.eq('category', selectedCategory);
      }

      const { data, error } = await queryBuilder;

      if (!error && data) {
        const products = data as SearchProduct[];
        
        // IMPROVED: Score and rank results with field-specific scoring
        const scoredProducts = products.map(product => {
          let score = 0;
          const lowerName = product.name.toLowerCase();
          const lowerDescription = product.description?.toLowerCase() || '';
          const lowerTags = product.tags?.map(t => t.toLowerCase()) || [];
          const lowerColors = product.colors?.map(c => c.toLowerCase()) || [];
          
          // Score based on keyword matches across different fields
          keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            
            // Exact name match gets highest score
            if (lowerName === lowerKeyword) {
              score += 20; // Exact match
            } else if (lowerName.includes(lowerKeyword)) {
              score += 10; // Partial name match
            }
            
            // Tag match - check if any tag contains the keyword
            const tagMatches = lowerTags.filter(tag => 
              tag === lowerKeyword || tag.includes(lowerKeyword) || lowerKeyword.includes(tag)
            ).length;
            score += tagMatches * 8;
            
            // Color match - check if any color matches the keyword
            const colorMatches = lowerColors.filter(color => 
              color === lowerKeyword || color.includes(lowerKeyword) || lowerKeyword.includes(color)
            ).length;
            score += colorMatches * 8;
            
            // Description match
            if (lowerDescription.includes(lowerKeyword)) {
              score += 3;
            }
            
            // Category match
            if (product.category?.toLowerCase().includes(lowerKeyword)) {
              score += 5;
            }
          });

          // Boost score for exact phrase match
          const lowerQuery = searchQuery.toLowerCase();
          if (lowerName.includes(lowerQuery)) {
            score += 15; // Exact phrase in name
          }
          
          // Boost if product contains ALL search keywords across different fields
          const hasAllKeywords = keywords.every(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            return lowerName.includes(lowerKeyword) ||
                   lowerTags.some(tag => tag.includes(lowerKeyword)) ||
                   lowerColors.some(color => color.includes(lowerKeyword)) ||
                   lowerDescription.includes(lowerKeyword);
          });
          
          if (hasAllKeywords) {
            score += 25; // Significant boost for matching all keywords
          }

          // Boost score for featured or popular products
          if (product.tags?.includes('featured')) {
            score += 10;
          }
          if (product.tags?.includes('bestseller')) {
            score += 8;
          }
          if (product.tags?.includes('new')) {
            score += 5;
          }

          return { ...product, _score: score };
        });

        // Filter out very low scoring results and remove duplicates
        const uniqueProducts = scoredProducts
          .filter(product => product._score > 0) // Only include products with some match
          .filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
          )
          .sort((a, b) => (b._score || 0) - (a._score || 0))
          .slice(0, 15); // Limit to top 15 results

        

        setSearchResults(uniqueProducts);

        // Generate suggestions based on search results
        generateSuggestions(uniqueProducts, keywords);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (products: SearchProduct[], keywords: string[]) => {
    const suggestions = new Set<string>();
    
    // Add product categories from results
    products.forEach(product => {
      if (product.tags && product.tags.length > 0) {
        product.tags.slice(0, 3).forEach(tag => {
          if (!keywords.some(k => k.toLowerCase() === tag.toLowerCase())) {
            suggestions.add(tag.charAt(0).toUpperCase() + tag.slice(1));
          }
        });
      }
      
      // Add colors from results
      if (product.colors && product.colors.length > 0) {
        product.colors.slice(0, 2).forEach(color => {
          if (!keywords.some(k => k.toLowerCase() === color.toLowerCase())) {
            suggestions.add(color.charAt(0).toUpperCase() + color.slice(1));
          }
        });
      }
    });

    // Add related terms based on keywords
    keywords.forEach(keyword => {
      Object.entries(KEYWORD_MAPPINGS).forEach(([base, synonyms]) => {
        if (synonyms.some(syn => keyword.includes(syn) || syn.includes(keyword))) {
          // Find related terms that aren't in the original query
          synonyms.forEach(syn => {
            if (!keywords.some(k => k.toLowerCase().includes(syn))) {
              suggestions.add(syn.charAt(0).toUpperCase() + syn.slice(1));
            }
          });
        }
      });
    });

    setSearchSuggestions(Array.from(suggestions).slice(0, 8));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      debouncedSearch(value);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setSearchSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', query);
      if (selectedCategory !== 'all') {
        searchParams.set('category', selectedCategory);
      }
      router.push(`/search?${searchParams.toString()}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
    setIsOpen(false);
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handlePopularSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    performSearch(searchTerm);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Category Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-r-0 rounded-l-full border-gray-300 bg-white hover:bg-gray-50"
          >
            <span className="whitespace-nowrap">
              {selectedCategory === 'all' 
                ? 'All Categories' 
                : categories.find(c => c.slug === selectedCategory)?.name || 'Select Category'
              }
            </span>
            <ChevronDown size={16} />
          </button>
          
          {showCategories && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setShowCategories(false);
                  if (query.length >= 2) debouncedSearch(query);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedCategory === 'all' ? 'bg-gray-50 font-medium' : ''}`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.slug);
                    setShowCategories(false);
                    if (query.length >= 2) debouncedSearch(query);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedCategory === category.slug ? 'bg-gray-50 font-medium' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search for dresses, tops, or describe your occasion..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-r-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          />
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={18} 
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || searchResults.length > 0 || searchSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header with AI indicator */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {isLoading ? 'Thinking...' : `Results for "${query}"`}
                </h3>
                {!isLoading && extractedKeywords.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <Sparkles size={10} />
                    <span>AI Enhanced</span>
                  </div>
                )}
              </div>
              
              {selectedCategory !== 'all' && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {categories.find(c => c.slug === selectedCategory)?.name}
                </span>
              )}
            </div>
            
            {/* Extracted Keywords */}
            {extractedKeywords.length > 0 && !isLoading && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-gray-500">Searching for:</span>
                {extractedKeywords.slice(0, 4).map((keyword, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {keyword}
                  </span>
                ))}
                {extractedKeywords.length > 4 && (
                  <span className="text-xs text-gray-500">+{extractedKeywords.length - 4} more</span>
                )}
              </div>
            )}
          </div>

          {/* Suggestions Section */}
          {!isLoading && searchSuggestions.length > 0 && (
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Try these related searches:</h4>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                  <p className="text-sm text-gray-600">Understanding your search...</p>
                </div>
                <div className="mt-4 text-xs text-gray-500 max-w-sm mx-auto">
                  Looking for "{query}" across names, descriptions, tags, and colors...
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="w-full text-left p-4 hover:bg-gray-50 flex items-center gap-4 group"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-black">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-gray-900">
                          ₦{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {product.category?.replace('-', ' ') || 'Uncategorized'}
                        </span>
                      </div>
                      
                      {/* Tags & Colors */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          product.tags.slice(0, 2).map((tag, idx) => (
                            <span key={`tag-${idx}`} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))
                        )}
                        
                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                          product.colors.slice(0, 2).map((color, idx) => (
                            <span key={`color-${idx}`} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {color}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <ChevronDown 
                      size={16} 
                      className="text-gray-400 transform rotate-270 flex-shrink-0" 
                    />
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center">
                <div className="max-w-sm mx-auto">
                  <p className="text-gray-600 mb-4">No products found for "{query}"</p>
                  
                  {/* Popular Searches */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Try these popular searches:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {popularSearches.slice(0, 6).map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handlePopularSearchClick(term)}
                          className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                    
                    {/* Natural Language Tips */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium mb-1">💡 Search Tips</p>
                      <p className="text-xs text-blue-600">
                        Try natural language like: "gown for my birthday" or "red dress for wedding"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Initial State - Show Popular Searches */
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularSearchClick(term)}
                      className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleSubmit}
                className="w-full py-2 text-center text-sm font-medium text-black hover:text-gray-800 flex items-center justify-center gap-2"
              >
                <span>View all {searchResults.length} results</span>
                <ChevronDown size={16} className="transform rotate-270" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}