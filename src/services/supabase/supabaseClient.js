/**
 * Supabase client configuration
 *
 * @module services/supabase/supabaseClient
 */

import {createClient} from "@supabase/supabase-js";

/**
 * Supabase URL from environment variables
 * @type {string}
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/**
 * Supabase API key from environment variables
 * @type {string}
 */

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


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
 * @type {supabaseClient}
 */
export function createSupabaseClient() {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    });
}

// Default export of the Supabase client instance for use in other parts of the application
const supabaseClient = createSupabaseClient();
export default supabaseClient;