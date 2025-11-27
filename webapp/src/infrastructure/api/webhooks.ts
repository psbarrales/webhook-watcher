export interface WebhookRequestSummary {
    id: string;
    method: string;
    path: string;
    createdAt: string;
}

export interface WebhookRequestDetail extends WebhookRequestSummary {
    headers: Record<string, unknown>;
    query: Record<string, unknown>;
    queryString?: string;
    body: unknown;
    ip?: string;
    webhookId: string;
    url?: string;
    protocol?: string;
    host?: string;
    origin?: string;
    referrer?: string;
    userAgent?: string;
    contentType?: string;
    contentLength?: number | null;
}

const inferApiBase = (): string => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL as string;
    if (typeof window !== 'undefined' && window.location.port === '5173') {
        return 'http://localhost:3000';
    }
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'http://localhost:3000';
};

const API_BASE = inferApiBase();

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
};

const createWebhook = async (): Promise<{ id: string; url: string }> => {
    return fetchJson('/webhooks', { method: 'POST' });
};

const listRequests = async (webhookId: string): Promise<WebhookRequestSummary[]> => {
    return fetchJson(`/webhooks/${webhookId}/requests`);
};

const getRequest = async (webhookId: string, requestId: string): Promise<WebhookRequestDetail> => {
    return fetchJson(`/webhooks/${webhookId}/requests/${requestId}`);
};

export const webhookApi = {
    createWebhook,
    listRequests,
    getRequest,
    apiBase: API_BASE,
};
