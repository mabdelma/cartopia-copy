import { supabase } from '../../integrations/supabase/client';
import type { Order, OrderStatus } from '../db/schema';
import { toISOString } from './dateUtils';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'pending': ['preparing'],
  'preparing': ['ready'],
  'ready': ['delivered'],
  'delivered': []
};

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  // Validate the transition
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select()
    .eq('id', orderId)
    .single();

  if (fetchError) throw fetchError;
  if (!order) throw new Error('Order not found');

  const currentStatus = order.status;
  if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  // Update the order status
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({ 
      status: newStatus,
      updated_at: toISOString(new Date()),
      completed_at: newStatus === 'delivered' ? toISOString(new Date()) : null
    })
    .eq('id', orderId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updatedOrder;
}
