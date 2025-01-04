import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDB } from '../../lib/db';
import type { Order, MenuItem, Table, Payment } from '../../lib/db/schema';
import { OrderDetails } from './OrderDetails';
import { PaymentForm } from './PaymentForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Clock, DollarSign, CreditCard } from 'lucide-react';
import { toISOString } from '../../lib/utils/dateUtils';

export function PointOfSale() {
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [tables, setTables] = useState<Record<string, Table>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processingPayment, setProcessingPayment] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
    // Refresh data every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const db = await getDB();
      const [allOrders, allMenuItems, allTables] = await Promise.all([
        db.getAll('orders'),
        db.getAll('menu_items'),
        db.getAll('tables')
      ]);

      // Create lookup maps
      const menuItemsMap = Object.fromEntries(
        allMenuItems.map(item => [item.id, item])
      );
      const tablesMap = Object.fromEntries(
        allTables.map(table => [table.id, table])
      );

      // Filter orders that are not paid
      const unpaidOrders = allOrders.filter(
        order => order.paymentStatus !== 'paid'
      );

      setOrders(unpaidOrders);
      setMenuItems(menuItemsMap);
      setTables(tablesMap);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(order: Order, payment: Payment) {
    try {
      const db = await getDB();
      
      // Update order
      const updatedOrder = {
        ...order,
        paymentStatus: payment.status,
        updatedAt: toISOString(new Date())
      };
      
      await db.put('orders', updatedOrder);
      
      // Save payment
      await db.put('payments', {
        ...payment,
        createdAt: toISOString(new Date())
      });

      // If order is fully paid, update table status
      if (payment.status === 'paid') {
        const table = tables[order.tableId];
        if (table) {
          await db.put('tables', {
            ...table,
            status: 'available'
          });
        }
      }

      setProcessingPayment(null);
      loadData();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Point of Sale</h2>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Refresh Orders
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const table = tables[order.tableId];
          const orderAge = Math.floor(
            (Date.now() - new Date(order.createdAt).getTime()) / 60000
          );
          
          return (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-500"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Table {table?.number || order.tableId}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {orderAge} min ago
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'partially'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item) => {
                    const menuItem = menuItems[item.menuItemId];
                    return menuItem ? (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-gray-600">{menuItem.name}</span>
                          <span className="text-sm text-gray-400 mx-2">×</span>
                          <span className="text-gray-900">{item.quantity}</span>
                        </div>
                        <span className="text-gray-600">
                          ${(menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ) : null;
                  })}
                  <div className="pt-2 border-t flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setProcessingPayment(order)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders to process</h3>
            <p className="mt-1 text-sm text-gray-500">
              New orders will appear here when they're ready for payment
            </p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetails
          order={{
            ...selectedOrder,
            items: selectedOrder.items.map(item => ({
              ...item,
              menuItem: menuItems[item.menuItemId]
            }))
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {processingPayment && (
        <PaymentForm
          order={processingPayment}
          onSubmit={handlePayment}
          onCancel={() => setProcessingPayment(null)}
        />
      )}
    </div>
  );
}