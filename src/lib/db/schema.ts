import type { Database } from '../../integrations/supabase/types';

// Raw database types
export type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Enums
export type CategoryType = Database['public']['Enums']['category_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type TableStatus = Database['public']['Enums']['table_status'];
export type UserRole = Database['public']['Enums']['user_role'];

// Extended types
export type OrderWithDetails = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
  table: Table;
  waiter?: User;
  kitchen_staff?: User;
  cashier?: User;
};

export type PaymentWithOrder = Payment & {
  order: Order;
};