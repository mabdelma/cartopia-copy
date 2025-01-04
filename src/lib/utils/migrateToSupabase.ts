import { getDB } from '../db';
import { supabase } from '@/integrations/supabase/client';

export async function migrateToSupabase() {
  const db = await getDB();
  
  // Migrate categories
  const categories = await db.getAll('menu_categories');
  if (categories.length > 0) {
    const { error: categoryError } = await supabase
      .from('menu_categories')
      .upsert(categories);
    
    if (categoryError) {
      console.error('Failed to migrate categories:', categoryError);
      return;
    }
  }

  // Migrate menu items
  const menuItems = await db.getAll('menu_items');
  if (menuItems.length > 0) {
    const { error: menuError } = await supabase
      .from('menu_items')
      .upsert(menuItems);
    
    if (menuError) {
      console.error('Failed to migrate menu items:', menuError);
      return;
    }
  }

  console.log('Migration completed successfully');
}