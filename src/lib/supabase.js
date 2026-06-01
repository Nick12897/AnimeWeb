import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase env vars are missing. Auth features will be unavailable.");
}

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabaseKey || "public-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export function getPublicAppUrl() {
  const envUrl = import.meta.env.VITE_PUBLIC_WEB_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:5173";
}

export function buildAuthRedirectUrl(path = "/profile") {
  const baseUrl = getPublicAppUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path.replace(/^#?\/?/, "")}`;
  return `${baseUrl}/?auth_redirect=${encodeURIComponent(normalizedPath)}`;
}
