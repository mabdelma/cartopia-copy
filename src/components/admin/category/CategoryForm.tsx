import React from 'react';
import type { MenuCategory } from '../../../lib/db/schema';

interface CategoryFormProps {
  category: MenuCategory;
  mainCategories: MenuCategory[];
  onSave: (category: MenuCategory) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, mainCategories, onSave, onCancel }: CategoryFormProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {category.id ? 'Edit Category' : 'New Category'}
        </h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(category);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={category.name}
              onChange={(e) => category.name = e.target.value}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={category.type}
              onChange={(e) => {
                const type = e.target.value as 'main' | 'sub';
                category.type = type;
                if (type === 'main') {
                  delete category.parentId;
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="main">Main Category</option>
              <option value="sub">Sub Category</option>
            </select>
          </div>
          {category.type === 'sub' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={category.parentId}
                onChange={(e) => category.parentId = e.target.value}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a parent category</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}