// app/admin/stats/downloads/page.tsx - NEW PAGE
'use client';

import { useEffect, useState } from 'react';
import { api, DownloadStats } from '@/lib/api';

export default function DownloadStatsPage() {
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDownloadStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching download stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Loading download statistics...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Download Statistics</h1>
      
      {/* Total Downloads Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Total Downloads</h2>
        <p className="text-4xl font-bold text-green-600">{stats?.total_downloads || 0}</p>
        <p className="text-gray-600 mt-2">Total product downloads across all products</p>
      </div>

      {/* Top Downloaded Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Top Downloaded Products</h2>
        
        {stats?.top_products && stats.top_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.top_products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">{product.downloads}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => window.open(`/products/${product.product_id}`, '_blank')}
                        className="text-pink-600 hover:text-pink-800 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => window.open(`/admin/products/${product.product_id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No download data available yet.</p>
        )}
      </div>
    </div>
  );
}
