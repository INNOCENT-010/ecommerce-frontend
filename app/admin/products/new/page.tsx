// app/admin/products/new/page.tsx - UPDATED
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Save, Upload, Image as ImageIcon, Package, Tag, DollarSign, 
  Hash, Grid, List, X, Plus, Minus, Search, Check, Globe, Folder 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MediaUpload from '@/app/admin/media/components/MediaUpload'
import ImageSelector from './components/ImageSelector'


const ALL_TAGS_BY_CATEGORY = {
  
  'Dresses': [
    
    'mini', 'maxi', 'midi', 'gowns',
    
    'red', 'black', 'white', 'gold', 'brown', 'pink', 'blue',
    
    'corset', 'long-sleeve', 'evening', 'embellished', 'bodycon', 'backless', 'daytime'
  ],
  
  // New In category - all tags under New In
  'new-in': [
    // From NEW IN grouping
    'new-in-all', 'this-month', 'classic',
    // From FEATURED grouping
    'bestsellers', 'back-in-stock', 'trending', 'rental', 'pre-order', 'loved',
    // From COLLECTIONS grouping
    'countdown', 'members', 'glint'
  ],
  
  // Occasion category - all tags under Occasion
  'occasion': [
    // From EDITS grouping
    'new-years', 'birthday', 'going-out', 'bridal', 'wedding', 'prom', 
    'graduation', 'essentials', 'sunny', 'rental',
    // From CAMPAIGNS grouping
    'after-party', 'rotation', 'gilded', 'femme-lunch', 'balleric', 'new-rotation'
  ],
  
  // Styles category - all tags under Styles
  'styles': [
    // From TOPS grouping
    'tops-corset', 'tops-going-out', 'tops-crop', 'tops-long-sleeve', 'tops-bodysuits', 'tops-embellished', 'tops-go-to',
    // From BOTTOMS grouping
    'bottoms-skirts', 'bottoms-trousers', 'bottoms-shorts', 'bottoms-denim',
    // From CLOTHING grouping
    'clothing-coords', 'clothing-jumpsuits', 'clothing-denim', 'clothing-lounge',
    // From FIT grouping
    'fit-petite', 'fit-tall', 'fit-fuller-bust', 'fit-bump-approved'
  ],
  
  // Swim category - all tags under Swim
  'swim': [
    // From SWIMWEAR grouping
    'swimwear-bikini-sets', 'swimwear-one-piece', 'swimwear-bikini-tops', 'swimwear-bikini-bottoms', 
    'swimwear-best-sellers', 'swimwear-limited-edition', 'swimwear-all',
    // From CLOTHING grouping
    'swim-dresses', 'swim-tops', 'swim-trousers', 'swim-skirts', 'swim-clothing-all',
    // From EDITS grouping
    'swim-bride', 'swim-summer', 'swim-pool-party', 'swim-island', 'swim-beach-bar'
  ],
  
  // Sale category - all tags under Sale
  'sale': [
    // From SHOP SALE grouping
    'sale-dresses', 'sale-tops', 'sale-trousers', 'sale-swimwear', 'sale-activewear', 'sale-last-chance',
    // From SHOP BY PRICE grouping
    'under-39k', 'under-25k', 'under-10k'
  ]
};

// GLOBAL TAGS - Available for ALL categories
const GLOBAL_TAGS = [
  // Marketing & Campaign tags
  'bestsellers', 'trending', 'rental', 'pre-order', 'loved',
  'countdown', 'members', 'glint', 'after-party', 'rotation',
  'gilded', 'femme-lunch', 'balleric', 'new-rotation',
  
  // Status tags
  'new-arrival', 'just-arrived', 'limited-edition', 'back-in-stock',
  
  // Seasonal tags
  'summer', 'winter', 'spring', 'fall', 'holiday',
  
  // Style/Theme tags
  'casual', 'formal', 'party', 'elegant', 'sexy', 'classic', 'modern',
  
  // Collection tags
  'collection-essentials', 'collection-luxury', 'collection-premium'
];

// Define tag types for categorization
interface TagItem {
  name: string;
  type: 'category' | 'global';
  category?: string;
}

