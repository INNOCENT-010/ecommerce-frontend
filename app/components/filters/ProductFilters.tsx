// app/components/filters/ProductFilters.tsx - FIXED VERSION
'use client';

import { Filter, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import debounce from 'lodash/debounce';

interface FilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'range';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

interface FilterValues {
  [key: string]: string[] | string;
}

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<FilterValues>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({});
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  
  // Filter groups
  const filterGroups: FilterGroup[] = [
    {
      id: 'category',
      name: 'Categories',
      type: 'checkbox',
      options: ['Dresses', 'Tops', 'Sets', 'Sale', 'New Arrivals']
    },
    {
      id: 'size',
      name: 'Sizes',
      type: 'checkbox',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'color',
      name: 'Colors',
      type: 'checkbox',
      options: ['Black', 'White', 'Red', 'Blue', 'Pink', 'Green', 'Yellow']
    },
    {
      id: 'price',
      name: 'Price Range',
      type: 'range',
      min: 0,
      max: 500000,
      step: 10000
    },
    {
      id: 'length',
      name: 'Length',
      type: 'checkbox',
      options: ['Mini', 'Midi', 'Maxi', 'Gown']
    }
  ];

  // Initialize from URL
  useEffect(() => {
    const params: FilterValues = {};
    
    filterGroups.forEach(group => {
      if (group.type === 'checkbox') {
        const values = searchParams.getAll(group.id);
        if (values.length > 0) {
          params[group.id] = values;
        }
      } else if (searchParams.has(group.id)) {
        const value = searchParams.get(group.id);
        if (group.id === 'price' && value?.includes('-')) {
          params[group.id] = value;
        } else if (value) {
          params[group.id] = value;
        }
      }
    });

    setAppliedFilters(params);
    setPendingFilters(params); // Start with same as applied
  }, [searchParams]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleFilterChange = (groupId: string, value: any) => {
    setPendingFilters(prev => {
      const newFilters = { ...prev };
      const group = filterGroups.find(g => g.id === groupId);
      
      if (group?.type === 'checkbox') {
        const currentValues = Array.isArray(prev[groupId]) ? prev[groupId] : [];
        
        newFilters[groupId] = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
          
        // Remove empty arrays
        if (Array.isArray(newFilters[groupId]) && newFilters[groupId].length === 0) {
          delete newFilters[groupId];
        }
      } else {
        // Range or other single value filters
        newFilters[groupId] = value;
        // Remove if it's the default value
        if (value === `${group?.min}-${group?.max}` || !value) {
          delete newFilters[groupId];
        }
      }
      
      return newFilters;
    });
  };

  // Debounced apply function for desktop auto-apply
  const debouncedApply = useCallback(
    debounce((filters: FilterValues) => {
      applyFilters(filters);
    }, 800), // 800ms delay for auto-apply on desktop
    []
  );

  // Auto-apply on desktop when filters change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      const hasChanges = JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
      if (hasChanges && !isApplying) {
        debouncedApply(pendingFilters);
      }
    }
  }, [pendingFilters, appliedFilters, debouncedApply, isApplying]);

  const applyFilters = (filters = pendingFilters) => {
    setIsApplying(true);
    
    // Create URLSearchParams
    const params = new URLSearchParams();
    
    // Add all pending filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.delete(key);
        value.forEach(v => params.append(key, v));
      } else if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Preserve any existing non-filter params
    searchParams.forEach((value, key) => {
      if (!filterGroups.some(g => g.id === key) && key !== 'page') {
        params.set(key, value);
      }
    });
    
    // Update URL
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(url, { scroll: false });
    setAppliedFilters(filters);
    
    // Close mobile sidebar
    setIsOpen(false);
    
    // Reset applying state
    setTimeout(() => setIsApplying(false), 300);
  };

  const clearFilters = () => {
    setPendingFilters({});
    setAppliedFilters({});
    router.replace(pathname, { scroll: false });
    setIsOpen(false);
  };

  const getSelectedCount = (filters: FilterValues) => {
    return Object.values(filters).reduce((total, value) => {
      if (Array.isArray(value)) return total + value.length;
      return total + (value ? 1 : 0);
    }, 0);
  };

  const hasPendingChanges = JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
  const pendingCount = getSelectedCount(pendingFilters);
  const appliedCount = getSelectedCount(appliedFilters);

  return (
    <div className="relative">
      {/* Filter Button (Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={18} />
        Filters
        {appliedCount > 0 && (
          <span className="bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {appliedCount}
          </span>
        )}
      </button>

      {/* Filter Sidebar */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'}
        md:block fixed md:relative top-0 left-0 md:top-auto md:left-auto
        w-full md:w-64 h-screen md:h-auto bg-white md:bg-transparent
        z-50 md:z-auto p-6 md:p-0 overflow-y-auto md:overflow-visible
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Status Indicators */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Selected: {appliedCount}
              </span>
              {appliedCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all
                </button>
              )}
            </div>
            
            {/* Pending Changes Indicator */}
            {hasPendingChanges && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {pendingCount - appliedCount} change{pendingCount - appliedCount !== 1 ? 's' : ''} pending
                </span>
                <span className="text-xs text-blue-600">
                  {typeof window !== 'undefined' && window.innerWidth >= 768 
                    ? 'Auto-applies in 1s' 
                    : 'Tap Apply'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Groups */}
        <div className="space-y-6">
          {filterGroups.map((group) => (
            <div key={group.id} className="border-b border-gray-100 pb-4 last:border-0">
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full text-left mb-3 hover:text-gray-900"
              >
                <span className="font-medium text-gray-900">{group.name}</span>
                {expandedGroups.includes(group.id) ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedGroups.includes(group.id) && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {group.type === 'checkbox' && group.options && (
                    <div className="space-y-2">
                      {group.options.map((option) => {
                        const isSelected = Array.isArray(pendingFilters[group.id]) 
                          ? pendingFilters[group.id].includes(option)
                          : false;
                        const isApplied = Array.isArray(appliedFilters[group.id]) 
                          ? appliedFilters[group.id].includes(option)
                          : false;
                        
                        return (
                          <label
                            key={option}
                            className={`flex items-center cursor-pointer group hover:bg-gray-50 p-1 rounded ${
                              isSelected !== isApplied ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleFilterChange(group.id, option)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border rounded flex items-center justify-center mr-3 transition-colors ${
                              isSelected
                                ? 'bg-pink-600 border-pink-600'
                                : 'border-gray-300 group-hover:border-pink-400'
                            } ${isSelected !== isApplied ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                            } ${isSelected !== isApplied ? 'text-yellow-800' : ''}`}>
                              {option}
                              {isSelected !== isApplied && (
                                <span className="ml-1 text-xs text-yellow-600">
                                  ({isApplied ? 'removing' : 'adding'})
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  
                  {group.type === 'range' && group.id === 'price' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          ₦{pendingFilters.price?.split('-')[0] || group.min}
                        </span>
                        <span className="text-sm text-gray-600">
                          ₦{pendingFilters.price?.split('-')[1] || group.max}
                        </span>
                      </div>
                      <div className="relative pt-2">
                        <input
                          type="range"
                          min={group.min}
                          max={group.max}
                          step={group.step}
                          value={pendingFilters.price?.split('-')[1] || group.max}
                          onChange={(e) => handleFilterChange(group.id, `${group.min}-${e.target.value}`)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-600"
                        />
                        {pendingFilters.price !== appliedFilters.price && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Changed
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Apply Button (Mobile & when there are pending changes on desktop) */}
        {hasPendingChanges && (
          <div className="mt-6 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {pendingCount - appliedCount} change{pendingCount - appliedCount !== 1 ? 's' : ''} ready to apply
                </span>
                <button
                  onClick={() => {
                    setPendingFilters(appliedFilters);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Reset changes
                </button>
              </div>
              
              <button
                onClick={() => applyFilters()}
                disabled={isApplying}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                  isApplying
                    ? 'bg-pink-400 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg'
                }`}
              >
                {isApplying ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Applying...
                  </span>
                ) : (
                  `Apply ${pendingCount - appliedCount} Change${pendingCount - appliedCount !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}