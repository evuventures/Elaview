import { createServerClient, type CookieOptions } from "@supabase/ssr";// Correct import
import { cookies } from "next/headers";

interface Cookie {
  name: string;
  value: string;
  options?: CookieOptions;
}

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        async getAll() {
          const store = await cookieStore;
          return store.getAll();
        },
        async setAll(cookiesToSet: Cookie[]) {
          try {
            const store = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};