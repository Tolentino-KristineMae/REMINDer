/**
 * Resolve Supabase anon / publishable key (Supabase dashboard naming varies).
 */
export function getSupabaseKey() {
    return (
        import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
        ''
    );
}

export function getSupabaseUrl() {
    return import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '') || '';
}

/**
 * Ping Supabase REST gateway (no table required). CORS must allow your Vercel origin.
 */
export async function checkSupabaseRest(url, anonKey) {
    if (!url || !anonKey) {
        return {
            ok: false,
            skipped: true,
            message: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) on Vercel.',
        };
    }

    try {
        const res = await fetch(`${url}/rest/v1/`, {
            method: 'GET',
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
            },
        });

        const reachable = res.status > 0;
        return {
            ok: reachable,
            skipped: false,
            httpStatus: res.status,
            message:
                res.status === 401 || res.status === 404 || res.status === 200
                    ? 'Supabase API responded (connection OK).'
                    : `HTTP ${res.status}`,
        };
    } catch (e) {
        return {
            ok: false,
            skipped: false,
            message: e instanceof Error ? e.message : 'Network error',
        };
    }
}
