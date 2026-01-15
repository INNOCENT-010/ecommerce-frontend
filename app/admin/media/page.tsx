// app/admin/media/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Upload, Search, Grid, List, Trash2, Image as ImageIcon, Filter, Home, Monitor } from 'lucide-react'
import MediaGrid from './components/MediaGrid'
import MediaUpload from './components/MediaUpload'
import HomepageMediaManager from './components/HomepageMediaManager'
import { fetchProductImages, searchProductImages } from '@/lib/supabase'
import { ProductImage } from '@/app/types/media'

export default function MediaPage() {
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'homepage'>('products')

  useEffect(() => {
    if (activeTab === 'products') {
      loadProductImages()
    }
  }, [activeTab])

  const loadProductImages = async () => {
    setLoading(true)
    const data = await fetchProductImages()
    setImages(data)
    setLoading(false)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      loadProductImages()
      return
    }
    
    setLoading(true)
    const results = await searchProductImages(searchTerm)
    setImages(results)
    setLoading(false)
  }

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return
    
    if (confirm(`Delete ${selectedImages.size} selected images?`)) {
      // Implement bulk delete
      setSelectedImages(new Set())
      await loadProductImages()
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage all website media files</p>
        </div>
        
        {activeTab === 'products' && selectedImages.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedImages.size})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Product Media
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('homepage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'homepage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Homepage Media
            </div>
          </button>
        </nav>
      </div>

      {/* Products Media Tab */}
      {activeTab === 'products' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search product images..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </form>
                
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Product Images
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>All Products</option>
                    <option>Primary Images</option>
                    <option>Gallery Images</option>
                  </select>
                </div>
                
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Media Content */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading product media...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="p-12 text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No product images found</h3>
                <p className="text-gray-600 mb-4">Upload your first product image to get started</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Product Images
                </button>
              </div>
            ) : (
              <MediaGrid
                images={images}
                viewMode={viewMode}
                selectedImages={selectedImages}
                onSelectImage={(id) => {
                  const newSelected = new Set(selectedImages)
                  if (newSelected.has(id)) {
                    newSelected.delete(id)
                  } else {
                    newSelected.add(id)
                  }
                  setSelectedImages(newSelected)
                }}
                onImageUpdated={loadProductImages}
              />
            )}
          </div>

          {/* Product Upload Modal */}
          {showUpload && (
            <MediaUpload
              isOpen={showUpload}
              onClose={() => setShowUpload(false)}
              onUploadComplete={loadProductImages}
              type="product"
            />
          )}
        </>
      )}

      {/* Homepage Media Tab */}
      {activeTab === 'homepage' && (
        <HomepageMediaManager />
      )}
    </div>
  )
}