import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';

type TableName = keyof Tables['public']['Tables'];

class DB {
  async get<T extends TableName>(
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

  async getAll<T extends TableName>(
    table: T
  ): Promise<Tables['public']['Tables'][T]['Row'][]> {
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) throw error;
    return data;
  }

  async put<T extends TableName>(
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
    item: Partial<Tables['public']['Tables'][T]['Row']>
  ): Promise<Tables['public']['Tables'][T]['Row']> {
    return this.put(table, item);
  }
}

export const db = new DB();
export const getDB = () => db;