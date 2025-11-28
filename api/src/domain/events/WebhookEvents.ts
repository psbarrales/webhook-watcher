import type { WebhookRequest, WebhookRequestSummary } from 'domain/entities/WebhookRequest'

export interface RequestRecordedEvent {
  webhookId: string
  summary: WebhookRequestSummary
  request: WebhookRequest
}

export interface WebhookEventPublisher {
  emitRequestRecorded(event: RequestRecordedEvent): void
}
