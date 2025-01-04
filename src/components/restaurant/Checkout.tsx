import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { generateOrderId } from '@/lib/utils/orderUtils';

export function Checkout() {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      const orderId = generateOrderId();
      const now = new Date().toISOString(); // Convert Date to ISO string

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            id: orderId,
            table_id: cartState.tableId,
            status: 'pending',
            payment_status: 'unpaid',
            total: cartState.total,
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cartState.items.map((item) => ({
        order_id: orderId,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        notes: item.comment,
        created_at: now,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful checkout
      cartDispatch({ type: 'CLEAR_CART' });
      
      // Navigate to orders page
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        {cartState.items.map((item) => (
          <div key={item.menuItem.id} className="flex justify-between mb-2">
            <span>{item.quantity}x {item.menuItem.name}</span>
            <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${cartState.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleCheckout}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        disabled={cartState.items.length === 0}
      >
        Complete Order
      </button>
    </div>
  );
}