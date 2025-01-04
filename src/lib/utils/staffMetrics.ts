import { supabase } from '../../integrations/supabase/client';
import type { User, Order } from '../db/schema';

export async function getStaffMetrics(userId: string) {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .or(`kitchen_staff_id.eq.${userId},waiter_staff_id.eq.${userId},cashier_id.eq.${userId}`);

  if (ordersError) throw ordersError;

  const metrics = {
    ordersHandled: orders?.length || 0,
    avgServiceTime: calculateAverageServiceTime(orders || []),
    totalSales: calculateTotalSales(orders || []),
    rating: calculateRating(orders || [])
  };

  return metrics;
}

export async function updateStaffMetrics(userId: string, order?: Order) {
  try {
    const metrics = await getStaffMetrics(userId);
    
    // Update user metrics in the database
    const { error } = await supabase
      .from('users')
      .update({
        last_active: new Date().toISOString(),
        // Add any other metric updates here
      })
      .eq('id', userId);

    if (error) throw error;
    
    return metrics;
  } catch (error) {
    console.error('Failed to update staff metrics:', error);
    throw error;
  }
}

function calculateAverageServiceTime(orders: any[]): number {
  if (!orders.length) return 0;
  
  const totalTime = orders.reduce((sum, order) => {
    const start = new Date(order.created_at).getTime();
    const end = order.completed_at 
      ? new Date(order.completed_at).getTime()
      : Date.now();
    return sum + (end - start);
  }, 0);

  return Math.round(totalTime / orders.length / 1000 / 60); // Convert to minutes
}

function calculateTotalSales(orders: any[]): number {
  return orders.reduce((sum, order) => sum + (order.total || 0), 0);
}

function calculateRating(orders: any[]): number {
  const completedOrders = orders.filter(o => o.completed_at);
  if (!completedOrders.length) return 5;
  
  const complaintsCount = orders.filter(o => o.has_complaints).length;
  return Math.max(1, 5 - (complaintsCount / completedOrders.length) * 5);
}