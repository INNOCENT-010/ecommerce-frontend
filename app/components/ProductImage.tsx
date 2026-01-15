// app/components/ProductImages.tsx - NEW COMPONENT
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImagesProps {
  images: Array<{
    id: number;
    filename: string;
    filepath: string;
    is_primary: boolean;
  }>;
}

export default function ProductImages({ images }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={images[selectedImage].filepath}
          alt={`Product image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded overflow-hidden border-2 ${
                selectedImage === index 
                  ? 'border-pink-600' 
                  : 'border-transparent'
              }`}
            >
              <img
                src={image.filepath}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
