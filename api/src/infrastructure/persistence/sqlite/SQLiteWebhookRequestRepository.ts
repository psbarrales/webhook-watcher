import Database from 'better-sqlite3'
import type { WebhookRequest, WebhookRequestSummary } from 'domain/entities/WebhookRequest'
import type { WebhookRequestRepository } from 'domain/ports/WebhookRequestRepository'
import { WebhookDatabaseManager } from './WebhookDatabase'

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    webhookId TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    headers TEXT NOT NULL,
    query TEXT NOT NULL,
    queryString TEXT,
    body TEXT,
    ip TEXT,
    url TEXT,
    protocol TEXT,
    host TEXT,
    origin TEXT,
    referrer TEXT,
    userAgent TEXT,
    contentType TEXT,
    contentLength INTEGER,
    createdAt TEXT NOT NULL
  )
`

const CREATE_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(createdAt DESC)
`

export class SQLiteWebhookRequestRepository implements WebhookRequestRepository {
  private readonly manager: WebhookDatabaseManager
  private readonly prepared = new Set<string>()

  constructor(basePathOrManager: string | WebhookDatabaseManager, maxDatabases = 100) {
    this.manager =
      typeof basePathOrManager === 'string'
        ? new WebhookDatabaseManager(basePathOrManager, maxDatabases)
        : basePathOrManager
  }

  async prepare(webhookId: string): Promise<void> {
    this.getDatabase(webhookId)
  }

  async save(request: WebhookRequest): Promise<void> {
    const db = this.getDatabase(request.webhookId)
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO requests (
        id, webhookId, method, path, headers, query, queryString, body, ip, url, protocol, host, origin, referrer, userAgent, contentType, contentLength, createdAt
      )
      VALUES (
        @id, @webhookId, @method, @path, @headers, @query, @queryString, @body, @ip, @url, @protocol, @host, @origin, @referrer, @userAgent, @contentType, @contentLength, @createdAt
      )
    `)

    stmt.run({
      ...request,
      headers: serialize(request.headers),
      query: serialize(request.query),
      body: serialize(request.body),
      ip: request.ip ?? null,
      queryString: request.queryString ?? null,
      url: request.url ?? null,
      protocol: request.protocol ?? null,
      host: request.host ?? null,
      origin: request.origin ?? null,
      referrer: request.referrer ?? null,
      userAgent: request.userAgent ?? null,
      contentType: request.contentType ?? null,
      contentLength: request.contentLength ?? null,
    })
  }

  async list(webhookId: string): Promise<WebhookRequestSummary[]> {
    const db = this.getDatabase(webhookId)
    const rows = db
      .prepare('SELECT id, method, path, createdAt FROM requests ORDER BY datetime(createdAt) DESC')
      .all()

    return rows.map((row) => ({
      id: String(row.id),
      method: String(row.method),
      path: String(row.path),
      createdAt: String(row.createdAt),
    }))
  }

  async find(webhookId: string, requestId: string): Promise<WebhookRequest | undefined> {
    const db = this.getDatabase(webhookId)
    const row = db.prepare('SELECT * FROM requests WHERE id = ? LIMIT 1').get(requestId)
    if (!row) return undefined
    return {
      id: String(row.id),
      webhookId: String(row.webhookId),
      method: String(row.method),
      path: String(row.path),
      headers: parseObject(row.headers),
      query: parseObject(row.query),
      queryString: row.queryString ? String(row.queryString) : undefined,
      body: parseUnknown(row.body),
      ip: row.ip ? String(row.ip) : undefined,
      url: row.url ? String(row.url) : undefined,
      protocol: row.protocol ? String(row.protocol) : undefined,
      host: row.host ? String(row.host) : undefined,
      origin: row.origin ? String(row.origin) : undefined,
      referrer: row.referrer ? String(row.referrer) : undefined,
      userAgent: row.userAgent ? String(row.userAgent) : undefined,
      contentType: row.contentType ? String(row.contentType) : undefined,
      contentLength: row.contentLength !== null && row.contentLength !== undefined ? Number(row.contentLength) : null,
      createdAt: String(row.createdAt),
    }
  }

  async count(webhookId: string): Promise<number> {
    const db = this.getDatabase(webhookId)
    const row = db.prepare('SELECT COUNT(1) as total FROM requests').get()
    return typeof row?.total === 'number' ? Number(row.total) : Number(row?.total ?? 0)
  }

  private getDatabase(webhookId: string): Database.Database {
    const db = this.manager.getDatabase(webhookId)
    if (!this.prepared.has(webhookId)) {
      this.ensureSchema(db)
      this.prepared.add(webhookId)
    }
    return db
  }

  private ensureSchema(db: Database.Database): void {
    db.prepare(CREATE_TABLE_SQL).run()
    db.prepare(CREATE_INDEX_SQL).run()
    this.ensureColumns(db)
  }

  private ensureColumns(db: Database.Database): void {
    const expected: Record<string, string> = {
      queryString: 'TEXT',
      url: 'TEXT',
      protocol: 'TEXT',
      host: 'TEXT',
      origin: 'TEXT',
      referrer: 'TEXT',
      userAgent: 'TEXT',
      contentType: 'TEXT',
      contentLength: 'INTEGER',
    }

    const columns = db
      .prepare(`PRAGMA table_info(requests)`)
      .all()
      .reduce<Record<string, boolean>>((acc, row) => {
        acc[String(row.name)] = true
        return acc
      }, {})

    Object.entries(expected).forEach(([column, type]) => {
      if (!columns[column]) {
        db.prepare(`ALTER TABLE requests ADD COLUMN ${column} ${type}`).run()
      }
    })
  }
}

const serialize = (value: unknown): string => {
  try {
    return JSON.stringify(value ?? null)
  } catch {
    return JSON.stringify({ error: 'Unable to serialize value' })
  }
}

const parseObject = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'string') return (value as Record<string, unknown>) ?? {}
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>
    }
    return {}
  } catch {
    return {}
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
