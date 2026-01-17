'use client';

import { useEffect, useState } from 'react';

export default function TestBackend() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const testConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Testing with API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      
      setResult(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Backend Connection Test</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
      </div>
      
      {loading && <p>Testing connection...</p>}
      
      {error && (
        <div style={{ color: 'red', background: '#fee', padding: '1rem', margin: '1rem 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ background: '#eef', padding: '1rem', margin: '1rem 0' }}>
          <strong>Success! Backend response:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <button 
        onClick={testConnection}
        style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}
      >
        Test Again
      </button>
    </div>
  );
}