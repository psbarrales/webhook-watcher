import type { WebhookRequest, WebhookRequestSummary } from 'domain/entities/WebhookRequest'

export interface WebhookRequestRepository {
  prepare(webhookId: string): Promise<void>
  save(request: WebhookRequest): Promise<void>
  list(webhookId: string): Promise<WebhookRequestSummary[]>
  find(webhookId: string, requestId: string): Promise<WebhookRequest | undefined>
  count(webhookId: string): Promise<number>
}
