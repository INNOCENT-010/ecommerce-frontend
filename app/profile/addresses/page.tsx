// app/profile/addresses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api, Address } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.getUserAddresses()
      .then(setAddresses)
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Addresses</h1>
          <Link
            href="/profile/addresses/new"
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Add New Address
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">You have no saved addresses</p>
            <Link
              href="/profile/addresses/new"
              className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
            >
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow p-6">
                {address.is_default && (
                  <span className="inline-block mb-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Default
                  </span>
                )}
                
                <h3 className="text-lg font-semibold mb-2">
                  {address.street}
                </h3>
                
                <p className="text-gray-600 mb-1">
                  {address.city}, {address.state}
                </p>
                <p className="text-gray-600 mb-1">{address.country}</p>
                {address.postal_code && (
                  <p className="text-gray-600 mb-4">Postal Code: {address.postal_code}</p>
                )}

                <div className="flex space-x-4 mt-4">
                  <button className="text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                  {!address.is_default && (
                    <button className="text-green-600 hover:text-green-800">
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
