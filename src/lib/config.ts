export const useSupabaseAuth = process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'true';
export const useSupabaseDb = process.env.NEXT_PUBLIC_USE_SUPABASE_DB === 'true';

export const authProvider = useSupabaseAuth ? 'supabase' : 'nextauth';
export const authProviderClient = authProvider;
