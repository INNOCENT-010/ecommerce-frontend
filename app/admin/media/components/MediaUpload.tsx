// app/admin/media/components/MediaUpload.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Link, Tag, Package } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'

interface MediaUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
  type?: 'product' | 'homepage'
}

interface UploadFile extends File {
  preview: string
}

export default function MediaUpload({ 
  isOpen, 
  onClose, 
  onUploadComplete,
  type = 'product' // Add default value here
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [productLink, setProductLink] = useState<string>('')
  const [altText, setAltText] = useState<string>('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)

  // Now type is defined properly
  const title = type === 'homepage' ? 'Upload Homepage Media' : 'Upload Product Images'
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    ) as UploadFile[]
    
    setFiles(prev => [...prev, ...mappedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const removeFile = (index: number) => {
    const newFiles = [...files]
    URL.revokeObjectURL(newFiles[index].preview)
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    
    try {
      for (const file of files) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = fileName

        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) {
          console.error(`❌ STORAGE ERROR: ${uploadError.message}`)
          throw uploadError
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        // Create database record
        const { error: dbError } = await supabase
          .from('product_images')
          .insert([{
            product_id: productLink || null,
            url: publicUrl,
            alt_text: altText,
            display_order: displayOrder,
            is_primary: isPrimary,
            order_index: displayOrder
          }])

        if (dbError) {
          console.error(`❌ DATABASE ERROR: ${dbError.message}`)
          throw dbError
        }
        
        }

      // Clean up preview URLs
      files.forEach(file => URL.revokeObjectURL(file.preview))
      
      // Reset form
      setFiles([])
      setProductLink('')
      setAltText('')
      setIsPrimary(false)
      setDisplayOrder(0)
      
      // Notify parent
      onUploadComplete()
      onClose()
    } catch (error) {
      console.error('🔥 FINAL ERROR:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    // Clean up preview URLs
    files.forEach(file => URL.revokeObjectURL(file.preview))
    setFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Upload area */}
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-lg font-medium text-gray-700">Drop the files here...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drag & drop images here
                    </p>
                    <p className="text-gray-500 mb-4">or click to select files</p>
                  </>
                )}
                <p className="text-sm text-gray-400">
                  Supports: JPG, PNG, GIF, WebP • Max 5MB each
                </p>
              </div>

              {/* File previews */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Selected Files ({files.length})</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Settings */}
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 mr-2" />
                  Link to Product (Optional)
                </label>
                <input
                  type="text"
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                  placeholder="Enter product ID or leave empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link images to a specific product for better organization
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 mr-2" />
                  Alt Text / Description
                </label>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for SEO and accessibility"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Important for SEO and visually impaired users
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                    Set as primary image
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ImageIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Tips</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Use descriptive alt text for better SEO</li>
                      <li>• Primary image appears first in product galleries</li>
                      <li>• Display order controls image sequence</li>
                      <li>• High-quality images (min 800×800px recommended)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
              disabled={uploading}
            >
              Cancel
            </button>
            
            <div className="flex items-center space-x-3">
              {files.length > 0 && (
                <span className="text-sm text-gray-600">
                  {files.length} file{files.length !== 1 ? 's' : ''} ready
                </span>
              )}
              
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {files.length > 0 ? `(${files.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}