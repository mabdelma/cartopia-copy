import { supabase } from '../../integrations/supabase/client';
import type { 
  MenuCategory, MenuItem, Order, OrderItem, 
  Payment, Table, User 
} from './schema';

// Type-safe database operations
export async function get<T>(table: string, id: string): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as T;
}

export async function getAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*');
    
  if (error) throw error;
  return data as T[];
}

export async function put<T>(table: string, item: T): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .upsert(item)
    .select()
    .single();
    
  if (error) throw error;
  return data as T;
}

export async function remove(table: string, id: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Re-export functions with type safety
export const db = {
  get,
  getAll,
  put,
  delete: remove,
  add: put
};