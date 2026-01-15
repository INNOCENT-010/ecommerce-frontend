// app/dresses/page.tsx - UPDATED
import ProductGrid from '@/app/components/product/ProductGrid';
import PageHeader from '@/app/components/layout/header';

export default function DressesPage() {
  const pageData = {
    title: 'DRESSES',
    intro: 'Meet your new favorites. More styles added daily.',
    description: 'Discover our collection of stunning dresses for every occasion. From elegant evening gowns to casual day dresses.',
    badge: 'BACK IN STOCK'
  };

  return (
    <div className="min-h-screen bg-white">
      <header {...pageData} />
      
      <section className="container mx-auto px-4 py-8">
        <ProductGrid category="dresses" />
      </section>
    </div>
  );
}