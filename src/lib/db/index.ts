import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

class DB {
  async get<T extends TableName>(
    table: T,
    id: string
  ): Promise<Database['public']['Tables'][T]['Row']> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getAll<T extends TableName>(
    table: T
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) throw error;
    return data;
  }

  async put<T extends TableName>(
    table: T,
    item: Partial<Database['public']['Tables'][T]['Row']>
  ): Promise<Database['public']['Tables'][T]['Row']> {
    const { data, error } = await supabase
      .from(table)
      .upsert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete<T extends TableName>(
    table: T,
    id: string
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async add<T extends TableName>(
    table: T,
    item: Partial<Database['public']['Tables'][T]['Row']>
  ): Promise<Database['public']['Tables'][T]['Row']> {
    return this.put(table, item);
  }

  async clear<T extends TableName>(table: T): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', ''); // Delete all records

    if (error) throw error;
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    // Note: Supabase client doesn't support transactions directly
    // This is a placeholder for future implementation
    return callback();
  }
}

export const db = new DB();
export const getDB = () => db;