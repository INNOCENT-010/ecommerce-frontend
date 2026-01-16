export interface ProductImage {
  
  url: string;
  alt?: string;}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string | string[] |ProductImage[];
  category: string;
  created_at:string;
  colors: string[];
  sizes: string[];
  isNew?: boolean;
  isSale?: boolean;
  slug?: string;
  tags?: string[];
}
