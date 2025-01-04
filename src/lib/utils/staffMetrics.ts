import { supabase } from '../../integrations/supabase/client';
import type { User } from '../db/schema';

export async function getStaffMetrics(userId: string) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .or(`waiter_staff_id.eq.${userId},kitchen_staff_id.eq.${userId},cashier_id.eq.${userId}`);

  if (error) throw error;

  return {
    ordersHandled: orders.length,
    avgServiceTime: calculateAverageServiceTime(orders),
    totalSales: calculateTotalSales(orders),
    rating: calculateStaffRating(orders)
  };
}

export async function updateStaffMetrics(userId: string) {
  const metrics = await getStaffMetrics(userId);
  
  const { error } = await supabase
    .from('users')
    .update({ metrics })
    .eq('id', userId);
    
  if (error) throw error;
}

function calculateAverageServiceTime(orders: any[]) {
  if (orders.length === 0) return 0;
  
  const serviceTimes = orders.map(order => {
    const start = new Date(order.created_at).getTime();
    const end = new Date(order.completed_at || order.updated_at).getTime();
    return (end - start) / 60000; // minutes
  });
  
  return serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length;
}

function calculateTotalSales(orders: any[]) {
  return orders.reduce((sum, order) => sum + (order.total || 0), 0);
}

function calculateStaffRating(orders: any[]) {
  if (orders.length === 0) return 0;
  
  const completionScore = calculateCompletionScore(orders);
  const accuracyScore = calculateAccuracyScore(orders);
  const volumeScore = calculateVolumeScore(orders.length);
  
  return (completionScore + accuracyScore + volumeScore) / 3;
}

function calculateCompletionScore(orders: any[]) {
  const avgCompletionTime = calculateAverageServiceTime(orders);
  return Math.min(1, 30 / avgCompletionTime) * 5;
}

function calculateAccuracyScore(orders: any[]) {
  const accurateOrders = orders.filter(o => !o.has_complaints).length;
  return (accurateOrders / orders.length) * 5;
}

function calculateVolumeScore(orderCount: number) {
  return Math.min(1, orderCount / 20) * 5;
}