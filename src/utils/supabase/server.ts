import { createServerClient } from '@supabase/ssr'

export function createClient(cookieStore: any) {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() || []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set?.(name, value, options)
          })
        },
      },
    }
  )
}
