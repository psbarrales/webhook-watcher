import Database from 'better-sqlite3'
import type { WebhookResponseRule } from 'domain/entities/WebhookResponseRule'
import type { WebhookResponseRuleRepository } from 'domain/ports/WebhookResponseRuleRepository'
import { WebhookDatabaseManager } from './WebhookDatabase'

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS response_rules (
    id TEXT PRIMARY KEY,
    webhookId TEXT NOT NULL,
    method TEXT NOT NULL,
    subPath TEXT NOT NULL,
    status INTEGER NOT NULL,
    contentType TEXT,
    body TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`

const CREATE_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_response_rules_webhook ON response_rules(webhookId, position ASC)
`

export class SQLiteWebhookResponseRepository implements WebhookResponseRuleRepository {
  private readonly manager: WebhookDatabaseManager
  private readonly prepared = new Set<string>()

  constructor(basePathOrManager: string | WebhookDatabaseManager) {
    this.manager =
      typeof basePathOrManager === 'string'
        ? new WebhookDatabaseManager(basePathOrManager)
        : basePathOrManager
  }

  async prepare(webhookId: string): Promise<void> {
    this.getDatabase(webhookId)
  }

  async list(webhookId: string): Promise<WebhookResponseRule[]> {
    const db = this.getDatabase(webhookId)
    const rows = db
      .prepare('SELECT * FROM response_rules WHERE webhookId = ? ORDER BY position ASC')
      .all(webhookId)

    return rows.map((row) => ({
      id: String(row.id),
      webhookId: String(row.webhookId),
      method: String(row.method),
      subPath: String(row.subPath),
      status: Number(row.status),
      contentType: row.contentType ? String(row.contentType) : null,
      body: parseUnknown(row.body),
      position: Number(row.position ?? 0),
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
    }))
  }

  async replaceAll(webhookId: string, rules: WebhookResponseRule[]): Promise<void> {
    const db = this.getDatabase(webhookId)
    const deleteStmt = db.prepare('DELETE FROM response_rules WHERE webhookId = ?')
    const insertStmt = db.prepare(`
      INSERT INTO response_rules (
        id, webhookId, method, subPath, status, contentType, body, position, createdAt, updatedAt
      ) VALUES (
        @id, @webhookId, @method, @subPath, @status, @contentType, @body, @position, @createdAt, @updatedAt
      )
    `)

    const run = db.transaction(() => {
      deleteStmt.run(webhookId)
      rules.forEach((rule) => {
        insertStmt.run({
          ...rule,
          contentType: rule.contentType ?? null,
          body: serialize(rule.body),
        })
      })
    })

    run()
  }

  private getDatabase(webhookId: string): Database.Database {
    const db = this.manager.getDatabase(webhookId)
    if (!this.prepared.has(webhookId)) {
      db.prepare(CREATE_TABLE_SQL).run()
      db.prepare(CREATE_INDEX_SQL).run()
      this.prepared.add(webhookId)
    }
    return db
  }
}

const serialize = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  try {
    return JSON.stringify(value)
  } catch {
    return JSON.stringify({ error: 'Unable to serialize value' })
  }
}

const parseUnknown = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
