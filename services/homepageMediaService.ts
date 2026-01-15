import { supabase } from '@/lib/supabase';
import { getPublicImageUrl } from '@/lib/storage';

export interface HomepageMediaItem {
  id: string;
  section: string;
  media_type: 'video' | 'image';
  file_path: string;
  display_order: number;
  is_active: boolean;
  url: string;
}

export async function getHomepageMedia(): Promise<HomepageMediaItem[]> {
  const { data, error } = await supabase
    .from('homepage_media')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching homepage media:', error);
    return [];
  }

  return data.map(item => ({
    ...item,
    url: getPublicImageUrl(item.file_path)!,
  }));
}