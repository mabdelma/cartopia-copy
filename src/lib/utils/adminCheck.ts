import { supabase } from '../../integrations/supabase/client';

export async function checkForExistingAdmin(): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1);
    
  if (error) throw error;
  return data && data.length > 0;
}

export async function createInitialAdmin(email: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .insert({
      email,
      name,
      role: 'admin'
    });
    
  if (error) throw error;
}