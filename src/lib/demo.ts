/**
 * Demo mode — activated automatically when Supabase env vars are missing.
 * Allows the app to run locally without any API keys for UI previewing.
 */

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export const DEMO_USER = {
  id: "demo-user-00000000-0000-0000-0000-000000000000",
  email: "demo@soulful.app",
} as const;
