// app/products/[slug]/page.tsx
import ProductDetail from '@/app/components/product/ProductDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: PageProps) {
  const { slug } = params;
  
  if (!slug) {
    notFound();
  }
  
  return <ProductDetail slug={slug} />;
}
