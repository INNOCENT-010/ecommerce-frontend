// app/admin/products/add/components/ImageSelector.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage: (imageUrl: string) => void
  selectedImages: string[]
}

export default function ImageSelector({ isOpen, onClose, onSelectImage, selectedImages }: ImageSelectorProps) {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unlinked'>('all')

  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen, filter])

  const loadImages = async () => {
    setLoading(true)
    
    let query = supabase
      .from('product_images')
      .select(`
        *,
        products:product_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (filter === 'unlinked') {
      query = query.is('product_id', null)
    }

    if (searchTerm) {
      query = query.or(`alt_text.ilike.%${searchTerm}%,products.name.ilike.%${searchTerm}%`)
    }

    const { data } = await query
    
    setImages(data || [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadImages()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Select Images</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters and Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unlinked')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Images</option>
                  <option value="unlinked">Unlinked Images</option>
                </select>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Images Grid */}
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No images found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 max-h-[60vh] overflow-y-auto">
                {images.map((image) => {
                  const isSelected = selectedImages.includes(image.url)
                  
                  return (
                    <div
                      key={image.id}
                      className={`relative border rounded-lg overflow-hidden cursor-pointer group ${
                        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => onSelectImage(image.url)}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.alt_text || ''}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white text-xs">
                        <div className="truncate">
                          {image.products?.name || 'Unlinked'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black"
            >
              Done Selecting
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