export default function AddProductPage() {
  const router = useRouter()
  
  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    original_price: '',
    description: '',
    category: '',
    subcategory: '',
    stock: 0,
    sku: '',
    featured: false
  })
  
  // Variants
  const [sizes, setSizes] = useState<string[]>(['M', 'L', 'XL'])
  const [colors, setColors] = useState<string[]>(['Black', 'White'])
  const [tags, setTags] = useState<string[]>([])
  
  // Images
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [primaryImage, setPrimaryImage] = useState<string>('')
  
  // Categories
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  
  // Tag management - UPDATED
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [showImageSelector, setShowImageSelector] = useState(false)
  
  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])
  
  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')
    
    if (data) setCategories(data)
  }
  
  // Handle category change - UPDATED
  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId, subcategory: '' })
    
    // Load subcategories for this category
    const categorySubs = categories.filter(cat => cat.parent_id === categoryId)
    setSubcategories(categorySubs)
    
    // Find category to get its name
    const selectedCategory = categories.find(cat => cat.id === categoryId)
    
    if (selectedCategory) {
      const categoryName = selectedCategory.name.toLowerCase()
      
      // Get category-specific tags
      let categorySpecificTags: string[] = []
      
      if (categoryName.includes('dress')) {
        categorySpecificTags = ALL_TAGS_BY_CATEGORY.dresses
      } else if (categoryName.includes('new')) {
        categorySpecificTags = ALL_TAGS_BY_CATEGORY['new-in']
      } else if (categoryName.includes('occasion')) {
        categorySpecificTags = ALL_TAGS_BY_CATEGORY.occasion
      } else if (categoryName.includes('style')) {
        categorySpecificTags = ALL_TAGS_BY_CATEGORY.styles
      } else if (categoryName.includes('swim')) {
        categorySpecificTags = ALL_TAGS_BY_CATEGORY.swim
      } else if (categoryName.includes('sale')) {
        categorySpecificTags = ALL_TAGS_BY_CATEGORY.sale
      }
      
      // Combine category-specific and global tags
      const allTags: TagItem[] = [
        // Category-specific tags
        ...categorySpecificTags.map(tag => ({
          name: tag,
          type: 'category' as const,
          category: categoryName
        })),
        // Global tags
        ...GLOBAL_TAGS.map(tag => ({
          name: tag,
          type: 'global' as const
        }))
      ]
      
      // Remove duplicates
      const uniqueTags = allTags.filter((tag, index, self) =>
        index === self.findIndex(t => t.name === tag.name)
      )
      
      setAvailableTags(uniqueTags)
    }
  }
  
  // Tag filtering
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  )
  
  // Group tags by type
  const categoryTags = filteredTags.filter(tag => tag.type === 'category')
  const globalTags = filteredTags.filter(tag => tag.type === 'global')
  
  // Handle tag selection
  const toggleTag = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter(t => t !== tagName))
    } else {
      setTags([...tags, tagName])
    }
  }
  
  // Add custom tag
  const addCustomTag = () => {
    if (tagSearch.trim() && !tags.includes(tagSearch.trim().toLowerCase())) {
      setTags([...tags, tagSearch.trim().toLowerCase()])
      setTagSearch('')
      setShowTagDropdown(false)
    }
  }
  
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  
  // Handle images
  const handleImageSelect = (imageUrl: string) => {
    if (!selectedImages.includes(imageUrl)) {
      setSelectedImages([...selectedImages, imageUrl])
      if (!primaryImage) setPrimaryImage(imageUrl)
    }
  }
  
  const removeImage = (imageUrl: string) => {
    setSelectedImages(selectedImages.filter(img => img !== imageUrl))
    if (primaryImage === imageUrl) {
      setPrimaryImage(selectedImages.length > 1 ? selectedImages[1] : '')
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Generate slug if empty
      const productSlug = formData.slug || formData.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
      
      // Prepare product data
      const productData = {
        name: formData.name,
        slug: productSlug,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || null,
        tags: tags,
        sizes: sizes,
        colors: colors,
        stock: parseInt(formData.stock.toString()),
        sku: formData.sku || null,
        featured: formData.featured
      }
      
      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()
      
      if (productError) throw productError
      
      // Link images to product
      if (selectedImages.length > 0) {
        const imagePromises = selectedImages.map(async (imageUrl, index) => {
          // First, find the image record by URL
          const { data: imageRecord } = await supabase
            .from('product_images')
            .select('id')
            .eq('url', imageUrl)
            .single()
          
          if (imageRecord) {
            // Update the image record with product_id
            return supabase
              .from('product_images')
              .update({
                product_id: product.id,
                display_order: index,
                is_primary: imageUrl === primaryImage
              })
              .eq('id', imageRecord.id)
          }
        })
        
        await Promise.all(imagePromises)
      }
      
      alert('✅ Product created successfully!')
      router.push('/admin/products')
      
    } catch (error) {
      console.error('Error creating product:', error)
      alert('❌ Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Create a new product for your store</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., Summer Dress"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="summer-dress"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from name</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Category</option>
                {categories
                  .filter(cat => !cat.parent_id)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Describe your product..."
              />
            </div>
          </div>
        </div>
        
        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing & Inventory
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">For showing discounted price</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="PROD-001"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Mark as Featured Product
              </label>
            </div>
          </div>
        </div>
        
        {/* Variants with UPDATED Tags Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Grid className="w-5 h-5 mr-2" />
            Variants
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm">{size}</span>
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                      className="ml-2 text-gray-500 hover:text-red-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add size (e.g., XXL)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.currentTarget
                      if (input.value.trim() && !sizes.includes(input.value.trim())) {
                        setSizes([...sizes, input.value.trim()])
                        input.value = ''
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Add size"]') as HTMLInputElement
                    if (input?.value.trim() && !sizes.includes(input.value.trim())) {
                      setSizes([...sizes, input.value.trim()])
                      input.value = ''
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm">{color}</span>
                    <button
                      type="button"
                      onClick={() => setColors(colors.filter((_, i) => i !== index))}
                      className="ml-2 text-gray-500 hover:text-red-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add color (e.g., Navy Blue)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.currentTarget
                      if (input.value.trim() && !colors.includes(input.value.trim())) {
                        setColors([...colors, input.value.trim()])
                        input.value = ''
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Add color"]') as HTMLInputElement
                    if (input?.value.trim() && !colors.includes(input.value.trim())) {
                      setColors([...colors, input.value.trim()])
                      input.value = ''
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* UPDATED Tags Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Product Tags
              {formData.category && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (Category: {categories.find(c => c.id === formData.category)?.name})
                </span>
              )}
            </h3>
            
            {!formData.category ? (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Select a category first to see available tags</p>
              </div>
            ) : (
              <>
                {/* Selected Tags Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selected Tags ({tags.length})
                  </label>
                  {tags.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No tags selected yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => {
                        const tagInfo = availableTags.find(t => t.name === tag)
                        const isGlobal = tagInfo?.type === 'global'
                        return (
                          <div 
                            key={index} 
                            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              isGlobal 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {isGlobal ? (
                              <Globe className="w-3 h-3 mr-1.5 text-blue-500" />
                            ) : (
                              <Folder className="w-3 h-3 mr-1.5 text-purple-500" />
                            )}
                            <span className="capitalize">{tag.replace(/-/g, ' ')}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-gray-500 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* Tag Selection Dropdown */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Tags
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTagDropdown(!showTagDropdown)}
                        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <Search className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">Click to browse all available tags...</span>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Tag Dropdown Modal */}
                      {showTagDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowTagDropdown(false)}
                          />
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                              <div className="flex items-center">
                                <Search className="w-4 h-4 text-gray-400 mr-2" />
                                <input
                                  type="text"
                                  value={tagSearch}
                                  onChange={(e) => setTagSearch(e.target.value)}
                                  placeholder="Filter tags..."
                                  className="w-full py-1 focus:outline-none"
                                  autoFocus
                                />
                              </div>
                            </div>
                            
                            <div className="overflow-y-auto max-h-80">
                              {/* Category-Specific Tags */}
                              {categoryTags.length > 0 && (
                                <div className="p-4 border-b border-gray-100">
                                  <div className="flex items-center mb-3">
                                    <Folder className="w-4 h-4 text-purple-500 mr-2" />
                                    <h4 className="text-sm font-semibold text-gray-700">
                                      Category-Specific Tags ({categoryTags.length})
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {categoryTags.map((tag) => (
                                      <button
                                        key={tag.name}
                                        type="button"
                                        onClick={() => {
                                          toggleTag(tag.name)
                                          setTagSearch('')
                                        }}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                                          tags.includes(tag.name)
                                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        <div>
                                          <span className="font-medium capitalize">{tag.name.replace(/-/g, ' ')}</span>
                                          <div className="flex items-center mt-1">
                                            <Folder className="w-3 h-3 text-purple-400 mr-1" />
                                            <span className="text-xs text-gray-500">Category</span>
                                          </div>
                                        </div>
                                        {tags.includes(tag.name) && (
                                          <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Global Tags */}
                              {globalTags.length > 0 && (
                                <div className="p-4">
                                  <div className="flex items-center mb-3">
                                    <Globe className="w-4 h-4 text-blue-500 mr-2" />
                                    <h4 className="text-sm font-semibold text-gray-700">
                                      Global Tags ({globalTags.length})
                                    </h4>
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                      Available for all categories
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {globalTags.map((tag) => (
                                      <button
                                        key={tag.name}
                                        type="button"
                                        onClick={() => {
                                          toggleTag(tag.name)
                                          setTagSearch('')
                                        }}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                                          tags.includes(tag.name)
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        <div>
                                          <span className="font-medium capitalize">{tag.name.replace(/-/g, ' ')}</span>
                                          <div className="flex items-center mt-1">
                                            <Globe className="w-3 h-3 text-blue-400 mr-1" />
                                            <span className="text-xs text-gray-500">Global</span>
                                          </div>
                                        </div>
                                        {tags.includes(tag.name) && (
                                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Custom Tag Option */}
                              {tagSearch.trim() && 
                               !availableTags.some(t => t.name.toLowerCase() === tagSearch.toLowerCase().trim()) && (
                                <div className="p-4 border-t border-gray-100 bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-gray-700">Create custom tag:</p>
                                      <p className="text-sm text-gray-600 mt-1">"{tagSearch}"</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (tagSearch.trim()) {
                                          setTags([...tags, tagSearch.trim().toLowerCase()])
                                          setTagSearch('')
                                          setShowTagDropdown(false)
                                        }
                                      }}
                                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Select all category tags
                        const categoryTagNames = categoryTags.map(t => t.name)
                        const newTags = [...new Set([...tags, ...categoryTagNames])]
                        setTags(newTags)
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      Select All Category Tags
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Select popular global tags
                        const popularGlobals = ['bestsellers', 'new-arrival', 'trending', 'limited-edition']
                        const newTags = [...new Set([...tags, ...popularGlobals])]
                        setTags(newTags)
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    >
                      Add Popular Global Tags
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Product Images
            </h2>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowImageSelector(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <List className="w-4 h-4 mr-2" />
                Select from Library
              </button>
              
              <button
                type="button"
                onClick={() => setShowMediaUpload(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </button>
            </div>
          </div>
          
          {selectedImages.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No images selected</p>
              <p className="text-sm text-gray-500 mt-1">Add images from your library or upload new ones</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                {primaryImage && ' • Click star to set as primary'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {selectedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(imageUrl)}
                          className={`p-2 rounded-full ${primaryImage === imageUrl ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700'}`}
                          title={primaryImage === imageUrl ? 'Primary image' : 'Set as primary'}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeImage(imageUrl)}
                          className="p-2 bg-white text-red-600 rounded-full"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {primaryImage === imageUrl && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Modals */}
      {showMediaUpload && (
        <MediaUpload
          isOpen={showMediaUpload}
          onClose={() => setShowMediaUpload(false)}
          onUploadComplete={() => {
            setShowMediaUpload(false)
          }}
        />
      )}
      
      {showImageSelector && (
        <ImageSelector
          isOpen={showImageSelector}
          onClose={() => setShowImageSelector(false)}
          onSelectImage={handleImageSelect}
          selectedImages={selectedImages}
        />
      )}
    </div>
  )
}