// app/admin/media/components/MediaGrid.tsx
'use client'

import React, { useState } from 'react'
import { Check, Edit2, Star, Trash2, ExternalLink } from 'lucide-react'
import { ProductImage } from '@/app/types/media'
import { deleteProductImage, updateProductImage } from '@/lib/supabase'
import ImageModal from './ImageModal'

interface MediaGridProps {
  images: ProductImage[]
  viewMode: 'grid' | 'list'
  selectedImages: Set<string>
  onSelectImage: (id: string) => void
  onImageUpdated: () => void
}

export default function MediaGrid({
  images,
  viewMode,
  selectedImages,
  onSelectImage,
  onImageUpdated
}: MediaGridProps) {
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null)
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null)

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this image?')) {
      await deleteProductImage(id)
      onImageUpdated()
    }
  }

  const handleSetPrimary = async (image: ProductImage, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // First, unset any existing primary image for this product
    const otherImages = images.filter(img => 
      img.product_id === image.product_id && img.id !== image.id && img.is_primary
    )
    
    for (const otherImage of otherImages) {
      await updateProductImage(otherImage.id, { is_primary: false })
    }
    
    // Set this image as primary
    await updateProductImage(image.id, { is_primary: true })
    onImageUpdated()
  }

  if (viewMode === 'list') {
    return (
      <div className="divide-y divide-gray-200">
        {images.map((image) => (
          <div
            key={image.id}
            className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
              selectedImages.has(image.id) ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectImage(image.id)}
          >
            <div className="relative">
              <img
                src={image.url}
                alt={image.alt_text || ''}
                className="w-16 h-16 object-cover rounded"
              />
              {selectedImages.has(image.id) && (
                <div className="absolute inset-0 bg-blue-600 bg-opacity-50 flex items-center justify-center rounded">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {image.products?.name || 'Unlinked Image'}
                  </h4>
                  <p className="text-sm text-gray-500 truncate max-w-md">
                    {image.alt_text || 'No description'}
                  </p>
                  <div className="flex items-center mt-1 space-x-3">
                    <span className="text-xs text-gray-500">
                      Size: 1.2MB
                    </span>
                    <span className="text-xs text-gray-500">
                      Uploaded: {new Date(image.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {image.is_primary && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Primary
                    </span>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(image)
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                    title="Preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => handleSetPrimary(image, e)}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => handleDelete(image.id, e)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative group border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
              selectedImages.has(image.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectImage(image.id)}
          >
            {/* Image */}
            <div className="aspect-square bg-gray-100">
              <img
                src={image.url}
                alt={image.alt_text || ''}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Selection overlay */}
            {selectedImages.has(image.id) && (
              <div className="absolute inset-0 bg-blue-600 bg-opacity-50 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            )}
            
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(image)
                  }}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Preview"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleSetPrimary(image, e)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Set as primary"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(image.id, e)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 text-white text-sm">
              <div className="truncate font-medium">
                {image.products?.name || 'Unlinked'}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs opacity-75 truncate">
                  {image.alt_text?.substring(0, 20) || 'No description'}
                </span>
                {image.is_primary && (
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          onUpdate={onImageUpdated}
        />
      )}
    </>
  )
}
