import type { Database } from '../../integrations/supabase/types';

// Raw database types
export type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Helper type for converting snake_case to camelCase
type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

// Helper type for converting object keys from snake_case to camelCase
type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends object
    ? CamelCaseKeys<T[K]>
    : T[K];
};

// Export camelCase versions of types for frontend use
export type CamelCaseUser = CamelCaseKeys<User>;
export type CamelCaseOrder = CamelCaseKeys<Order>;
export type CamelCaseMenuItem = CamelCaseKeys<MenuItem>;
export type CamelCaseTable = CamelCaseKeys<Table>;
export type CamelCasePayment = CamelCaseKeys<Payment>;

// Extended types with relationships
export type OrderWithItems = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
};

export type OrderWithDetails = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
  table: Table;
  waiter?: User;
  kitchen_staff?: User;
  cashier?: User;
};

// Enums
export type CategoryType = Database['public']['Enums']['category_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type TableStatus = Database['public']['Enums']['table_status'];
export type UserRole = Database['public']['Enums']['user_role'];

// Type guards
export const isOrderWithDetails = (order: any): order is OrderWithDetails => {
  return order && Array.isArray(order.items);
};

export const isOrderWithItems = (order: any): order is OrderWithItems => {
  return order && Array.isArray(order.items);
};