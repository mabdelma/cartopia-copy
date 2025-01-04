import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';

type TableName = keyof Tables['public']['Tables'];

export async function get<T extends TableName>(
  table: T,
  id: string
): Promise<Tables['public']['Tables'][T]['Row']> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAll<T extends TableName>(
  table: T
): Promise<Tables['public']['Tables'][T]['Row'][]> {
  const { data, error } = await supabase
    .from(table)
    .select('*');

  if (error) throw error;
  return data;
}

export async function put<T extends TableName>(
  table: T,
  item: Partial<Tables['public']['Tables'][T]['Row']>
): Promise<Tables['public']['Tables'][T]['Row']> {
  const { data, error } = await supabase
    .from(table)
    .upsert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function remove<T extends TableName>(
  table: T,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export const db = {
  get,
  getAll,
  put,
  delete: remove,
  add: put
};

export { db as getDB };