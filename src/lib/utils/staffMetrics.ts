import { supabase } from '../../integrations/supabase/client';
import type { Order } from '../db/schema';

interface StaffMetrics {
  ordersHandled: number;
  avgServiceTime: number;
  totalSales: number;
  rating: number;
}

export async function getStaffMetrics(userId: string): Promise<StaffMetrics> {
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .or(`kitchen_staff_id.eq.${userId},waiter_staff_id.eq.${userId},cashier_id.eq.${userId}`);

  if (!orders?.length) {
    return {
      ordersHandled: 0,
      avgServiceTime: 0,
      totalSales: 0,
      rating: 0
    };
  }

  const metrics = orders.reduce((acc, order) => {
    return {
      ordersHandled: acc.ordersHandled + 1,
      totalSales: acc.totalSales + order.total,
      avgServiceTime: acc.avgServiceTime + (
        order.completed_at ? 
        (new Date(order.completed_at).getTime() - new Date(order.created_at).getTime()) / 60000 
        : 0
      ),
      rating: acc.rating // Not implemented yet
    };
  }, {
    ordersHandled: 0,
    avgServiceTime: 0,
    totalSales: 0,
    rating: 0
  });

  metrics.avgServiceTime = metrics.avgServiceTime / orders.length;

  return metrics;
}

export async function updateStaffMetrics(userId: string, order?: Order): Promise<void> {
  const metrics = await getStaffMetrics(userId);
  
  const { error } = await supabase
    .from('users')
    .update({
      last_active: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}