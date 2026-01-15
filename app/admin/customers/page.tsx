// app/admin/customers/page.tsx - REAL DATA VERSION
'use client';

import { useEffect, useState } from 'react';
import { adminAPI, type Order } from '@/lib/admin-api';
import { User, Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';

interface Customer {
  email: string;
  name: string;
  phone?: string;
  orderCount: number;
  totalSpent: number;
  firstOrder: string;
  lastOrder: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const orders = await adminAPI.getOrders();
      
      // Group orders by customer email
      const customerMap = new Map<string, Customer>();
      
      orders.forEach((order: Order) => {
        const email = order.customer_email;
        const name = order.customer_name || 'Unknown';
        
        if (!email) return; // Skip orders without email
        
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name,
            phone: '', // You can add phone if available in order data
            orderCount: 0,
            totalSpent: 0,
            firstOrder: order.created_at,
            lastOrder: order.created_at
          });
        }
        
        const customer = customerMap.get(email)!;
        customer.orderCount += 1;
        customer.totalSpent += order.total_amount;
        
        // Update first/last order dates
        const orderDate = new Date(order.created_at);
        const firstDate = new Date(customer.firstOrder);
        const lastDate = new Date(customer.lastOrder);
        
        if (orderDate < firstDate) customer.firstOrder = order.created_at;
        if (orderDate > lastDate) customer.lastOrder = order.created_at;
      });
      
      // Convert map to array and sort by total spent
      const customersArray = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
      
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3">Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600">{customers.length} customers from orders</p>
        </div>
        <button
          onClick={fetchCustomers}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.email} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} className="text-gray-500" />
                  <h3 className="font-bold text-lg">{customer.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span className="text-sm">{customer.email}</span>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Order</span>
                <span className="font-medium">
                  {formatCurrency(customer.totalSpent / customer.orderCount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">First Order</span>
                <span className="text-sm">{formatDate(customer.firstOrder)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Order</span>
                <span className="text-sm">{formatDate(customer.lastOrder)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  // You could link to customer details or filter orders by this customer
                  alert(`View all orders for ${customer.name}`);
                }}
                className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Customer Orders
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-medium mb-2">
            {search ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-gray-500">
            {search 
              ? 'Try a different search term' 
              : 'Customers will appear here after they place orders'}
          </p>
        </div>
      )}
    </div>
  );
}