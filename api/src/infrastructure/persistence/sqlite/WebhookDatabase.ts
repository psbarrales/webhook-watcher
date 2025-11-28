import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

class WebhookDatabaseManager {
  private readonly databases = new Map<string, Database.Database>()

  constructor(private readonly basePath: string) {
    fs.mkdirSync(basePath, { recursive: true })
  }

  getDatabase(webhookId: string): Database.Database {
    let db = this.databases.get(webhookId)
    if (!db) {
      const dbPath = path.join(this.basePath, `${webhookId}.sqlite`)
      db = new Database(dbPath)
      this.databases.set(webhookId, db)
    }
    return db
  }
}

export { WebhookDatabaseManager }
