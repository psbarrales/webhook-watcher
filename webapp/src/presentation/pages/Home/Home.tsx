import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
    webhookApi,
    type WebhookRequestDetail,
    type WebhookRequestSummary
} from "@infrastructure/api/webhooks";
import WebhookResponseEditor from "./WebhookResponseEditor";
import { useWebhookSocket } from "@hooks/useWebhookSocket";

const STORAGE_KEY = "webhook-watcher:webhookId";

const getStoredWebhookId = (): string | null => {
    if (typeof window === "undefined") return null;
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) return fromStorage;
    const fromCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${STORAGE_KEY}=`));
    return fromCookie ? decodeURIComponent(fromCookie.split("=")[1]) : null;
};

const persistWebhookId = (id: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, id);
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 365}`;
};

const formatTime = (value: string) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString();
};

const pretty = (value: unknown) => {
    if (value === undefined || value === null) return "—";
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const getMethodClasses = (method: string) => {
    const m = method.toUpperCase();
    if (m === "GET") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (m === "POST") return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    if (m === "PUT") return "bg-amber-100 text-amber-700 border border-amber-200";
    if (m === "PATCH") return "bg-purple-100 text-purple-700 border border-purple-200";
    if (m === "DELETE") return "bg-rose-100 text-rose-700 border border-rose-200";
    return "bg-slate-100 text-slate-700 border border-slate-200";
};

const escapeSingleQuotes = (value: string) => value.replace(/'/g, "'\"'\"'");

const buildRequestUrl = (detail: WebhookRequestDetail) => {
    if (detail.url) return detail.url;

    const qs = detail.queryString ? `?${detail.queryString}` : "";

    if (detail.host) {
        const protocol = detail.protocol ?? "http";
        return `${protocol}://${detail.host}${detail.path}${qs}`;
    }

    return `${detail.path}${qs}`;
};

const buildCurlCommand = (detail: WebhookRequestDetail) => {
    const url = buildRequestUrl(detail);
    if (!url) return "";

    const parts: string[] = [`curl -X ${detail.method.toUpperCase()}`];

    Object.entries(detail.headers ?? {}).forEach(([key, rawValue]) => {
        if (rawValue === undefined || rawValue === null) return;
        const value = Array.isArray(rawValue) ? rawValue.join(", ") : typeof rawValue === "object" ? JSON.stringify(rawValue) : String(rawValue);
        parts.push(`-H '${key}: ${escapeSingleQuotes(value)}'`);
    });

    if (detail.body !== undefined && detail.body !== null && detail.body !== "") {
        const serializedBody =
            typeof detail.body === "string" ? detail.body : JSON.stringify(detail.body, null, 2);
        parts.push(`--data-raw '${escapeSingleQuotes(serializedBody)}'`);
    }

    parts.push(`'${escapeSingleQuotes(url)}'`);

    return parts.join(" \\\n+  ");
};

const Home: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams<{ webhookId?: string; requestId?: string }>();
    const routeWebhookId = params.webhookId ?? null;
    const routeRequestId = params.requestId ?? null;
    const queryClient = useQueryClient();
    const [webhookId, setWebhookId] = useState<string | null>(() => routeWebhookId ?? getStoredWebhookId());
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(() => routeRequestId);
    const [copied, setCopied] = useState(false);
    const [curlCopied, setCurlCopied] = useState(false);
    const [creating, setCreating] = useState(false);
    const [curlCollapsed, setCurlCollapsed] = useState(true);
    
    // Track if user manually selected a request to prevent auto-selection override
    const userSelectedRef = useRef(false);
    // Track if we're currently navigating to prevent loops
    const isNavigatingRef = useRef(false);

    const webhookUrl = useMemo(
        () => (webhookId ? `${webhookApi.webhookBase}/hooks/${webhookId}` : ""),
        [webhookId]
    );

    useEffect(() => {
        document.title = "Webhook Watcher";
    }, []);

    // Sync webhookId from route - only when route actually changes
    useEffect(() => {
        if (isNavigatingRef.current) return;
        if (routeWebhookId && routeWebhookId !== webhookId) {
            setWebhookId(routeWebhookId);
            persistWebhookId(routeWebhookId);
        }
    }, [routeWebhookId]);

    // Sync selectedRequestId from route - only when route actually changes
    useEffect(() => {
        if (isNavigatingRef.current) return;
        setSelectedRequestId(routeRequestId);
        if (routeRequestId) {
            userSelectedRef.current = true;
        }
    }, [routeRequestId]);

    // Bootstrap: create webhook if none exists
    useEffect(() => {
        const bootstrap = async () => {
            if (webhookId) {
                return;
            }
            setCreating(true);
            try {
                const { id } = await webhookApi.createWebhook();
                setWebhookId(id);
                persistWebhookId(id);
                isNavigatingRef.current = true;
                navigate(`/${id}`, { replace: true });
                setTimeout(() => { isNavigatingRef.current = false; }, 100);
            } catch (err) {
                console.error(err);
            } finally {
                setCreating(false);
            }
        };

        void bootstrap();
    }, [webhookId, navigate]);

    useWebhookSocket(webhookId);

    const requestsQuery = useQuery({
        queryKey: ["webhook-requests", webhookId],
        queryFn: () => webhookApi.listRequests(webhookId ?? ""),
        enabled: Boolean(webhookId),
    });

    // Auto-select first request only if user hasn't manually selected one and no selection exists
    useEffect(() => {
        if (!requestsQuery.data || requestsQuery.data.length === 0) return;
        if (userSelectedRef.current || selectedRequestId) return;
        
        const firstId = requestsQuery.data[0].id;
        setSelectedRequestId(firstId);
        if (webhookId) {
            isNavigatingRef.current = true;
            navigate(`/${webhookId}/requests/${firstId}`, { replace: true });
            setTimeout(() => { isNavigatingRef.current = false; }, 100);
        }
    }, [requestsQuery.data, webhookId, navigate]);

    const detailQuery = useQuery({
        queryKey: ["webhook-request", webhookId, selectedRequestId],
        queryFn: () => webhookApi.getRequest(webhookId ?? "", selectedRequestId ?? ""),
        enabled: Boolean(webhookId && selectedRequestId),
    });

    const curlCommand = useMemo(
        () => (detailQuery.data ? buildCurlCommand(detailQuery.data) : ""),
        [detailQuery.data]
    );

    const handleCopy = async () => {
        if (!webhookUrl) return;
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(webhookUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const handleResetWebhook = async () => {
        setCreating(true);
        userSelectedRef.current = false;
        try {
            const { id } = await webhookApi.createWebhook();
            persistWebhookId(id);
            setWebhookId(id);
            setSelectedRequestId(null);
            isNavigatingRef.current = true;
            navigate(`/${id}`, { replace: true });
            setTimeout(() => { isNavigatingRef.current = false; }, 100);
            await queryClient.invalidateQueries({ queryKey: ["webhook-requests"] });
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleCopyCurl = async () => {
        if (!curlCommand) return;
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(curlCommand);
            setCurlCopied(true);
            setTimeout(() => setCurlCopied(false), 1500);
        }
    };

    const hasRequests = (requestsQuery.data?.length ?? 0) > 0;

    const handleSelectRequest = (requestId: string) => {
        userSelectedRef.current = true;
        setSelectedRequestId(requestId);
        if (webhookId) {
            isNavigatingRef.current = true;
            navigate(`/${webhookId}/requests/${requestId}`);
            setTimeout(() => { isNavigatingRef.current = false; }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <header className="border-b border-slate-200 bg-white/90">
                <div className="flex items-center justify-between px-5 py-4 lg:px-8">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Webhook Watcher</p>
                        <p className="text-base font-semibold text-slate-900">Incoming requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResetWebhook}
                            disabled={creating}
                            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creating ? "Generating..." : "New webhook"}
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={!webhookUrl}
                            className="rounded-md border border-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                        >
                            Copy URL
                        </button>
                    </div>
                </div>
            </header>

            <main className="grid min-h-[calc(100vh-72px)] grid-cols-1 sm:grid-cols-[280px_1fr]">
                <aside className="flex min-h-full flex-col border-r border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Active webhook</p>
                        <p className="mt-1 break-all font-mono text-sm text-slate-900">{webhookUrl || "Generating webhook..."}</p>
                        <p className="mt-1 text-xs text-slate-500">Send any request to the URL. It will be stored for analysis.</p>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-600">
                        <p className="font-semibold uppercase tracking-[0.12em]">Requests</p>
                        {requestsQuery.isFetching ? (
                            <span className="font-semibold text-slate-700">Refreshing…</span>
                        ) : (
                            <span className="font-semibold text-slate-500">
                                {requestsQuery.data?.length ?? 0} items
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-auto px-3 pb-4">
                        {requestsQuery.error && (
                            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                We couldn't load the list. Retrying...
                            </div>
                        )}
                        {!hasRequests && (
                            <div className="mt-2 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                No traffic yet. Send a webhook to the URL to see activity.
                            </div>
                        )}
                        <div className="space-y-2">
                            {(requestsQuery.data ?? []).map((item: WebhookRequestSummary) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectRequest(item.id)}
                                    className={`group flex w-full flex-col rounded-lg border px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50 ${selectedRequestId === item.id ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`rounded-sm px-2 py-1 text-[11px] font-semibold uppercase ${getMethodClasses(item.method)}`}>
                                            {item.method}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-500">{formatTime(item.createdAt)}</span>
                                    </div>
                                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">{item.path}</p>
                                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                                        <span>id: {item.id.slice(0, 10)}…</span>
                                        <span className="text-slate-700 opacity-0 transition group-hover:opacity-100">View →</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <section className="flex-1 overflow-auto bg-white px-4 py-6 md:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Detail</p>
                            <h1 className="text-xl font-semibold text-slate-900">
                                {selectedRequestId ? "Webhook activity" : "Waiting for traffic"}
                            </h1>
                            <p className="text-sm text-slate-500">Refreshes every 4 seconds while requests arrive.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <StatPill label="Total" value={(requestsQuery.data?.length ?? 0).toString()} />
                            <StatPill label="Latest" value={requestsQuery.data?.[0]?.createdAt ? formatTime(requestsQuery.data?.[0]?.createdAt ?? "") : "—"} />
                        </div>
                    </div>

                    <div className="mt-3">
                        <WebhookResponseEditor webhookId={webhookId} />
                    </div>

                    {!selectedRequestId && (
                        <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                            Send any payload to your webhook URL to see it here.
                        </div>
                    )}

                    {detailQuery.error && (
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                            We couldn't load the request details. Try again in a few seconds.
                        </div>
                    )}

                    {detailQuery.data && (
                        <div className="mt-3 space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <InfoCard
                                    title="Path"
                                    subtitle={`${detailQuery.data.method} · ${formatTime(detailQuery.data.createdAt)}`}
                                    value={detailQuery.data.path}
                                />
                                <InfoCard
                                    title="Client"
                                    subtitle="IP reported by the request"
                                    value={detailQuery.data.ip ?? "Unknown"}
                                />
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoCard title="Webhook ID" value={detailQuery.data.webhookId} />
                                <InfoCard title="Request ID" value={detailQuery.data.id} />
                                <InfoCard title="Host" value={detailQuery.data.host || (detailQuery.data.headers?.host ? String(detailQuery.data.headers.host) : "—")} />
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Metadata</p>
                                <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                    <MetaRow label="URL" value={detailQuery.data.url || "—"} />
                                    <MetaRow label="Origin" value={detailQuery.data.origin || "—"} />
                                    <MetaRow label="Protocol" value={detailQuery.data.protocol || "—"} />
                                    <MetaRow label="Referrer" value={detailQuery.data.referrer || "—"} />
                                    <MetaRow label="User Agent" value={detailQuery.data.userAgent || "—"} />
                                    <MetaRow label="Content-Type" value={detailQuery.data.contentType || "—"} />
                                    <MetaRow label="Content-Length" value={detailQuery.data.contentLength !== null && detailQuery.data.contentLength !== undefined ? `${detailQuery.data.contentLength} bytes` : "—"} />
                                    <MetaRow label="Query String" value={detailQuery.data.queryString || "—"} />
                                </div>
                            </div>

                            {curlCommand && (
                                <div className="rounded-lg border border-slate-200 bg-white p-3">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Request cURL</p>
                                            <p className="text-sm text-slate-600">Replay this request from your terminal.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCurlCollapsed((prev) => !prev)}
                                                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                                            >
                                                {curlCollapsed ? "Expand" : "Collapse"}
                                            </button>
                                            {curlCopied && (
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">Copied</span>
                                            )}
                                            <button
                                                onClick={handleCopyCurl}
                                                className="rounded-md border border-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                                            >
                                                Copy cURL
                                            </button>
                                        </div>
                                    </div>
                                    {!curlCollapsed && (
                                        <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-900">
                                            {curlCommand}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <DataBlock title="Headers" value={detailQuery.data.headers} />
                                <DataBlock title="Query Params" value={detailQuery.data.query} />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Body</p>
                                <pre className="mt-2 max-h-[400px] overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900">
                                    {pretty(detailQuery.data.body)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {copied && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            URL copied to clipboard
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 break-all text-sm text-slate-900">{value}</p>
    </div>
);

const DataBlock: React.FC<{ title: string; value: Record<string, unknown> }> = ({ title, value }) => (
    <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <pre className="mt-2 max-h-48 overflow-auto text-sm text-slate-900">
            {pretty(value)}
        </pre>
    </div>
);

const InfoCard: React.FC<{ title: string; subtitle?: string; value: string }> = ({ title, subtitle, value }) => (
    <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <p className="mt-2 break-all text-sm font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
);

const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
        <span className="mr-1 text-slate-900">{value}</span>
        {label}
    </div>
);

export default Home;
