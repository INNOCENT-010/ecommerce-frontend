// types/category.ts
export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  description: string | null
  image_url: string | null
  display_order: number
  created_at: string
}

// types/media.ts
export interface ProductImage {
  id: string
  product_id: string
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
  }
}
