import { supabase } from '../../integrations/supabase/client';
import type { Order } from '../db/schema';

interface StaffMetrics {
  ordersHandled: number;
  avgServiceTime: number;
  totalSales: number;
  rating: number;
  paymentMethods?: {
    card: number;
    cash: number;
    wallet: number;
  };
}

export function calculateSpeedScore(avgTime: number, role: string): number {
  const targetTimes = {
    waiter: 10,
    kitchen: 20,
    cashier: 5
  };
  const target = targetTimes[role as keyof typeof targetTimes] || 15;
  return Math.max(0, Math.min(100, (target / avgTime) * 100));
}

export function calculateEfficiencyScore(count: number, role: string): number {
  const targetCounts = {
    waiter: 50,
    kitchen: 40,
    cashier: 60
  };
  const target = targetCounts[role as keyof typeof targetCounts] || 45;
  return Math.max(0, Math.min(100, (count / target) * 100));
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
      rating: 0,
      paymentMethods: {
        card: 0,
        cash: 0,
        wallet: 0
      }
    };
  }

  const metrics = orders.reduce((acc, order) => ({
    ordersHandled: acc.ordersHandled + 1,
    totalSales: acc.totalSales + order.total,
    avgServiceTime: acc.avgServiceTime + (
      order.completed_at ? 
      (new Date(order.completed_at).getTime() - new Date(order.created_at).getTime()) / 60000 
      : 0
    ),
    rating: acc.rating // Not implemented yet
  }), {
    ordersHandled: 0,
    avgServiceTime: 0,
    totalSales: 0,
    rating: 0
  });

  metrics.avgServiceTime = metrics.avgServiceTime / orders.length;

  return {
    ...metrics,
    paymentMethods: {
      card: orders.filter(o => o.payment_status === 'card').length,
      cash: orders.filter(o => o.payment_status === 'cash').length,
      wallet: orders.filter(o => o.payment_status === 'wallet').length
    }
  };
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