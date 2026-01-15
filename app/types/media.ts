// types/media.ts
export interface ProductImage {
  id: string
  product_id: string | null
  url: string
  alt_text: string | null
  display_order: number
  created_at: string
  is_primary: boolean
  order_index: number
  products?: {
    id: string
    name: string
    slug: string
  } | null
}

export interface MediaStats {
  total: number
  byType: {
    image: number
    document: number
    other: number
  }
  storageUsed: string
  unusedMedia: number
}

export interface UploadedFile {
  file: File
  preview: string
  uploadProgress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface MediaFilter {
  productId?: string | null
  isPrimary?: boolean | null
  dateRange?: {
    start: Date
    end: Date
  }
  type?: 'image' | 'document' | 'all'
}
