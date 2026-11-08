// Public Supabase settings. Both values are safe to expose to the browser.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** When these are not set the app runs without login (as before). */
export const authConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
