import fs from 'fs'
import os from 'os'
import path from 'path'
import { SQLiteWebhookRequestRepository } from 'infrastructure/persistence/sqlite/SQLiteWebhookRequestRepository'
import type { WebhookRequest } from 'domain/entities/WebhookRequest'

const buildRequest = (webhookId: string): WebhookRequest => ({
  id: `req-${webhookId}`,
  webhookId,
  method: 'GET',
  path: '/',
  headers: {},
  query: {},
  body: null,
  createdAt: new Date().toISOString(),
})

describe('SQLiteWebhookRequestRepository capacity', () => {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'webhook-db-limit-'))

  afterAll(() => {
    fs.rmSync(tmpBase, { recursive: true, force: true })
  })

  it('removes the oldest database when reaching the max limit', async () => {
    const repository = new SQLiteWebhookRequestRepository(tmpBase, 2)

    await repository.save(buildRequest('first'))
    await repository.save(buildRequest('second'))
    await repository.save(buildRequest('third'))

    const files = fs
      .readdirSync(tmpBase)
      .filter((file) => file.endsWith('.sqlite'))
      .sort()

    expect(files).toEqual(['second.sqlite', 'third.sqlite'])
  })
})
