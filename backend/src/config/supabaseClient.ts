import { createClient } from '@supabase/supabase-js';
import dotenv from './dotenvConfig';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Anonymous Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

