export interface WebhookResponseRule {
  id: string
  webhookId: string
  method: string
  subPath: string
  status: number
  contentType?: string | null
  body?: unknown
  position: number
  createdAt: string
  updatedAt: string
}

export interface WebhookResponseRuleInput {
  id?: string
  method: string
  subPath?: string
  status?: number
  contentType?: string | null
  body?: unknown
}
