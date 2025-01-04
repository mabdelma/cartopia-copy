import { getDB } from '../db';
import type { Order } from '../db/schema';

export interface StaffMetrics {
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
  const db = await getDB();
  const orders = await db.getAll('orders');
  const userOrders = orders.filter(order => 
    order.waiter_staff_id === userId || 
    order.kitchen_staff_id === userId || 
    order.cashier_id === userId
  );

  if (userOrders.length === 0) {
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

  const metrics = userOrders.reduce((acc, order) => ({
    ordersHandled: acc.ordersHandled + 1,
    totalSales: acc.totalSales + order.total,
    avgServiceTime: acc.avgServiceTime + (
      order.completed_at ? 
      (new Date(order.completed_at).getTime() - new Date(order.created_at).getTime()) / 60000 
      : 0
    ),
    rating: acc.rating
  }), {
    ordersHandled: 0,
    avgServiceTime: 0,
    totalSales: 0,
    rating: 0
  });

  metrics.avgServiceTime = metrics.avgServiceTime / userOrders.length;

  const payments = await db.getAll('payments');
  const orderPayments = payments.filter(p => 
    userOrders.some(o => o.id === p.order_id)
  );

  return {
    ...metrics,
    paymentMethods: {
      card: orderPayments.filter(p => p.method === 'card').length,
      cash: orderPayments.filter(p => p.method === 'cash').length,
      wallet: orderPayments.filter(p => p.method === 'wallet').length
    }
  };
}

export async function updateStaffMetrics(userId: string, order?: Order): Promise<void> {
  // This function will be implemented when needed
  // It should update metrics in real-time when orders change
}