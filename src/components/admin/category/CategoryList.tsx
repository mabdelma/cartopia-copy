import React from 'react';
import { Edit2, Trash2, MoveUp, MoveDown } from 'lucide-react';
import type { MenuCategory } from '../../../lib/db/schema';

interface CategoryListProps {
  categories: MenuCategory[];
  onEdit: (category: MenuCategory) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export function CategoryList({ categories, onEdit, onDelete, onMove }: CategoryListProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onMove(category.id, 'up')}
                  className="text-gray-600 hover:text-gray-900 mr-2"
                >
                  <MoveUp className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onMove(category.id, 'down')}
                  className="text-gray-600 hover:text-gray-900 mr-4"
                >
                  <MoveDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onEdit(category)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(category.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}