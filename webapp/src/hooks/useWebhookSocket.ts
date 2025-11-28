import { useEffect, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
    webhookApi,
    type WebhookRequestDetail,
    type WebhookRequestSummary,
} from "@infrastructure/api/webhooks";

type RequestCreatedMessage = {
    type: "request:created";
    data: {
        webhookId: string;
        summary: WebhookRequestSummary;
        request: WebhookRequestDetail;
    };
};

const useWebhookSocket = (webhookId: string | null) => {
    const queryClient = useQueryClient();
    const reconnectTimer = useRef<number>();

    useEffect(() => {
        if (!webhookId) return;
        let cancelled = false;
        let socket: WebSocket | null = null;

        const connect = () => {
            if (cancelled) return;
            try {
                const url = buildSocketUrl(webhookApi.apiBase, webhookId);
                const ws = new WebSocket(url);
                socket = ws;
                ws.onmessage = (event) => {
                    handleMessage(event.data, webhookId, queryClient);
                };
                ws.onerror = () => {
                    ws.close();
                };
                ws.onclose = () => {
                    if (cancelled) return;
                    reconnectTimer.current = window.setTimeout(connect, 2000);
                };
            } catch {
                reconnectTimer.current = window.setTimeout(connect, 3000);
            }
        };

        connect();

        return () => {
            cancelled = true;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            socket?.close();
        };
    }, [webhookId, queryClient]);
};

const handleMessage = (
    rawData: string | ArrayBufferLike | Blob | ArrayBufferView,
    webhookId: string,
    queryClient: QueryClient
) => {
    if (typeof rawData !== "string") return;
    try {
        const message = JSON.parse(rawData) as RequestCreatedMessage;
        if (message.type !== "request:created") return;
        const { summary, request } = message.data;
        if (message.data.webhookId !== webhookId) return;
        queryClient.setQueryData<WebhookRequestSummary[] | undefined>(
            ["webhook-requests", webhookId],
            (current = []) => {
                const filtered = current.filter((item) => item.id !== summary.id);
                return [summary, ...filtered];
            }
        );
        queryClient.setQueryData<WebhookRequestDetail | undefined>(
            ["webhook-request", webhookId, summary.id],
            request
        );
    } catch {
        // ignore malformed payloads
    }
};

const buildSocketUrl = (apiBase: string, webhookId: string): string => {
    const url = new URL("/ws", apiBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("webhookId", webhookId);
    return url.toString();
};

export { useWebhookSocket };
