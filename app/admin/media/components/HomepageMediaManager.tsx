// app/admin/media/components/HomepageMediaManager.tsx - FIXED VERSION
'use client'

import React, { useState, useEffect } from 'react'
import { Upload, Video, Image as ImageIcon, Check, X, Eye, Monitor, AlertCircle, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface HomepageMediaItem {
  id?: string
  section: string
  media_type: 'video' | 'image'
  file_path: string
  display_order: number
  is_active: boolean
  url?: string
}

interface DropdownImageItem {
  id: string
  category: string
  url: string
  alt_text: string
  button_text: string
  button_link: string
  updated_at: string
}

const HOMEPAGE_SECTIONS = [
  {
    id: 'hero_video',
    name: 'Hero Video',
    description: 'Main homepage video background',
    type: 'video',
    folder: 'hero',
    filename: 'hero.mp4',
    aspect: 'video',
    maxSize: 50 * 1024 * 1024, // 50MB for video
    acceptedTypes: 'video/mp4,video/webm'
  },
  {
    id: 'hero_fallback',
    name: 'Hero Fallback Image',
    description: 'Image shown if video fails to load',
    type: 'image',
    folder: 'hero',
    filename: 'hero-fallback.jpg',
    aspect: 'video',
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'dropdown_newin',
    name: 'New In Dropdown',
    description: 'New In dropdown menu image',
    type: 'image',
    folder: 'dropdown',
    filename: 'new-in-dropdown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp',
    isDropdown: true
  },
  {
    id: 'dropdown_occasion',
    name: 'Occasion Dropdown',
    description: 'Occasion dropdown menu image',
    type: 'image',
    folder: 'dropdown',
    filename: 'occasion-dropdown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp',
    isDropdown: true
  },
  {
    id: 'dropdown_dresses',
    name: 'Dresses Dropdown',
    description: 'Dresses dropdown menu image',
    type: 'image',
    folder: 'dropdown',
    filename: 'dresses-dropdown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp',
    isDropdown: true
  },
  {
    id: 'dropdown_styles',
    name: 'Styles Dropdown',
    description: 'Styles dropdown menu image',
    type: 'image',
    folder: 'dropdown',
    filename: 'styles-dropdown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp',
    isDropdown: true
  },
  {
    id: 'dropdown_swim',
    name: 'Swim Dropdown',
    description: 'Swim dropdown menu image',
    type: 'image',
    folder: 'dropdown',
    filename: 'swim-dropdown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp',
    isDropdown: true
  },
  {
    id: 'dropdown_sale',
    name: 'Sale Dropdown',
    description: 'Sale dropdown menu image',
    type: 'image',
    folder: 'dropdown',
    filename: 'sale-dropdown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp',
    isDropdown: true
  },  
  {
    id: 'category_newin',
    name: 'New In Category',
    description: 'New In category image',
    type: 'image',
    folder: 'categories',
    filename: 'new-in.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024, // 3MB
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'category_gowns',
    name: 'Gowns Category',
    description: 'Gowns category image',
    type: 'image',
    folder: 'categories',
    filename: 'gowns.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'category_tops',
    name: 'Tops Category',
    description: 'Tops category image',
    type: 'image',
    folder: 'categories',
    filename: 'tops.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'category_brown',
    name: 'Brown Category',
    description: 'Brown category image',
    type: 'image',
    folder: 'categories',
    filename: 'brown.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'category_backless',
    name: 'Backless Category',
    description: 'Backless category image',
    type: 'image',
    folder: 'categories',
    filename: 'backless.jpg',
    aspect: 'portrait',
    maxSize: 3 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'banner_swim',
    name: 'Swim Collection Banner',
    description: 'Swim collection banner image',
    type: 'image',
    folder: 'banners',
    filename: 'swim-banner.jpg',
    aspect: 'landscape',
    maxSize: 4 * 1024 * 1024, // 4MB
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  },
  {
    id: 'banner_preorder',
    name: 'Pre-Order Banner',
    description: 'Pre-order banner image',
    type: 'image',
    folder: 'banners',
    filename: 'preorder-banner.jpg',
    aspect: 'landscape',
    maxSize: 4 * 1024 * 1024,
    acceptedTypes: 'image/jpeg,image/png,image/webp'
  }
]

const BUCKET_NAME = 'bng-homepage'

// Category mapping for database operations
const CATEGORY_MAP: Record<string, string> = {
  'dropdown_newin': 'NEWIN',
  'dropdown_occasion': 'OCCASION',
  'dropdown_dresses': 'DRESSES',
  'dropdown_styles': 'STYLES',
  'dropdown_swim': 'SWIM',
  'dropdown_sale': 'SALE'
}

// Reverse mapping for display
const REVERSE_CATEGORY_MAP: Record<string, string> = {
  'NEWIN': 'dropdown_newin',
  'OCCASION': 'dropdown_occasion',
  'DRESSES': 'dropdown_dresses',
  'STYLES': 'dropdown_styles',
  'SWIM': 'dropdown_swim',
  'SALE': 'dropdown_sale'
}

export default function HomepageMediaManager() {
  const [mediaItems, setMediaItems] = useState<HomepageMediaItem[]>([])
  const [dropdownImages, setDropdownImages] = useState<DropdownImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [dropdownData, setDropdownData] = useState({
    alt_text: '',
    button_text: '',
    button_link: ''
  })

  useEffect(() => {
    loadAllMedia()
  }, [])

  const loadAllMedia = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Load homepage media
      const { data: homepageData, error: homepageError } = await supabase
        .from('homepage_media')
        .select('*')
        .order('display_order', { ascending: true })

      // Load dropdown images
      const { data: dropdownData, error: dropdownError } = await supabase
        .from('dropdown_images')
        .select('*')

      // Transform homepage media with URLs
      const homepageItems = homepageData?.map(item => {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${item.file_path}`
        return {
          ...item,
          url
        }
      }) || []

      // Transform dropdown images to match format for display
      const dropdownItems = dropdownData?.map(item => {
        // Map database category back to section ID
        const sectionId = REVERSE_CATEGORY_MAP[item.category] || `dropdown_${item.category.toLowerCase()}`
        
        return {
          id: item.id,
          section: sectionId,
          media_type: 'image' as const,
          file_path: item.url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`, ''),
          display_order: 0,
          is_active: true,
          url: item.url,
          dropdownData: item
        }
      }) || []

      // Combine both types of items
      const allItems = [...homepageItems]
      
      // For dropdown sections, use database data if available, otherwise use default
      HOMEPAGE_SECTIONS.forEach(section => {
        if (section.id.startsWith('dropdown_')) {
          const existingDropdown = dropdownItems.find(d => d.section === section.id)
          if (existingDropdown) {
            allItems.push(existingDropdown as unknown as HomepageMediaItem)
          } else {
            // Add default dropdown item
            allItems.push({
              section: section.id,
              media_type: section.type as 'video' | 'image',
              file_path: `${section.folder}/${section.filename}`,
              display_order: 0,
              is_active: true,
              url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${section.folder}/${section.filename}`
            })
          }
        }
      })

      setMediaItems(allItems)
      setDropdownImages(dropdownData || [])
      
    } catch (error) {
      console.error('Error loading media:', error)
      setError('Failed to load media. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const validateFile = (file: File, section: typeof HOMEPAGE_SECTIONS[0]) => {
    // Check file size
    if (file.size > section.maxSize) {
      const maxSizeMB = section.maxSize / (1024 * 1024)
      throw new Error(`File size must be less than ${maxSizeMB}MB`)
    }

    // Check file type
    const acceptedTypes = section.acceptedTypes.split(',')
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`File must be one of: ${acceptedTypes.join(', ')}`)
    }

    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const section = HOMEPAGE_SECTIONS.find(s => s.id === selectedSection)
      if (!section) throw new Error('Please select a section first')

      validateFile(file, section)
      
      setUploadFile(file)
      setError('')
      
      // Create preview URL
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // If it's a dropdown section, load existing data
      if (section.id.startsWith('dropdown_')) {
        const dbCategory = CATEGORY_MAP[section.id]
        
        if (dbCategory) {
          const existingDropdown = dropdownImages.find(d => d.category === dbCategory)
          
          if (existingDropdown) {
            setDropdownData({
              alt_text: existingDropdown.alt_text || '',
              button_text: existingDropdown.button_text || 'Shop Now',
              button_link: existingDropdown.button_link || '#'
            })
          } else {
            // Set defaults based on category name
            const displayName = dbCategory.charAt(0) + dbCategory.slice(1).toLowerCase()
            setDropdownData({
              alt_text: `${displayName} Collection`,
              button_text: `Shop ${displayName}`,
              button_link: `/products?category=${dbCategory.toLowerCase()}`
            })
          }
        }
      }
    } catch (err: any) {
      setError(err.message)
      setUploadFile(null)
      setPreviewUrl('')
      setDropdownData({ alt_text: '', button_text: '', button_link: '' })
    }
  }

  const handleUpload = async () => {
    if (!selectedSection || !uploadFile) {
      setError('Please select a section and file')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    
    try {
      const section = HOMEPAGE_SECTIONS.find(s => s.id === selectedSection)
      if (!section) throw new Error('Invalid section')

      // Validate file
      validateFile(uploadFile, section)

      // Upload to Supabase Storage
      const filePath = `${section.folder}/${section.filename}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, uploadFile, { 
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)
      
      // Handle different database tables based on section type
      if (section.id.startsWith('dropdown_')) {
        // Get database category name from mapping
        const categoryName = CATEGORY_MAP[section.id]
        
        if (!categoryName) {
          throw new Error(`No category mapping found for section: ${section.id}`)
        }
        
        // Use the actual public URL from storage
        const fullUrl = publicUrlData?.publicUrl || 
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
        
        // Prepare data with proper category format
        const dropdownDataToSave = {
          category: categoryName,
          url: fullUrl,
          alt_text: dropdownData.alt_text || `${categoryName.charAt(0) + categoryName.slice(1).toLowerCase()} Collection`,
          button_text: dropdownData.button_text || `Shop ${categoryName.charAt(0) + categoryName.slice(1).toLowerCase()}`,
          button_link: dropdownData.button_link || `/products?category=${categoryName.toLowerCase()}`,
          updated_at: new Date().toISOString()
        }
        
        // Use upsert with category as the unique key
        const { data: dropdownInsertData, error: dropdownError } = await supabase
          .from('dropdown_images')
          .upsert(dropdownDataToSave, {
            onConflict: 'category'
          })
          .select()

        if (dropdownError) {
          throw new Error(`Failed to save dropdown data: ${dropdownError.message}`)
        }
      } else {
        const { data: homepageInsertData, error: dbError } = await supabase
          .from('homepage_media')
          .upsert({
            section: selectedSection,
            media_type: section.type,
            file_path: filePath,
            updated_at: new Date().toISOString()
          })
          .select()

        if (dbError) {
          // Don't throw, just log - the file is uploaded
          console.error('Database error:', dbError)
        }
      }

      // Clear upload state
      setUploadFile(null)
      setSelectedSection('')
      setDropdownData({ alt_text: '', button_text: '', button_link: '' })
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl('')
      
      // Refresh data
      await loadAllMedia()
      
      setSuccess('Media updated successfully!')
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getSectionInfo = (sectionId: string) => {
    return HOMEPAGE_SECTIONS.find(s => s.id === sectionId)
  }

  const getAspectClass = (aspect: string) => {
    switch (aspect) {
      case 'video': return 'aspect-video'
      case 'portrait': return 'aspect-[3/4]'
      case 'landscape': return 'aspect-[16/9]'
      default: return 'aspect-square'
    }
  }

  const handlePreview = (url: string, type: 'video' | 'image') => {
    window.open(url, '_blank')
  }

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div id="upload-section" className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Homepage Media</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value)
                setUploadFile(null)
                setPreviewUrl('')
                setDropdownData({ alt_text: '', button_text: '', button_link: '' })
                setError('')
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a section...</option>
              {HOMEPAGE_SECTIONS.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} ({section.type})
                </option>
              ))}
            </select>
          </div>

          {selectedSection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
                <span className="text-xs text-gray-500 ml-2">
                  {getSectionInfo(selectedSection)?.type === 'video' 
                    ? 'MP4 recommended (max 50MB)' 
                    : 'JPG or PNG recommended (max 3-4MB)'}
                </span>
              </label>
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={getSectionInfo(selectedSection)?.acceptedTypes}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : 'Update Media'}
                </button>
              </div>
            </div>
          )}

          {/* Dropdown-specific fields */}
          {selectedSection && selectedSection.startsWith('dropdown_') && (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900">Dropdown Menu Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={dropdownData.alt_text}
                    onChange={(e) => setDropdownData({...dropdownData, alt_text: e.target.value})}
                    placeholder="Image description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={dropdownData.button_text}
                    onChange={(e) => setDropdownData({...dropdownData, button_text: e.target.value})}
                    placeholder="Shop Now"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={dropdownData.button_link}
                    onChange={(e) => setDropdownData({...dropdownData, button_link: e.target.value})}
                    placeholder="/products?category=..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className={`${getAspectClass(getSectionInfo(selectedSection)?.aspect || 'square')} bg-gray-100 rounded-lg overflow-hidden border border-gray-300`}>
                {getSectionInfo(selectedSection)?.type === 'video' ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              {uploadFile && (
                <div className="mt-2 text-sm text-gray-600">
                  File: {uploadFile.name} ({Math.round(uploadFile.size / 1024)}KB)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Media Display */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current Homepage Media</h2>
              <p className="text-sm text-gray-600">Manage all homepage images and videos</p>
            </div>
            <button
              onClick={loadAllMedia}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading homepage media...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item) => {
                const sectionInfo = getSectionInfo(item.section)
                const isDropdown = sectionInfo?.id?.startsWith('dropdown_')
                
                return (
                  <div key={item.section} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`${getAspectClass(sectionInfo?.aspect || 'square')} bg-gray-100 relative group`}>
                      {item.media_type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Video class="w-12 h-12 mb-2" />
                                    <span class="text-sm">Video not found</span>
                                  </div>
                                `
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            VIDEO
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={item.url}
                            alt={sectionInfo?.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                                  <ImageIcon class="w-12 h-12 mb-2" />
                                  <span class="text-sm">Image not found</span>
                                </div>
                              `
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            {isDropdown ? 'DROPDOWN' : 'IMAGE'}
                          </div>
                        </>
                      )}
                      
                      <button
                        onClick={() => item.url && handlePreview(item.url, item.media_type)}
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Preview in new tab"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{sectionInfo?.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{sectionInfo?.description}</p>
                          {isDropdown && (
                            <div className="flex items-center mt-1">
                              <Navigation className="w-3 h-3 mr-1 text-blue-500" />
                              <span className="text-xs text-blue-600">Dropdown Menu</span>
                            </div>
                          )}
                        </div>
                        <div className={`p-1 rounded-full flex-shrink-0 ${item.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {item.is_active ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <div className="flex items-center">
                          <Monitor className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{item.section}</span>
                        </div>
                        <div className="truncate" title={item.file_path}>
                          {item.file_path}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedSection(item.section)
                          setUploadFile(null)
                          setPreviewUrl('')
                          setError('')
                          // Scroll to upload section
                          document.getElementById('upload-section')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                          })
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 text-center py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        Replace This Media
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info (for troubleshooting) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Bucket: {BUCKET_NAME}</div>
            <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</div>
            <div>Media Items: {mediaItems.length}</div>
            <div>Dropdown Images: {dropdownImages.length}</div>
            {selectedSection && (
              <div>Selected Section DB Category: {CATEGORY_MAP[selectedSection] || 'N/A'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}