import fs from 'fs'
import path from 'path'

const DEFAULT_STORAGE_DIR = path.join(process.cwd(), 'data', 'webhooks')

export const getWebhookStoragePath = (): string => {
  const target = process.env.WEBHOOK_STORAGE_PATH || DEFAULT_STORAGE_DIR
  fs.mkdirSync(target, { recursive: true })
  return target
}
