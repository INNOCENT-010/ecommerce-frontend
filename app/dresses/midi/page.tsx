import ProductGrid from '@/app/components/product/ProductGrid';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default function MidiDressesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dresses', href: '/dresses' },
          { label: 'Midi' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-teal-600 text-white text-xs px-4 py-1 rounded-full font-bold tracking-wider mb-4">
            MIDI
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Midi Dresses
          </h1>
          <p className="text-gray-600">
            The perfect length for day-to-night dressing
          </p>
        </div>
        
        <ProductGrid category="midi-dresses" />
      </div>
    </main>
  );
}
