// src/config/images.ts - UPDATED
export const IMAGE_CONFIG = {
  // Homepage Images
  homepage: {
    categories: {
      newIn: '/images/homepage/categories/newin.jpg',      // CHANGED: newin.jpg (no hyphen)
      gowns: '/images/homepage/categories/gowns.jpg',      // ✓ Correct
      tops: '/images/homepage/categories/swimtops.jpg',    // CHANGED: swimtops.jpg
      brown: '/images/homepage/categories/brown.jpg',      // ✓ Correct
      backless: '/images/homepage/categories/backless.jpg' // ✓ Correct
    },
    products: {
      eveningGown: '/images/homepage/products/evening-silk-gown.jpg',
      designerBlouse: '/images/homepage/products/designer-blouse.jpg',
      coordSet: '/images/homepage/products/co-ord-set.jpg',
      cocktailDress: '/images/homepage/products/cocktail-dress.jpg',
    },
    hero: {
      video: '/Hero.mp4',                                 // CHANGED: Hero.mp4 is in public root
      fallback: '/images/homepage/hero/fallback.jpg',
    }
  },
  
  // Navigation Images
  navigation: {
    newIn: '/images/navigation/new-in.jpg',
    dresses: '/images/navigation/dresses.jpg',
    occasion: '/images/navigation/occasion.jpg',
    styles: '/images/navigation/styles.jpg',
    swim: '/images/navigation/swim.jpg',
    sale: '/images/navigation/sale.jpg',
  },
  
  // Fallback images (for errors)
  fallbacks: {
    category: '/images/fallbacks/category.jpg',
    product: '/images/fallbacks/product.jpg',
    navigation: '/images/fallbacks/navigation.jpg',
  }
} as const;

// Helper function with fallback
export function getImage(path: string, fallbackKey: keyof typeof IMAGE_CONFIG.fallbacks = 'product') {
  return path || IMAGE_CONFIG.fallbacks[fallbackKey];
}
