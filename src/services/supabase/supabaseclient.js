/**
 * Supabase client configuration
 *
 * @module services/supabase/supabaseclient
 */

import {createClient} from "@supabase/supabase-js";

/**
 * Supabase URL from environment variables
 * @type {string}
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase API key from environment variables
 * @type {string}
 */

/**
 * Environment validation
 */
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Supabase URL of Anon Key ontbreekt. Controleer de environment variables.',
        {supabaseUrl, supabaseAnonKey}
    );
}

/**
 * Supabase client instance
 *
 * Used for authentication and data access throughout the application.
 *
 * @type {SupabaseClient}
 */


const SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // Default
        autoRefreshToken: true, // Default
        detectSessionInUrl: true, // Default
    }
});

export default SupabaseClient;
