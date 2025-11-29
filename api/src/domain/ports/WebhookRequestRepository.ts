import type { WebhookRequest, WebhookRequestSummary } from 'domain/entities/WebhookRequest'

export interface WebhookRequestRepository {
  exists(webhookId: string): Promise<boolean>
  prepare(webhookId: string): Promise<void>
  save(request: WebhookRequest): Promise<void>
  list(webhookId: string): Promise<WebhookRequestSummary[]>
  find(webhookId: string, requestId: string): Promise<WebhookRequest | undefined>
  count(webhookId: string): Promise<number>
}
