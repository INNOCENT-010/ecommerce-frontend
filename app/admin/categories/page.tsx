'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    description: '',
    image_url: '',
    display_order: 0
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Build hierarchical structure
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // First pass: create map
      data?.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Second pass: build tree
      data?.forEach(category => {
        if (category.parent_id && categoryMap.has(category.parent_id)) {
          categoryMap.get(category.parent_id)!.children!.push(categoryMap.get(category.id)!);
        } else {
          rootCategories.push(categoryMap.get(category.id)!);
        }
      });

      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            ...formData,
            parent_id: formData.parent_id || null
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([{
            ...formData,
            parent_id: formData.parent_id || null
          }]);

        if (error) throw error;
      }

      // Reset form and refresh
      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        image_url: '',
        display_order: 0
      });
      
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || '',
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order
    });
    setShowForm(true);
  };

  // Delete category
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will lose their category assignment.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Cannot delete category with subcategories. Please delete subcategories first.');
    }
  };

  // Render category tree
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="mb-1">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border ${
            level === 0 ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
          }`}
          style={{ marginLeft: `${level * 32}px` }}
        >
          <div className="flex items-center space-x-3">
            {category.children && category.children.length > 0 ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6"></div>
            )}
            
            {category.image_url && (
              <img 
                src={category.image_url} 
                alt={category.name}
                className="w-10 h-10 object-cover rounded"
              />
            )}
            
            <div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.slug}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Order: {category.display_order}
            </span>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
          <div className="mt-1">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">
              Manage product categories and subcategories
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({
                name: '',
                slug: '',
                parent_id: '',
                description: '',
                image_url: '',
                display_order: 0
              });
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Tree */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Category Tree</h2>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No categories yet. Create your first category!</p>
                </div>
              ) : (
                <div className="mt-4">
                  {renderCategoryTree(categories)}
                </div>
              )}
            </div>
          </div>

          {/* Form Sidebar */}
          <div className="lg:col-span-1">
            {showForm && (
              <div className="bg-white rounded-xl shadow p-6 sticky top-6">
                <h2 className="text-lg font-semibold mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="category-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <select
                      value={formData.parent_id}
                      onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">None (Top Level)</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
