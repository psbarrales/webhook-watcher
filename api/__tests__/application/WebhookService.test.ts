import fs from 'fs'
import os from 'os'
import path from 'path'
import { WebhookService, WebhookNotFoundError } from 'application/webhooks/WebhookService'
import { SQLiteWebhookRequestRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookRequestRepository'
import { SQLiteWebhookResponseRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookResponseRepository'
import { WebhookDatabaseManager } from 'infrastructure/persistence/sqlite/WebhookDatabase'

const buildService = () => {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'webhook-service-'))
  const manager = new WebhookDatabaseManager(tmpBase)
  const service = new WebhookService(
    new SQLiteWebhookRequestRepository(manager),
    new SQLiteWebhookResponseRepository(manager),
  )

  return { service, tmpBase }
}

describe('WebhookService', () => {
  test('rejects recording requests for unknown webhooks', async () => {
    const { service, tmpBase } = buildService()
    const webhookId = 'missing-webhook'

    await expect(
      service.recordRequest({
        webhookId,
        method: 'POST',
        path: `/hooks/${webhookId}`,
        headers: {},
        query: {},
        queryString: '',
        body: {},
      }),
    ).rejects.toBeInstanceOf(WebhookNotFoundError)

    expect(fs.existsSync(path.join(tmpBase, `${webhookId}.sqlite`))).toBe(false)
  })

  test('uses created webhooks when recording requests', async () => {
    const { service, tmpBase } = buildService()
    const { id } = await service.createWebhook()

    const stored = await service.recordRequest({
      webhookId: id,
      method: 'GET',
      path: `/hooks/${id}`,
      headers: {},
      query: {},
      queryString: '',
      body: null,
      ip: '127.0.0.1',
      url: `http://localhost/hooks/${id}`,
      protocol: 'http',
      host: 'localhost',
    })

    expect(stored.webhookId).toBe(id)
    expect(fs.existsSync(path.join(tmpBase, `${id}.sqlite`))).toBe(true)
    const requests = await service.listRequests(id)
    expect(requests).toHaveLength(1)
  })
})
