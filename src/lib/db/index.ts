import { supabase } from '../../integrations/supabase/client';
import type { 
  MenuCategory, MenuItem, Order, OrderItem, 
  Payment, Table, User 
} from './schema';

export async function get(table: 'menu_categories', id: string): Promise<MenuCategory>;
export async function get(table: 'menu_items', id: string): Promise<MenuItem>;
export async function get(table: 'orders', id: string): Promise<Order>;
export async function get(table: 'order_items', id: string): Promise<OrderItem>;
export async function get(table: 'payments', id: string): Promise<Payment>;
export async function get(table: 'tables', id: string): Promise<Table>;
export async function get(table: 'users', id: string): Promise<User>;
export async function get(
  table: 'menu_categories' | 'menu_items' | 'orders' | 'order_items' | 'payments' | 'tables' | 'users',
  id: string
) {
  const { data, error } = await supabase
    .from(table)
    .select()
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAll(table: 'menu_categories'): Promise<MenuCategory[]>;
export async function getAll(table: 'menu_items'): Promise<MenuItem[]>;
export async function getAll(table: 'orders'): Promise<Order[]>;
export async function getAll(table: 'order_items'): Promise<OrderItem[]>;
export async function getAll(table: 'payments'): Promise<Payment[]>;
export async function getAll(table: 'tables'): Promise<Table[]>;
export async function getAll(table: 'users'): Promise<User[]>;
export async function getAll(
  table: 'menu_categories' | 'menu_items' | 'orders' | 'order_items' | 'payments' | 'tables' | 'users'
) {
  const { data, error } = await supabase.from(table).select();
  if (error) throw error;
  return data;
}

export async function put(table: 'menu_categories', item: MenuCategory): Promise<MenuCategory>;
export async function put(table: 'menu_items', item: MenuItem): Promise<MenuItem>;
export async function put(table: 'orders', item: Order): Promise<Order>;
export async function put(table: 'order_items', item: OrderItem): Promise<OrderItem>;
export async function put(table: 'payments', item: Payment): Promise<Payment>;
export async function put(table: 'tables', item: Table): Promise<Table>;
export async function put(table: 'users', item: User): Promise<User>;
export async function put(
  table: 'menu_categories' | 'menu_items' | 'orders' | 'order_items' | 'payments' | 'tables' | 'users',
  item: MenuCategory | MenuItem | Order | OrderItem | Payment | Table | User
) {
  const { data, error } = await supabase
    .from(table)
    .upsert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function remove(
  table: 'menu_categories' | 'menu_items' | 'orders' | 'order_items' | 'payments' | 'tables' | 'users',
  id: string
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Re-export getDB for backward compatibility
export const getDB = {
  get,
  getAll,
  put,
  delete: remove,
  add: put,
  clear: async (table: string) => {
    const { error } = await supabase.from(table).delete().neq('id', '');
    if (error) throw error;
  }
};