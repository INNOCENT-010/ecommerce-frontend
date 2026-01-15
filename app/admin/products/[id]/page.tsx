'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    api.getProduct(Number(id)).then(setForm);
  }, [id]);

  if (!form) return <p className="p-8">Loading...</p>;

  const handleSave = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(form),
    });

    alert('Updated');
  };

  const handleDelete = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    alert('Deleted');
    router.push('/admin/products');
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border p-3 mb-4"
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border p-3 mb-4"
      />

      <div className="flex gap-4">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
          Save
        </button>

        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete
        </button>
      </div>
    </main>
  );
}
