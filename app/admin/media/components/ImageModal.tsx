// app/admin/media/components/ImageModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Download, Edit2, ExternalLink, Star } from 'lucide-react'
import { ProductImage } from '@/app/types/media'
import { updateProductImage } from '@/lib/supabase'

interface ImageModalProps {
  image: ProductImage
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function ImageModal({ image, isOpen, onClose, onUpdate }: ImageModalProps) {
  const [editing, setEditing] = useState(false)
  const [altText, setAltText] = useState(image.alt_text || '')
  const [displayOrder, setDisplayOrder] = useState(image.display_order)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProductImage(image.id, {
        alt_text: altText,
        display_order: displayOrder
      })
      onUpdate()
      setEditing(false)
    } catch (error) {
      console.error('Error updating image:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.url.split('/').pop() || 'image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Image preview */}
          <div className="flex-1 bg-black flex items-center justify-center p-8">
            <img
              src={image.url}
              alt={image.alt_text || ''}
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>

          {/* Sidebar with info */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Image Details</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Product</h4>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {image.products ? (
                      <>
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                          <Star className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{image.products.name}</p>
                          <p className="text-sm text-gray-500">{image.products.slug}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">Not linked to any product</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Alt Text</h4>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {editing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  
                  {editing ? (
                    <div className="space-y-3">
                      <textarea
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe this image..."
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={displayOrder}
                          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {image.alt_text || 'No alt text provided'}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Image Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">URL:</span>
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Open <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        image.is_primary 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {image.is_primary ? 'Primary Image' : 'Gallery Image'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Display Order:</span>
                      <span className="font-medium">{image.display_order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span>{new Date(image.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </button>
                
                {image.products && (
                  <a
                    href={`/admin/products/${image.products.id}`}
                    className="block w-full text-center px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black"
                  >
                    Go to Product
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
