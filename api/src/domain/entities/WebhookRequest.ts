export interface WebhookRequest {
  id: string
  webhookId: string
  method: string
  path: string
  headers: Record<string, unknown>
  query: Record<string, unknown>
  queryString?: string
  body: unknown
  ip?: string | undefined
  url?: string
  protocol?: string
  host?: string
  origin?: string
  referrer?: string
  userAgent?: string
  contentType?: string
  contentLength?: number | null
  createdAt: string
}

export interface WebhookRequestSummary {
  id: string
  method: string
  path: string
  createdAt: string
}
