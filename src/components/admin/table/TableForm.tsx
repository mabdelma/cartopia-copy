import React from 'react';
import { Table } from '../../../lib/db/schema';

interface TableFormProps {
  table: Table;
  onSave: (table: Table) => void;
  onCancel: () => void;
}

export function TableForm({ table, onSave, onCancel }: TableFormProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {table.id ? 'Edit Table' : 'New Table'}
        </h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(table);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Table Number</label>
            <input
              type="number"
              value={table.number || ''}
              onChange={(e) => onSave({ 
                ...table, 
                number: e.target.value ? parseInt(e.target.value) : 0 
              })}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              value={table.capacity || ''}
              onChange={(e) => onSave({ 
                ...table, 
                capacity: e.target.value ? parseInt(e.target.value) : 0 
              })}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={table.status}
              onChange={(e) => onSave({ ...table, status: e.target.value as Table['status'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
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