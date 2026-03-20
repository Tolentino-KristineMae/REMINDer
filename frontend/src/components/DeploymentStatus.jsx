import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Database, Globe, Server, Wifi, WifiOff } from 'lucide-react';
import { checkSupabaseRest, getSupabaseKey, getSupabaseUrl } from '../lib/deploymentChecks';

const apiBaseDisplay = () => {
    const raw = import.meta.env.VITE_API_BASE_URL?.trim();
    if (raw) {
        return raw.replace(/\/+$/, '');
    }
    if (import.meta.env.DEV) {
        return 'http://localhost:8000/api';
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }
    return '(unknown)';
};

const DeploymentStatus = () => {
    const [loading, setLoading] = useState(true);
    const [backend, setBackend] = useState(null);
    const [supabase, setSupabase] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const base = apiBaseDisplay();
            const client = axios.create({
                baseURL: base,
                headers: { Accept: 'application/json' },
                timeout: 20000,
            });

            const [hRes, sRes] = await Promise.allSettled([
                client.get('/health'),
                client.get('/status'),
            ]);

            const health = hRes.status === 'fulfilled' ? hRes.value : null;
            const status = sRes.status === 'fulfilled' ? sRes.value : null;
            const healthError =
                hRes.status === 'rejected'
                    ? hRes.reason?.message || 'Could not load /api/health'
                    : null;
            const statusError =
                sRes.status === 'rejected'
                    ? sRes.reason?.message || 'Could not load /api/status'
                    : null;

            const sbUrl = getSupabaseUrl();
            const sbKey = getSupabaseKey();
            const sbResult = await checkSupabaseRest(sbUrl, sbKey);

            if (!cancelled) {
                setBackend({
                    baseUrl: base,
                    health: health?.data ?? null,
                    healthError: health ? null : healthError,
                    status: status?.data ?? null,
                    statusError: status ? null : statusError,
                });
                setSupabase(sbResult);
                setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, []);

    const dbOk = backend?.health?.checks?.database?.connected === true;

    return (
        <div className="min-h-screen bg-[#f0fdf4] p-6 md:p-10">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-600/25">
                        <Activity size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Deployment status</h1>
                        <p className="text-xs text-gray-500 font-medium">
                            Sinusuri ang backend (Render), database (Supabase Postgres), at Supabase API mula sa browser.
                        </p>
                    </div>
                </div>

                <p className="text-[11px] text-gray-400 mb-6">
                    <Link to="/login" className="text-green-600 font-bold hover:underline">
                        Bumalik sa login
                    </Link>
                </p>

                {loading ? (
                    <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center text-sm font-bold text-gray-400">
                        Tinitingnan ang mga connection…
                    </div>
                ) : (
                    <div className="space-y-4">
                        <section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <Server size={14} />
                                Backend API
                            </div>
                            <p className="text-xs font-mono text-gray-600 break-all mb-3">{backend?.baseUrl}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                                        backend?.health ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                    }`}
                                >
                                    {backend?.health ? <Wifi size={12} /> : <WifiOff size={12} />}
                                    /api/health — {backend?.health ? 'OK' : 'FAIL'}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                                        backend?.status ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                    }`}
                                >
                                    /api/status — {backend?.status ? 'OK' : 'walang sagot'}
                                </span>
                            </div>
                            {backend?.healthError && (
                                <p className="text-xs text-red-600 font-medium">{backend.healthError}</p>
                            )}
                            {backend?.health && (
                                <pre className="mt-3 text-[10px] font-mono bg-gray-50 rounded-xl p-3 overflow-x-auto text-gray-700">
                                    {JSON.stringify(backend.health, null, 2)}
                                </pre>
                            )}
                        </section>

                        <section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <Database size={14} />
                                Database (Laravel → Supabase Postgres)
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                                Ang Laravel backend ang gumagamit ng database. Dapat naka-set ang{' '}
                                <code className="bg-gray-100 px-1 rounded">DATABASE_URL</code> o{' '}
                                <code className="bg-gray-100 px-1 rounded">DB_*</code> sa Render tungo sa Supabase.
                            </p>
                            <div
                                className={`inline-flex items-center gap-2 text-sm font-black px-3 py-2 rounded-xl ${
                                    dbOk ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                }`}
                            >
                                {dbOk ? 'Nakakonekta ang backend sa database' : 'Hindi makakonekta ang backend sa database'}
                            </div>
                            {backend?.health?.checks?.database?.error && (
                                <p className="text-xs text-red-600 mt-2 font-medium">
                                    {backend.health.checks.database.error}
                                </p>
                            )}
                        </section>

                        <section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <Globe size={14} />
                                Supabase (mula sa browser / Vercel)
                            </div>
                            <p className="text-xs font-mono text-gray-600 break-all mb-2">
                                {getSupabaseUrl() || '(walang VITE_SUPABASE_URL)'}
                            </p>
                            {supabase?.skipped ? (
                                <p className="text-xs text-amber-700 font-medium">{supabase.message}</p>
                            ) : (
                                <>
                                    <div
                                        className={`inline-flex items-center gap-2 text-sm font-black px-3 py-2 rounded-xl ${
                                            supabase?.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                        }`}
                                    >
                                        {supabase?.ok
                                            ? 'Naabot ang Supabase REST mula sa browser'
                                            : 'Hindi naabot ang Supabase mula sa browser'}
                                    </div>
                                    {supabase?.httpStatus != null && (
                                        <p className="text-[11px] text-gray-500 mt-2">
                                            HTTP {supabase.httpStatus} — {supabase.message}
                                        </p>
                                    )}
                                    {!supabase?.ok && !supabase?.httpStatus && (
                                        <p className="text-xs text-red-600 mt-2">{supabase?.message}</p>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                                        Kung &quot;Failed to fetch&quot; o CORS: sa Supabase Dashboard → Settings → API,
                                        idagdag ang Vercel URL sa allowed origins (kung may setting).
                                    </p>
                                </>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeploymentStatus;
