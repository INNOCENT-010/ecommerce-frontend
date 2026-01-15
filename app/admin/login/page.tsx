// app/admin/login/page.tsx - UPDATED WITH BETTER ERROR HANDLING
'use client';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@bloomg.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const router = useRouter();

  useEffect(() => {
    // Test backend connection on mount
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setBackendStatus('connected');
        } else {
        setBackendStatus('error');
        }
    } catch (err) {
      setBackendStatus('error');
      console.error('Backend connection error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/admin-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'include', // Include cookies if needed
      });

      ));
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint not found. Check if backend is running on port 8000.');
        } else if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 403) {
          throw new Error('Admin access required. This account is not an administrator.');
        } else {
          throw new Error(data.detail || data.message || `Login failed (${response.status})`);
        }
      }

      // Save authentication data
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('is_admin', 'true');
        
        + '...',
          user: data.user.email,
          is_admin: data.user.is_admin
        });
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        throw new Error('No access token received');
      }

    } catch (err: any) {
      console.error('Login Error Details:', err);
      setError(err.message || 'An unexpected error occurred');
      
      // If it's a network error, suggest troubleshooting
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError(prev => prev + '. Make sure the backend is running on http://127.0.0.1:8000');
      }
    } finally {
      setLoading(false);
    }
  };

  const createFirstAdmin = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/auth/create-first-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/auth/create-first-admin', {
        method: 'GET', // Try GET first
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      alert(`GET Test: ${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      alert('GET Test Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">BLOOM & G</h1>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Admin Login</h2>
            <div className="mt-2 flex items-center justify-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${backendStatus === 'connected' ? 'bg-green-100 text-green-800' : backendStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${backendStatus === 'connected' ? 'bg-green-500' : backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                Backend: {backendStatus === 'connected' ? 'Connected' : backendStatus === 'error' ? 'Not Connected' : 'Checking...'}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <div className="font-semibold mb-1">Error:</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                placeholder="admin@bloomg.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || backendStatus === 'error'}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-medium mb-2">Default Admin Credentials:</p>
              <p>Email: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin@bloomg.com</span></p>
              <p>Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">Admin123!</span></p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={createFirstAdmin}
                disabled={loading}
                className="w-full text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-lg transition"
              >
                Create First Admin Account
              </button>
              
              <button
                onClick={testEndpoint}
                disabled={loading}
                className="w-full text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 py-2 px-4 rounded-lg transition"
              >
                Test Backend Connection
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
            <p>Backend API: http://127.0.0.1:8000</p>
            <p>Check console (F12) for detailed logs</p>
            <p>Make sure both backend and frontend are running</p>
          </div>
        </div>
      </div>
    </div>
  );
}