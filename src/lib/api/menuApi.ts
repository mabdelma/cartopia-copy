import { supabase } from '@/integrations/supabase/client';
import type { MenuCategory, MenuItem } from '@/lib/db/schema';

export async function getCategories() {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('order');
  
  if (error) throw error;
  return data;
}

export async function saveCategory(category: MenuCategory) {
  const { data, error } = await supabase
    .from('menu_categories')
    .upsert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      main_category:menu_categories!main_category_id(*),
      sub_category:menu_categories!sub_category_id(*)
    `);
  
  if (error) throw error;
  return data;
}

export async function saveMenuItem(item: MenuItem) {
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(item)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}