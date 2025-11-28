import { randomUUID } from 'crypto'
import type { WebhookRequest, WebhookRequestSummary } from 'domain/entities/WebhookRequest'
import type {
  WebhookResponseRule,
  WebhookResponseRuleInput,
} from 'domain/entities/WebhookResponseRule'
import type { WebhookRequestRepository } from 'domain/ports/WebhookRequestRepository'
import type { WebhookResponseRuleRepository } from 'domain/ports/WebhookResponseRuleRepository'

export interface CreateWebhookResult {
  id: string
}

type RecordRequestInput = Omit<WebhookRequest, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}

export interface WebhookServiceOptions {
  maxRequestsPerWebhook?: number
  maxRequestsPerSecond?: number
}

export class WebhookLimitError extends Error {
  constructor(
    message: string,
    public readonly status = 429,
    public readonly code: 'total_limit' | 'rate_limit' = 'rate_limit',
  ) {
    super(message)
    this.name = 'WebhookLimitError'
  }
}

export class WebhookService {
  private readonly maxRequestsPerWebhook: number
  private readonly maxRequestsPerSecond: number
  private readonly rateWindowMs = 1000
  private readonly rateBuckets = new Map<string, number[]>()

  constructor(
    private readonly requestRepository: WebhookRequestRepository,
    private readonly responseRepository: WebhookResponseRuleRepository,
    options: WebhookServiceOptions = {},
  ) {
    this.maxRequestsPerWebhook = sanitizeLimit(options.maxRequestsPerWebhook, 100)
    this.maxRequestsPerSecond = sanitizeLimit(options.maxRequestsPerSecond, 2)
  }

  async createWebhook(): Promise<CreateWebhookResult> {
    const id = randomUUID()
    await this.requestRepository.prepare(id)
    await this.responseRepository.prepare(id)
    return { id }
  }

  async recordRequest(input: RecordRequestInput): Promise<WebhookRequest> {
    const record: WebhookRequest = {
      ...input,
      id: input.id ?? randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
    }
    await this.assertCanAcceptRequest(record.webhookId)
    await this.requestRepository.prepare(record.webhookId)
    await this.requestRepository.save(record)
    return record
  }

  async listRequests(webhookId: string): Promise<WebhookRequestSummary[]> {
    await this.requestRepository.prepare(webhookId)
    return this.requestRepository.list(webhookId)
  }

  async getRequest(webhookId: string, requestId: string): Promise<WebhookRequest | undefined> {
    await this.requestRepository.prepare(webhookId)
    return this.requestRepository.find(webhookId, requestId)
  }

  async getWebhook(webhookId: string): Promise<{ id: string; responses: WebhookResponseRule[] }> {
    await this.responseRepository.prepare(webhookId)
    const responses = await this.responseRepository.list(webhookId)
    return { id: webhookId, responses }
  }

  async updateResponses(
    webhookId: string,
    inputs: WebhookResponseRuleInput[],
  ): Promise<WebhookResponseRule[]> {
    await this.responseRepository.prepare(webhookId)
    const previous = await this.responseRepository.list(webhookId)
    const previousMap = new Map(previous.map((rule) => [rule.id, rule]))
    const now = new Date().toISOString()
    const normalized = inputs.map((input, index) => {
      const id = typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : randomUUID()
      const existing = previousMap.get(id)
      return {
        id,
        webhookId,
        method: normalizeMethod(input.method),
        subPath: normalizeSubPath(input.subPath),
        status: normalizeStatus(input.status),
        contentType: normalizeContentType(input.contentType),
        body: input.body ?? null,
        position: index,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
    })
    await this.responseRepository.replaceAll(webhookId, normalized)
    return normalized
  }

  async findResponseRule(
    webhookId: string,
    method: string,
    subPath: string,
  ): Promise<WebhookResponseRule | undefined> {
    await this.responseRepository.prepare(webhookId)
    const rules = await this.responseRepository.list(webhookId)
    const normalizedMethod = normalizeMethod(method)
    const normalizedPath = normalizeSubPath(subPath)
    return rules.find(
      (rule) => matchesMethod(rule.method, normalizedMethod) && matchesPath(rule.subPath, normalizedPath),
    )
  }

  async assertCanAcceptRequest(webhookId: string): Promise<void> {
    await this.requestRepository.prepare(webhookId)
    const total = await this.requestRepository.count(webhookId)
    if (total >= this.maxRequestsPerWebhook) {
      throw new WebhookLimitError(
        `El webhook alcanzó el máximo de ${this.maxRequestsPerWebhook} solicitudes almacenadas`,
        429,
        'total_limit',
      )
    }
    if (!this.consumeRateSlot(webhookId)) {
      throw new WebhookLimitError(
        `Rate limit excedido (${this.maxRequestsPerSecond} req/s). Intente nuevamente en un momento`,
        429,
        'rate_limit',
      )
    }
  }

  private consumeRateSlot(webhookId: string): boolean {
    if (this.maxRequestsPerSecond < 1) return true
    const now = Date.now()
    const windowStart = now - this.rateWindowMs
    const timestamps = this.rateBuckets.get(webhookId) ?? []
    const recent = timestamps.filter((ts) => ts > windowStart)
    if (recent.length >= this.maxRequestsPerSecond) {
      this.rateBuckets.set(webhookId, recent)
      return false
    }
    recent.push(now)
    this.rateBuckets.set(webhookId, recent)
    return true
  }
}

const normalizeMethod = (value: string): string => {
  const normalized = (value || '').trim().toUpperCase()
  if (!normalized || normalized === '*') return 'ANY'
  return normalized
}

const normalizeSubPath = (value?: string): string => {
  if (!value || value.trim() === '' || value.trim() === '*') return '*'
  const trimmed = value.trim()
  if (trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizeStatus = (value?: number): number => {
  const candidate = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(candidate)) return 200
  return Math.min(599, Math.max(100, Math.trunc(candidate)))
}

const normalizeContentType = (value?: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const matchesMethod = (ruleMethod: string, incoming: string): boolean => {
  return ruleMethod === 'ANY' || ruleMethod === incoming
}

const matchesPath = (rulePath: string, incoming: string): boolean => {
  return rulePath === '*' || rulePath === incoming
}

const sanitizeLimit = (value: number | undefined, fallback: number): number => {
  if (typeof value !== 'number') return fallback
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}
