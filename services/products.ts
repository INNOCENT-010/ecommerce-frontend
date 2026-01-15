// services/product.ts
import { supabase } from '@/lib/supabase';
import { getPublicImageUrl } from '@/lib/storage';

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  tags: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  sku: string | null;
  featured: boolean;
  images: ProductImage[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export class ProductService {
  private static normalizeProducts(data: Product[]): Product[] {
    return data.map(product => ({
      ...product,
      images: product.images.map(img => ({
        ...img,
        url: getPublicImageUrl(img.url) || '/fallbacks/product.png', // fallback image if URL is null
      })),
    }));
  }

  static async getProducts(options?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .order('created_at', { ascending: false });

    if (options?.category) query = query.eq('category', options.category);
    if (options?.featured) query = query.eq('featured', true);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset)
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;

    return this.normalizeProducts(data as Product[]);
  }

  static async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    return this.normalizeProducts([data as Product])[0];
  }

  static async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .eq('id', id)
      .single();

    if (error) throw error;

    return this.normalizeProducts([data as Product])[0];
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (error) throw error;

    return data as Category[];
  }

  static async searchProducts(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return this.normalizeProducts(data as Product[]);
  }

  static async getProductsByCategory(categorySlug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .eq('category', categorySlug)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.normalizeProducts(data as Product[]);
  }
}