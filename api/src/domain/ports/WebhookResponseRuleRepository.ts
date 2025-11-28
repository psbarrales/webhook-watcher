import type { WebhookResponseRule } from 'domain/entities/WebhookResponseRule'

export interface WebhookResponseRuleRepository {
  prepare(webhookId: string): Promise<void>
  list(webhookId: string): Promise<WebhookResponseRule[]>
  replaceAll(webhookId: string, rules: WebhookResponseRule[]): Promise<void>
}
