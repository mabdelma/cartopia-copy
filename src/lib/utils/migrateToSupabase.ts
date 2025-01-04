import { supabase } from '../../integrations/supabase/client';
import type { MenuCategory, MenuItem, Order, OrderItem, Payment, Table, User } from '../db/schema';

export async function migrateToSupabase(data: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  tables: Table[];
  users: User[];
}) {
  try {
    // Migrate categories
    const { error: categoriesError } = await supabase
      .from('menu_categories')
      .upsert(data.categories);
    if (categoriesError) throw categoriesError;

    // Migrate menu items
    const { error: menuItemsError } = await supabase
      .from('menu_items')
      .upsert(data.menuItems);
    if (menuItemsError) throw menuItemsError;

    // Migrate tables
    const { error: tablesError } = await supabase
      .from('tables')
      .upsert(data.tables);
    if (tablesError) throw tablesError;

    // Migrate users
    const { error: usersError } = await supabase
      .from('users')
      .upsert(data.users);
    if (usersError) throw usersError;

    // Migrate orders
    const { error: ordersError } = await supabase
      .from('orders')
      .upsert(data.orders);
    if (ordersError) throw ordersError;

    // Migrate order items
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .upsert(data.orderItems);
    if (orderItemsError) throw orderItemsError;

    // Migrate payments
    const { error: paymentsError } = await supabase
      .from('payments')
      .upsert(data.payments);
    if (paymentsError) throw paymentsError;

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}