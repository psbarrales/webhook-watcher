import { WebhookService } from 'application/webhooks/WebhookService'
import { getWebhookStoragePath } from 'infrastructure/config/storage'
import { SQLiteWebhookRequestRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookRequestRepository'
import { SQLiteWebhookResponseRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookResponseRepository'
import { WebhookDatabaseManager } from 'infrastructure/persistence/sqlite/WebhookDatabase'

const storagePath = getWebhookStoragePath()
const databaseManager = new WebhookDatabaseManager(storagePath)
const requestRepository = new SQLiteWebhookRequestRepository(databaseManager)
const responseRepository = new SQLiteWebhookResponseRepository(databaseManager)
const webhookService = new WebhookService(requestRepository, responseRepository)

export default webhookService
export { webhookService }
