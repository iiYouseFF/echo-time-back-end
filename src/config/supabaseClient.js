import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

class SupabaseProvider {
    constructor() {
        if (!SupabaseProvider.instance) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.error("CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing in environment variables.");
                // Provide a dummy client or just log the error instead of crashing the whole process immediately
                // This allows the function to start and developers to see the error in logs instead of a 500.
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