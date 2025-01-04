import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDB } from '../../lib/db';
import type { MenuItem, Table, Order } from '../../lib/db/schema';
import { toISOString } from '../../lib/utils/dateUtils';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

export function NewOrderForm() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Array<{ menuItemId: string; quantity: number }>>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const db = await getDB();
      const [allTables, allMenuItems] = await Promise.all([
        db.getAll('tables'),
        db.getAll('menu_items')
      ]);

      setTables(allTables.filter(table => table.status === 'available'));
      setMenuItems(allMenuItems.filter(item => item.available));
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load tables and menu items');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authState.user) return;

    try {
      const db = await getDB();
      
      // Calculate total
      const total = selectedItems.reduce((sum, item) => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return sum + (menuItem?.price || 0) * item.quantity;
      }, 0);

      const order: Order = {
        id: crypto.randomUUID(),
        tableId: selectedTable,
        waiterStaffId: authState.user.id,
        status: 'pending',
        paymentStatus: 'unpaid',
        total,
        items: selectedItems.map(item => ({
          id: crypto.randomUUID(),
          menuItemId: item.menuItemId,
          quantity: item.quantity
        })),
        createdAt: toISOString(new Date()),
        updatedAt: toISOString(new Date())
      };

      await db.put('orders', order);
      await db.put('tables', {
        id: selectedTable,
        status: 'occupied'
      });

      navigate('/waiter/orders');
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order');
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Table</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              Table {table.number} (Capacity: {table.capacity})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Items</label>
        <div className="mt-2 space-y-4">
          {menuItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
              </div>
              <input
                type="number"
                min="0"
                value={selectedItems.find(si => si.menuItemId === item.id)?.quantity || ''}
                onChange={(e) => {
                  const quantity = parseInt(e.target.value) || 0;
                  if (quantity === 0) {
                    setSelectedItems(prev => prev.filter(i => i.menuItemId !== item.id));
                  } else {
                    setSelectedItems(prev => {
                      const existing = prev.find(i => i.menuItemId === item.id);
                      if (existing) {
                        return prev.map(i => 
                          i.menuItemId === item.id ? { ...i, quantity } : i
                        );
                      }
                      return [...prev, { menuItemId: item.id, quantity }];
                    });
                  }
                }}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!selectedTable || selectedItems.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Create Order
        </button>
      </div>
    </form>
  );
}