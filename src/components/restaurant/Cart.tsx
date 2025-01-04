import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getDB } from '../../lib/db';
import type { Order } from '../../lib/db/schema';
import { toISOString } from '../../lib/utils/dateUtils';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

export function Cart() {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const total = cartState.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function handleQuantityChange(itemId: string, change: number) {
    const item = cartState.items.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      cartDispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } else {
      cartDispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: itemId, quantity: newQuantity }
      });
    }
  }

  async function handleCreateOrder() {
    if (!authState.user || !cartState.tableId) return;

    try {
      const db = await getDB();
      const orderData: Order = {
        id: crypto.randomUUID(),
        tableId: cartState.tableId,
        items: cartState.items.map(item => ({
          id: crypto.randomUUID(),
          menuItemId: item.id,
          quantity: item.quantity,
          notes: item.notes || null
        })),
        total,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: toISOString(new Date()),
        updatedAt: toISOString(new Date()),
        waiterStaffId: authState.user.id,
        kitchenStaffId: null,
        cashierId: null,
        hasComplaints: false
      };

      await db.put('orders', orderData);
      cartDispatch({ type: 'CLEAR_CART' });
      navigate('/restaurant/order-confirmation');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-[#8B4513] text-white p-4 rounded-full shadow-lg hover:bg-[#5C4033] transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartState.items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {cartState.items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
              {cartState.tableId && (
                <p className="text-sm text-gray-500">Table {cartState.tableId}</p>
              )}
            </div>

            {cartState.items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Your cart is empty
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-gray-600">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            cartDispatch({
                              type: 'REMOVE_ITEM',
                              payload: item.id
                            })
                          }
                          className="p-1 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-xl font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    className="w-full bg-[#8B4513] text-white py-2 px-4 rounded-md hover:bg-[#5C4033] transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}