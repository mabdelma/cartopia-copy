import React from 'react';
import { Table } from '../../../lib/db/schema';

interface DeleteTableDialogProps {
  table: Table;
  onConfirm: (table: Table) => void;
  onCancel: () => void;
}

export function DeleteTableDialog({ table, onConfirm, onCancel }: DeleteTableDialogProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Table</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete Table {table.number}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(table)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Table
          </button>
        </div>
      </div>
    </div>
  );
}