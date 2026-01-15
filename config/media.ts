// config/media.ts

export const MEDIA_CONFIG = {
  BUCKET_NAME: 'bng-homepage',

  FOLDERS: {
    VIDEOS: 'videos',
    CATEGORIES: 'categories',
    BANNERS: 'banners',
    HERO: 'hero'
  },

  DEFAULT_FILES: {
    HERO_VIDEO: 'hero.mp4',
    HERO_FALLBACK: 'hero-fallback.jpg',
    NEW_IN: 'new-in.jpg',
    GOWNS: 'gowns.jpg',
    TOPS: 'tops.jpg',
    BROWN: 'brown.jpg',
    BACKLESS: 'backless.jpg',
    SWIM_BANNER: 'swim-banner.jpg',
    PREORDER_BANNER: 'preorder-banner.jpg'
  }
} as const;

export function getMediaUrl(folder: string, filename: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_CONFIG.BUCKET_NAME}/${folder}/${filename}`;
}

// ⬇️ THESE ARE NOW **FALLBACKS**, NOT SOURCE OF TRUTH
export const HOMEPAGE_MEDIA = {
  HERO: {
    VIDEO: getMediaUrl(MEDIA_CONFIG.FOLDERS.HERO, MEDIA_CONFIG.DEFAULT_FILES.HERO_VIDEO),
    FALLBACK: getMediaUrl(MEDIA_CONFIG.FOLDERS.HERO, MEDIA_CONFIG.DEFAULT_FILES.HERO_FALLBACK)
  },

  CATEGORIES: {
    NEW_IN: getMediaUrl(MEDIA_CONFIG.FOLDERS.CATEGORIES, MEDIA_CONFIG.DEFAULT_FILES.NEW_IN),
    GOWNS: getMediaUrl(MEDIA_CONFIG.FOLDERS.CATEGORIES, MEDIA_CONFIG.DEFAULT_FILES.GOWNS),
    TOPS: getMediaUrl(MEDIA_CONFIG.FOLDERS.CATEGORIES, MEDIA_CONFIG.DEFAULT_FILES.TOPS),
    BROWN: getMediaUrl(MEDIA_CONFIG.FOLDERS.CATEGORIES, MEDIA_CONFIG.DEFAULT_FILES.BROWN),
    BACKLESS: getMediaUrl(MEDIA_CONFIG.FOLDERS.CATEGORIES, MEDIA_CONFIG.DEFAULT_FILES.BACKLESS)
  },

  BANNERS: {
    SWIM: getMediaUrl(MEDIA_CONFIG.FOLDERS.BANNERS, MEDIA_CONFIG.DEFAULT_FILES.SWIM_BANNER),
    PREORDER: getMediaUrl(MEDIA_CONFIG.FOLDERS.BANNERS, MEDIA_CONFIG.DEFAULT_FILES.PREORDER_BANNER)
  }
};