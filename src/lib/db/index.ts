import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

// Helper function to convert snake_case to camelCase
function toCamelCase<T extends Record<string, any>>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }
  
  return obj;
}

// Helper function to convert camelCase to snake_case
function toSnakeCase<T extends Record<string, any>>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }
  
  return obj;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) {
      console.error('Operation failed after all retry attempts:', error);
      throw error;
    }

    console.warn(`Operation failed, retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

class DB {
  async get<T extends TableName>(
    table: T,
    id: string
  ): Promise<Row<T> | null> {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();  // Changed from .single() to .maybeSingle()

      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        throw error;
      }
      
      return data ? toCamelCase(data) as Row<T> : null;
    });
  }

  async getAll<T extends TableName>(
    table: T
  ): Promise<Row<T>[]> {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.error(`Error fetching all from ${table}:`, error);
        throw error;
      }
      if (!data) return [];
      return toCamelCase(data) as Row<T>[];
    });
  }

  async add<T extends TableName>(
    table: T,
    item: Insert<T>
  ): Promise<Row<T>> {
    return retryOperation(async () => {
      const snakeCaseItem = toSnakeCase(item);
      const { data, error } = await supabase
        .from(table)
        .insert(snakeCaseItem)
        .select()
        .single();

      if (error) {
        console.error(`Error inserting into ${table}:`, error);
        throw error;
      }
      if (!data) throw new Error(`Failed to insert into ${table}`);
      return toCamelCase(data) as Row<T>;
    });
  }

  async put<T extends TableName>(
    table: T,
    item: Partial<Row<T>> & { id: string }
  ): Promise<Row<T>> {
    return retryOperation(async () => {
      const snakeCaseItem = toSnakeCase(item);
      const { data, error } = await supabase
        .from(table)
        .update(snakeCaseItem)
        .eq('id', item.id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${table}:`, error);
        throw error;
      }
      if (!data) throw new Error(`Failed to update ${table} with id ${item.id}`);
      return toCamelCase(data) as Row<T>;
    });
  }

  async delete<T extends TableName>(
    table: T,
    id: string
  ): Promise<void> {
    return retryOperation(async () => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        throw error;
      }
    });
  }

  async clear<T extends TableName>(table: T): Promise<void> {
    return retryOperation(async () => {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '');

      if (error) {
        console.error(`Error clearing ${table}:`, error);
        throw error;
      }
    });
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return retryOperation(async () => {
      return callback();
    });
  }
}

export const db = new DB();
export const getDB = () => db;
