import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

class SupabaseProvider {
    constructor() {
        if (!SupabaseProvider.instance) {
            const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
            const supabaseKey = (process.env.SUPABASE_ROLE_KEY || process.env.SUPABASE_KEY || '').trim().replace(/^['"]|['"]$/g, '');

            if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
                console.error("CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing or invalid in environment variables.");
                console.error("URL:", supabaseUrl);
                this.client = null;
            } else {
                this.client = createClient(supabaseUrl, supabaseKey);
            }
            SupabaseProvider.instance = this;
        }
        return SupabaseProvider.instance;
    }
    getClient(){
        return this.client;
    }
}
const instance = new SupabaseProvider();
export const supabase = instance.getClient();