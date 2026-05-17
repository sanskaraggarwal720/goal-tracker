const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const managerId = '22222222-2222-2222-2222-222222222222';
  console.log('Querying for manager_id:', managerId);
  const { data, error } = await supabase.from('users').select('id, name, manager_id').eq('manager_id', managerId);
  if (error) console.error('Error:', error);
  else console.log('Direct reports:', data);
}

check();
