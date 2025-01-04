import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

class DB {
  async get<T extends TableName>(
    table: T,
    id: string
  ): Promise<Row<T>> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error(`No record found in ${table} with id ${id}`);
    return data as Row<T>;
  }

  async getAll<T extends TableName>(
    table: T
  ): Promise<Row<T>[]> {
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) throw error;
    if (!data) return [];
    return data as Row<T>[];
  }

  async add<T extends TableName>(
    table: T,
    item: Insert<T>
  ): Promise<Row<T>> {
    const { data, error } = await supabase
      .from(table)
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Failed to insert into ${table}`);
    return data as Row<T>;
  }

  async put<T extends TableName>(
    table: T,
    item: Partial<Row<T>> & { id: string }
  ): Promise<Row<T>> {
    const { data, error } = await supabase
      .from(table)
      .update(item)
      .eq('id', item.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Failed to update ${table} with id ${item.id}`);
    return data as Row<T>;
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

  async clear<T extends TableName>(table: T): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '');

    if (error) throw error;
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return callback();
  }
}

export const db = new DB();
export const getDB = () => db;