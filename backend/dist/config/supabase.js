// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Check your .env file.');
}
export const supabase = createClient(supabaseUrl, supabaseKey);
export const getAuthenticatedUser = async (token) => {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error)
        throw error;
    return user;
};
