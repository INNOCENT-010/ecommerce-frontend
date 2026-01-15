// lib/storage.ts
export const BUCKETS = {
  HOMEPAGE: 'bng-homepage',
  PRODUCTS: 'product-images'
};

export function getPublicImageUrl(path?: string | null, bucket: string = BUCKETS.PRODUCTS) {
  if (!path || path.trim() === '') {
    console.warn('⚠️ Empty path provided to getPublicImageUrl');
    return '/fallbacks/product-placeholder.jpg';
  }
  
  // Already a full URL
  if (path.startsWith('http')) return path;
  
  // Clean the path
  let cleanPath = path;
  
  // Remove any bucket prefix that might already be in the path
  if (cleanPath.startsWith('product-images/')) {
    cleanPath = cleanPath.replace('product-images/', '');
  }
  
  // Remove leading slash
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  
  const fullUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
  return fullUrl;
}

export function getProductImageUrl(path?: string | null) {
  return getPublicImageUrl(path, BUCKETS.PRODUCTS);
}