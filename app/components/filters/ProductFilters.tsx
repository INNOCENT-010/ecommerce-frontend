'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  categories?: string[];
  colors?: string[];
  sizes?: string[];
  priceRanges?: { min: number; max: number }[];
  onFilterChange?: (filters: Record<string, string[]>) => void;
  initialFilters?: Record<string, string[]>;
}

interface Filters {
  [key: string]: string[];
}

export default function ProductFilters({
  categories = [],
  colors = [],
  sizes = [],
  priceRanges = [],
  onFilterChange,
  initialFilters = {}
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleFilterChange = (groupId: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = newFilters[groupId];

      // Handle both string and array cases
      if (currentValues) {
        const valuesArray = Array.isArray(currentValues) ? currentValues : [currentValues];
        
        newFilters[groupId] = valuesArray.includes(value)
          ? valuesArray.filter(v => v !== value)
          : [...valuesArray, value];

        // Remove empty arrays
        if (Array.isArray(newFilters[groupId]) && newFilters[groupId].length === 0) {
          delete newFilters[groupId];
        }
      } else {
        // If no current value, start with array containing the value
        newFilters[groupId] = [value];
      }

      return newFilters;
    });
  };

  const clearFilter = (groupId: string, value?: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value && newFilters[groupId]) {
        // Cast to string[] to fix TypeScript error - we know it's always string[]
        const values = newFilters[groupId] as string[];
        const filtered = values.filter(v => v !== value);
        
        if (filtered.length > 0) {
          newFilters[groupId] = filtered;
        } else {
          delete newFilters[groupId];
        }
      } else {
        delete newFilters[groupId];
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, values) => {
      const valuesArray = Array.isArray(values) ? values : [values];
      return count + valuesArray.length;
    }, 0);
  };

  // Filter group components
  const renderCategoryFilters = () => {
    if (!categories.length) return null;

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => {
            const isActive = filters.category?.includes(category) || false;
            return (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>{category}</span>
                {isActive && <X size={14} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderColorFilters = () => {
    if (!colors.length) return null;

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => {
            const isActive = filters.color?.includes(color) || false;
            return (
              <button
                key={color}
                onClick={() => handleFilterChange('color', color)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
                  isActive 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 hover:border-black text-gray-700'
                }`}
                title={color}
              >
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                <span className="text-sm">{color}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSizeFilters = () => {
    if (!sizes.length) return null;

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => {
            const isActive = filters.size?.includes(size) || false;
            return (
              <button
                key={size}
                onClick={() => handleFilterChange('size', size)}
                className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
                  isActive 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 hover:border-black text-gray-700'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPriceFilters = () => {
    if (!priceRanges.length) return null;

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => {
            const value = `${range.min}-${range.max}`;
            const isActive = filters.price?.includes(value) || false;
            return (
              <button
                key={index}
                onClick={() => handleFilterChange('price', value)}
                className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>₦{range.min.toLocaleString()} - ₦{range.max.toLocaleString()}</span>
                {isActive && <X size={14} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActiveFilters = () => {
    const activeFilters = Object.entries(filters).flatMap(([key, values]) => {
      const valuesArray = Array.isArray(values) ? values : [values];
      return valuesArray.map(value => ({ key, value }));
    });

    if (activeFilters.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Active Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-black"
          >
            Clear all
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div
              key={`${filter.key}-${filter.value}-${index}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
            >
              <span className="text-gray-700">
                {filter.key}: {filter.value}
              </span>
              <button
                onClick={() => clearFilter(filter.key, filter.value)}
                className="text-gray-500 hover:text-black ml-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-black transition-colors"
        >
          <Filter size={18} />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-black text-white text-xs rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            {renderActiveFilters()}
            {renderCategoryFilters()}
            {renderColorFilters()}
            {renderSizeFilters()}
            {renderPriceFilters()}
            
            <div className="mt-8">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden lg:block w-64">
        {renderActiveFilters()}
        {renderCategoryFilters()}
        {renderColorFilters()}
        {renderSizeFilters()}
        {renderPriceFilters()}
        
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="w-full mt-6 text-center text-gray-600 hover:text-black underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </>
  );
}