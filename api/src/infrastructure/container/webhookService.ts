import { WebhookService } from 'application/webhooks/WebhookService'
import { getWebhookStoragePath } from 'infrastructure/config/storage'
import { SQLiteWebhookRequestRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookRequestRepository'
import { SQLiteWebhookResponseRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookResponseRepository'
import { WebhookDatabaseManager } from 'infrastructure/persistence/sqlite/WebhookDatabase'

const storagePath = getWebhookStoragePath()
const databaseManager = new WebhookDatabaseManager(storagePath)
const requestRepository = new SQLiteWebhookRequestRepository(databaseManager)
const responseRepository = new SQLiteWebhookResponseRepository(databaseManager)

const maxRequestsPerWebhook = parsePositiveInt(process.env.WEBHOOK_MAX_REQUESTS)
const maxRequestsPerSecond = parsePositiveInt(process.env.WEBHOOK_RATE_LIMIT_PER_SECOND)

const webhookService = new WebhookService(requestRepository, responseRepository, {
  maxRequestsPerWebhook,
  maxRequestsPerSecond,
})

function parsePositiveInt(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return Math.trunc(parsed)
}

export default webhookService
export { webhookService }
