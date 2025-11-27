import { randomUUID } from 'crypto'
import type { WebhookRequest, WebhookRequestSummary } from 'domain/entities/WebhookRequest'
import type { WebhookRequestRepository } from 'domain/ports/WebhookRequestRepository'

export interface CreateWebhookResult {
  id: string
}

type RecordRequestInput = Omit<WebhookRequest, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}

export class WebhookService {
  constructor(private readonly repository: WebhookRequestRepository) {}

  async createWebhook(): Promise<CreateWebhookResult> {
    const id = randomUUID()
    await this.repository.prepare(id)
    return { id }
  }

  async recordRequest(input: RecordRequestInput): Promise<WebhookRequest> {
    const record: WebhookRequest = {
      ...input,
      id: input.id ?? randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
    }
    await this.repository.prepare(record.webhookId)
    await this.repository.save(record)
    return record
  }

  async listRequests(webhookId: string): Promise<WebhookRequestSummary[]> {
    await this.repository.prepare(webhookId)
    return this.repository.list(webhookId)
  }

  async getRequest(webhookId: string, requestId: string): Promise<WebhookRequest | undefined> {
    await this.repository.prepare(webhookId)
    return this.repository.find(webhookId, requestId)
  }
}
