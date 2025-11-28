import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    webhookApi,
    type UpdateWebhookPayload,
    type WebhookConfig,
    type WebhookResponseRule,
} from "@infrastructure/api/webhooks";

interface Props {
    webhookId: string | null;
}

interface EditableRule {
    id: string;
    method: string;
    subPath: string;
    status: number;
    contentType: string;
    bodyText: string;
}

const METHOD_OPTIONS = ["ANY", "GET", "POST", "PUT", "PATCH", "DELETE"];

const WebhookResponseEditor: React.FC<Props> = ({ webhookId }) => {
    const queryClient = useQueryClient();
    const [rules, setRules] = useState<EditableRule[]>([]);
    const [dirty, setDirty] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const enabled = Boolean(webhookId);

    const configQuery = useQuery({
        queryKey: ["webhook-config", webhookId],
        queryFn: () => webhookApi.getWebhook(webhookId ?? ""),
        enabled,
        staleTime: 1000 * 30,
    });

    useEffect(() => {
        if (!configQuery.data) return;
        setRules(configQuery.data.responses.map(mapRuleToEditable));
        setDirty(false);
    }, [configQuery.data]);

    const mutation = useMutation({
        mutationFn: (payload: UpdateWebhookPayload) => {
            if (!webhookId) throw new Error("No se ha generado el webhook todavía.");
            return webhookApi.updateWebhook(webhookId, payload);
        },
        onSuccess: (data: WebhookConfig) => {
            queryClient.setQueryData(["webhook-config", webhookId], data);
            setRules(data.responses.map(mapRuleToEditable));
            setDirty(false);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        },
    });

    const hasRules = rules.length > 0;

    const handleAddRule = () => {
        setRules((prev) => [
            ...prev,
            {
                id: generateClientId(),
                method: "ANY",
                subPath: "*",
                status: 200,
                contentType: "application/json",
                bodyText: '{\n  "fixed": true\n}',
            },
        ]);
        setDirty(true);
    };

    const handleRemoveRule = (ruleId: string) => {
        setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
        setDirty(true);
    };

    const handleRuleChange = (ruleId: string, patch: Partial<EditableRule>) => {
        setRules((prev) =>
            prev.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
        );
        setDirty(true);
    };

    const payload = useMemo<UpdateWebhookPayload>(() => {
        return {
            responses: rules.map((rule) => ({
                id: rule.id,
                method: rule.method,
                subPath: rule.subPath,
                status: rule.status,
                contentType: rule.contentType.trim() ? rule.contentType.trim() : null,
                body: parseBody(rule.bodyText),
            })),
        };
    }, [rules]);

    const handleSave = () => {
        if (!dirty || !webhookId) return;
        mutation.mutate(payload);
    };

    if (!enabled) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">Respuesta fija</p>
                    <p className="text-sm text-slate-600">
                        Define reglas opcionales para responder con un cuerpo fijo según el método o subpath.
                        Usa <code className="rounded bg-slate-100 px-1 text-[11px]">ANY</code> o <code className="rounded bg-slate-100 px-1 text-[11px]">*</code> para aplicar a todo.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAddRule}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                    Añadir respuesta
                </button>
            </div>

            {configQuery.isLoading && (
                <p className="mt-4 text-sm text-slate-500">Cargando configuración…</p>
            )}

            {configQuery.isError && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    No pudimos cargar la configuración. Intentaremos de nuevo automáticamente.
                </div>
            )}

            {!configQuery.isLoading && !hasRules && (
                <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Sin reglas aún. Presiona “Añadir respuesta” para definir una.
                </div>
            )}

            <div className="mt-4 space-y-4">
                {rules.map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                Método
                                <select
                                    value={rule.method}
                                    onChange={(event) => handleRuleChange(rule.id, { method: event.target.value })}
                                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-800"
                                >
                                    {METHOD_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option === "ANY" ? "ANY (todos)" : option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-1 flex-col text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                Subpath
                                <input
                                    type="text"
                                    value={rule.subPath}
                                    onChange={(event) => handleRuleChange(rule.id, { subPath: event.target.value })}
                                    placeholder="*, /, /mi-path"
                                    className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800"
                                />
                                <span className="text-[10px] font-medium text-slate-500">* aplica a todas las subrutas</span>
                            </label>
                            <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                Status
                                <input
                                    type="number"
                                    min={100}
                                    max={599}
                                    value={rule.status}
                                    onChange={(event) =>
                                        handleRuleChange(rule.id, { status: Number(event.target.value) || 200 })
                                    }
                                    className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800"
                                />
                            </label>
                            <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                Content-Type
                                <input
                                    type="text"
                                    value={rule.contentType}
                                    onChange={(event) => handleRuleChange(rule.id, { contentType: event.target.value })}
                                    placeholder="application/json"
                                    className="mt-1 w-40 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => handleRemoveRule(rule.id)}
                                className="ml-auto rounded-md border border-transparent px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                            >
                                Eliminar
                            </button>
                        </div>
                        <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                            Body
                            <textarea
                                value={rule.bodyText}
                                onChange={(event) => handleRuleChange(rule.id, { bodyText: event.target.value })}
                                rows={4}
                                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                                placeholder='{"ok":true}'
                            />
                        </label>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || mutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {mutation.isPending ? "Guardando..." : "Guardar respuestas"}
                </button>
                {mutation.isError && (
                    <span className="text-sm font-semibold text-rose-600">
                        {(mutation.error as Error)?.message ?? "No se pudo guardar"}
                    </span>
                )}
                {justSaved && !mutation.isError && (
                    <span className="text-sm font-semibold text-emerald-600">Cambios guardados</span>
                )}
            </div>
        </div>
    );
};

const mapRuleToEditable = (rule: WebhookResponseRule): EditableRule => ({
    id: rule.id,
    method: rule.method,
    subPath: rule.subPath,
    status: rule.status,
    contentType: rule.contentType ?? "",
    bodyText: stringifyBody(rule.body),
});

const stringifyBody = (value: unknown): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const parseBody = (text: string): unknown => {
    const trimmed = text.trim();
    if (!trimmed) return undefined;
    try {
        return JSON.parse(trimmed);
    } catch {
        return trimmed;
    }
};

const generateClientId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `rule-${Math.random().toString(36).slice(2, 9)}`;
};

export default WebhookResponseEditor;
