import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://grlicywrvkyeowsmbtaz.supabase.co';
const FALLBACK_KEY = 'sb_publishable_x6t-30T8kF99j27tQTgagw_MkZgN3iY';

export function createPublicServerClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
