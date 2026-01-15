import { supabase } from '@/lib/supabase';
import { getPublicImageUrl } from '@/lib/storage';

export interface DropdownMedia {
  id: string;
  section: string;
  media_type: 'video' | 'image';
  file_path: string;
  url: string;
  updated_at: string;
}

const normalize = (s: string) =>
  s.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');

export async function fetchDropdownMedia(): Promise<Record<string, DropdownMedia>> {
  try {
    const { data, error } = await supabase
      .from('homepage_media')
      .select('*')
      .like('section', 'dropdown_%')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const mediaMap: Record<string, DropdownMedia> = {};

    if (data) {
      data.forEach(item => {
        const key = normalize(item.section.replace('dropdown_', ''));

        mediaMap[key] = {
          ...item,
          url: getPublicImageUrl(item.file_path)!,
        };
      });
    }

    return mediaMap;
  } catch (error) {
    console.error('Error fetching dropdown media:', error);
    return {};
  }
}

export function getDropdownImageForCategory(
  mediaMap: Record<string, DropdownMedia>,
  categoryName: string
): string | null {
  const key = normalize(categoryName);
  return mediaMap[key]?.url || null;
}