import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import type { MenuCategory } from '../../lib/db/schema';
import { getCategories, saveCategory, deleteCategory } from '../../lib/api/menuApi';
import { CategoryForm } from './category/CategoryForm';
import { CategoryList } from './category/CategoryList';

export function CategoryManagement() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // TODO: Add error toast notification
    }
  }

  async function handleSaveCategory(category: MenuCategory) {
    try {
      await saveCategory(category);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      // TODO: Add error toast notification
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      // TODO: Add error toast notification
    }
  }

  async function handleMoveCategory(id: string, direction: 'up' | 'down') {
    const currentIndex = categories.findIndex(c => c.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const currentCategory = categories[currentIndex];
    const swapCategory = categories[newIndex];

    const currentOrder = currentCategory.order;
    currentCategory.order = swapCategory.order;
    swapCategory.order = currentOrder;

    try {
      await Promise.all([
        saveCategory(currentCategory),
        saveCategory(swapCategory)
      ]);
      loadCategories();
    } catch (error) {
      console.error('Failed to move category:', error);
      // TODO: Add error toast notification
    }
  }

  const mainCategories = categories.filter(c => c.type === 'main');
  const subCategories = categories.filter(c => c.type === 'sub');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
        <button
          onClick={() => setEditingCategory({
            id: crypto.randomUUID(),
            name: '',
            type: 'main',
            order: categories.length
          })}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          mainCategories={mainCategories}
          onSave={handleSaveCategory}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Main Categories</h3>
          <CategoryList
            categories={mainCategories}
            onEdit={setEditingCategory}
            onDelete={handleDeleteCategory}
            onMove={handleMoveCategory}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sub Categories</h3>
          <CategoryList
            categories={subCategories}
            onEdit={setEditingCategory}
            onDelete={handleDeleteCategory}
            onMove={handleMoveCategory}
          />
        </div>
      </div>
    </div>
  );
}