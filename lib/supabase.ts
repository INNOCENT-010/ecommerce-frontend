// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { ProductImage } from '@/app/types/media'
import { Category } from '@/app/types/category'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  auth: { persistSession: true }
})

// Wishlist functions
export const wishlistApi = {
  // Add product to wishlist
  addToWishlist: async (productId: string) => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          return { success: false, error: 'Not in browser environment' };
        }
        
        // Store in localStorage for guests
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        if (!guestWishlist.includes(productId)) {
          guestWishlist.push(productId);
          localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
          // Trigger storage event for other tabs/windows
          window.dispatchEvent(new Event('storage'));
        }
        return { success: true, message: 'Added to wishlist' };
      }
      
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.data.user.id,
          product_id: productId,
          added_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding to wishlist:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in addToWishlist:', error);
      return { success: false, error: 'Failed to add to wishlist' };
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId: string) => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        if (typeof window === 'undefined') {
          return { success: false, error: 'Not in browser environment' };
        }
        
        // Remove from localStorage for guests
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        const updatedWishlist = guestWishlist.filter((id: string) => id !== productId);
        localStorage.setItem('guest_wishlist', JSON.stringify(updatedWishlist));
        // Trigger storage event for other tabs/windows
        window.dispatchEvent(new Event('storage'));
        return { success: true };
      }
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.data.user.id);
      
      if (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in removeFromWishlist:', error);
      return { success: false, error: 'Failed to remove from wishlist' };
    }
  },

  // Get user's wishlist - UPDATED VERSION WITH DEBUG
  getWishlist: async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        // Guest user - check if we're in browser
        if (typeof window === 'undefined') {
          return { data: [], groupedByMonth: {} };
        }
        
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        if (guestWishlist.length === 0) {
          return { data: [], groupedByMonth: {} };
        }
        
        // Fetch product details for guest wishlist
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*)
          `)
          .in('id', guestWishlist);
        
        if (error) {
          console.error('❌ Error fetching guest products:', error);
          return { data: [], groupedByMonth: {} };
        }
        
        // Group by month (for guests, use current month as default)
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const groupedByMonth = {
          [currentMonth]: products || []
        };
        
        return { data: products || [], groupedByMonth };
      }
      
      // For logged-in users
      const { data: wishlistItems, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products (
            *,
            product_images (*)
          )
        `)
        .eq('user_id', user.data.user.id)
        .order('added_at', { ascending: false });
      
      if (error) {
        console.error('❌ Database error:', error);
        console.error('❌ Error details:', error.message);
        return { data: [], groupedByMonth: {} };
      }
      
      if (!wishlistItems || wishlistItems.length === 0) {
        return { data: [], groupedByMonth: {} };
      }
      
      // Group items by month
      const groupedByMonth = wishlistItems.reduce((acc, item) => {
        if (!item.product) {
          return acc;
        }
        
        const date = new Date(item.added_at);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastMonthStr = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        let category;
        if (monthYear === currentMonth) {
          category = 'This Month';
        } else if (monthYear === lastMonthStr) {
          category = 'Last Month';
        } else {
          category = monthYear;
        }
        
        if (!acc[category]) {
          acc[category] = [];
        }
        
        acc[category].push({
          ...item.product,
          added_at: item.added_at
        });
        
        return acc;
      }, {} as Record<string, any[]>);
      
      
      
      return { 
        data: wishlistItems.map(item => ({
          ...item.product,
          added_at: item.added_at
        })), 
        groupedByMonth 
      };
    } catch (error) {
      console.error('💥 Uncaught error in getWishlist:', error);
      return { data: [], groupedByMonth: {} };
    }
  },

  // Check if product is in wishlist
  isInWishlist: async (productId: string): Promise<boolean> => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        if (typeof window === 'undefined') {
          return false;
        }
        
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        return guestWishlist.includes(productId);
      }
      
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.data.user.id)
        .eq('product_id', productId)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in isInWishlist:', error);
      return false;
    }
  },

  // Get wishlist count only (optimized)
  getWishlistCount: async (): Promise<number> => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        if (typeof window === 'undefined') {
          return 0;
        }
        
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        return guestWishlist.length;
      }
      
      const { count, error } = await supabase
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.data.user.id);
      
      if (error) {
        console.error('Error getting wishlist count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error in getWishlistCount:', error);
      return 0;
    }
  }
}

// Categories functions (remain unchanged)
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export const createCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Product Images functions (remain unchanged)
export const fetchProductImages = async (): Promise<ProductImage[]> => {
  const { data, error } = await supabase
    .from('product_images')
    .select(`
      *,
      products:product_id (
        id,
        name,
        slug
      )
    `)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching product images:', error)
    return []
  }

  return data || []
}

export const searchProductImages = async (searchTerm: string): Promise<ProductImage[]> => {
  const { data, error } = await supabase
    .from('product_images')
    .select(`
      *,
      products:product_id (
        id,
        name,
        slug
      )
    `)
    .or(`alt_text.ilike.%${searchTerm}%,products.name.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching images:', error)
    return []
  }

  return data || []
}

export const uploadProductImage = async (
  productId: string,
  file: File,
  metadata: {
    alt_text?: string
    display_order?: number
    is_primary?: boolean
  }
) => {
  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  // Create database record
  const { data: dbData, error: dbError } = await supabase
    .from('product_images')
    .insert([{
      product_id: productId,
      url: publicUrl,
      alt_text: metadata.alt_text || '',
      display_order: metadata.display_order || 0,
      is_primary: metadata.is_primary || false
    }])
    .select(`
      *,
      products:product_id (
        id,
        name,
        slug
      )
    `)
    .single()

  if (dbError) throw dbError
  return dbData
}

export const deleteProductImage = async (id: string) => {
  // First get the image to delete from storage
  const { data: image, error: fetchError } = await supabase
    .from('product_images')
    .select('url')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Extract filename from URL
  const url = new URL(image.url)
  const pathParts = url.pathname.split('/')
  const fileName = decodeURIComponent(pathParts[pathParts.length - 1])

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('product-images')
    .remove([fileName])

  if (storageError) {
    console.error('Error deleting from storage:', storageError)
    // Continue to delete DB record even if storage deletion fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', id)

  if (dbError) throw dbError
  return true
}

export const updateProductImage = async (id: string, updates: Partial<ProductImage>) => {
  const { data, error } = await supabase
    .from('product_images')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      products:product_id (
        id,
        name,
        slug
      )
    `)
    .single()

  if (error) throw error
  return data
}