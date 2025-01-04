import { getDB } from '../db';
import type { Order, Payment, UserRole } from '../db/schema';

export interface StaffMetrics {
  ordersHandled: number;
  avgServiceTime: number;
  totalSales: number;
  rating: number;
}

export function calculateSpeedScore(avgTime: number, role: UserRole): number {
  const targetTimes = {
    waiter: 10,
    kitchen: 20,
    cashier: 5,
    admin: 15,
    customer: 0
  };
  const target = targetTimes[role] || 15;
  return Math.max(0, Math.min(100, (target / avgTime) * 100));
}

export function calculateEfficiencyScore(count: number, role: UserRole): number {
  const targetCounts = {
    waiter: 50,
    kitchen: 40,
    cashier: 60,
    admin: 45,
    customer: 0
  };
  const target = targetCounts[role] || 45;
  return Math.max(0, Math.min(100, (count / target) * 100));
}

export async function getStaffMetrics(userId: string): Promise<StaffMetrics> {
  const db = await getDB();
  const [orders, payments] = await Promise.all([
    db.getAll('orders'),
    db.getAll('payments')
  ]);

  const userOrders = orders.filter(order => 
    order.waiter_staff_id === userId ||
    order.kitchen_staff_id === userId ||
    order.cashier_id === userId
  );

  const serviceTimes = userOrders.map(order => {
    const start = new Date(order.created_at).getTime();
    const end = new Date(order.updated_at).getTime();
    return (end - start) / 60000; // minutes
  });

  const avgServiceTime = serviceTimes.length > 0
    ? serviceTimes.reduce((sum, time) => sum + time, 0) / serviceTimes.length
    : 0;

  const totalSales = userOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    ordersHandled: userOrders.length,
    avgServiceTime,
    totalSales,
    rating: calculateRating(userOrders)
  };
}

function calculateRating(orders: Order[]): number {
  if (orders.length === 0) return 0;
  
  const metrics = {
    completionTime: 0,
    accuracy: 0,
    volume: 0
  };

  // Calculate completion time score
  const avgTime = orders.reduce((sum, order) => {
    const time = (new Date(order.updated_at).getTime() - new Date(order.created_at).getTime()) / 60000;
    return sum + time;
  }, 0) / orders.length;
  metrics.completionTime = Math.min(1, 30 / avgTime) * 4;

  // Calculate accuracy score
  metrics.accuracy = orders.filter(o => !o.has_complaints).length / orders.length * 3;

  // Calculate volume score
  metrics.volume = Math.min(1, orders.length / 20) * 3;

  return metrics.completionTime + metrics.accuracy + metrics.volume;
}

export async function updateStaffMetrics(userId: string, order?: Order): Promise<void> {
  const db = await getDB();
  await db.put('users', {
    id: userId,
    last_active: new Date().toISOString()
  });
}