import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

class SupabaseProvider {
    constructor() {
        if (!SupabaseProvider.instance) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_KEY;

            this.client = createClient(supabaseUrl, supabaseKey);
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