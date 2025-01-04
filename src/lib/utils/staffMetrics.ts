import { supabase } from '../../integrations/supabase/client';
import type { User } from '../db/schema';

export async function getStaffMetrics(userId: string) {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_items (*)
      )
    `)
    .or(`waiter_staff_id.eq.${userId},kitchen_staff_id.eq.${userId},cashier_id.eq.${userId}`);

  if (ordersError) throw ordersError;

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .in('order_id', orders?.map(o => o.id) || []);

  if (paymentsError) throw paymentsError;

  const metrics = {
    ordersHandled: orders?.length || 0,
    avgServiceTime: calculateAverageServiceTime(orders || []),
    totalSales: calculateTotalSales(payments || []),
    rating: calculateRating(orders || [])
  };

  return metrics;
}

function calculateAverageServiceTime(orders: any[]): number {
  if (!orders.length) return 0;
  
  const serviceTimes = orders
    .filter(order => order.completed_at)
    .map(order => {
      const start = new Date(order.created_at);
      const end = new Date(order.completed_at);
      return (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
    });

  return serviceTimes.length 
    ? serviceTimes.reduce((sum, time) => sum + time, 0) / serviceTimes.length
    : 0;
}

function calculateTotalSales(payments: any[]): number {
  return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
}

function calculateRating(orders: any[]): number {
  if (!orders.length) return 0;
  
  const completedOrders = orders.filter(order => order.completed_at);
  const complaintsCount = orders.filter(order => order.has_complaints).length;
  
  if (!completedOrders.length) return 0;
  
  return Math.max(0, Math.min(1, 1 - (complaintsCount / completedOrders.length)));
}