import type { Database } from '../../integrations/supabase/types';

// Convert snake_case to camelCase type
type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type CamelCaseObject<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends object
    ? CamelCaseObject<T[K]>
    : T[K];
};

// Raw database types with camelCase conversion
export type MenuCategory = CamelCaseObject<Database['public']['Tables']['menu_categories']['Row']>;
export type MenuItem = CamelCaseObject<Database['public']['Tables']['menu_items']['Row']>;
export type Order = CamelCaseObject<Database['public']['Tables']['orders']['Row']>;
export type OrderItem = CamelCaseObject<Database['public']['Tables']['order_items']['Row']>;
export type Payment = CamelCaseObject<Database['public']['Tables']['payments']['Row']>;
export type Table = CamelCaseObject<Database['public']['Tables']['tables']['Row']>;
export type User = CamelCaseObject<Database['public']['Tables']['users']['Row']>;

// Enums
export type CategoryType = Database['public']['Enums']['category_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type TableStatus = Database['public']['Enums']['table_status'];
export type UserRole = Database['public']['Enums']['user_role'];

// Extended types with relationships
export type OrderWithItems = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
};

export type OrderWithDetails = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
  table: Table;
  waiter?: User;
  kitchenStaff?: User;
  cashier?: User;
};

// Type guards
export const isOrderWithDetails = (order: unknown): order is OrderWithDetails => {
  return Boolean(order && typeof order === 'object' && 'items' in order);
};

export const isOrderWithItems = (order: unknown): order is OrderWithItems => {
  return Boolean(order && typeof order === 'object' && 'items' in order);
};