// app/products/page.tsx - UPDATED
import ProductGrid from '@/app/components/product/ProductGrid';
import { Suspense } from 'react';


interface ProductsPageProps {
  searchParams: {
    category?: string;
    tag?: string; // ONLY category and tag
    maxPrice?: string;
  }
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, tag, maxPrice } = searchParams;
  
  // Generate page title
  const getPageTitle = () => {
    if (tag && category) {
      return `${tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }
    if (category) {
      return `${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }
    return 'All Products';
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          
          {/* Breadcrumb - NO subcategory */}
          {(category || tag) && (
            <div className="flex items-center text-sm text-gray-500 mt-4">
              <a href="/" className="hover:text-black">Home</a>
              <span className="mx-2">/</span>
              <a href="/products" className="hover:text-black">Products</a>
              {category && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-black font-medium capitalize">{category.replace(/-/g, ' ')}</span>
                </>
              )}
              {tag && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-black font-medium capitalize">{tag.replace(/-/g, ' ')}</span>
                </>
              )}
            </div>
          )}
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ProductGrid 
            category={category}
            tag={tag}
          />
        </Suspense>
      </div>
    </main>
  );
}