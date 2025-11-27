import { WebhookService } from 'application/webhooks/WebhookService'
import { getWebhookStoragePath } from 'infrastructure/config/storage'
import { SQLiteWebhookRequestRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookRequestRepository'

const repository = new SQLiteWebhookRequestRepository(getWebhookStoragePath())
const webhookService = new WebhookService(repository)

export default webhookService
export { webhookService }
