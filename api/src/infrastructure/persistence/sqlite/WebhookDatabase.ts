import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

class WebhookDatabaseManager {
  private readonly databases = new Map<string, Database.Database>()

  constructor(private readonly basePath: string, private readonly maxDatabases = 100) {
    fs.mkdirSync(basePath, { recursive: true })
  }

  getDatabase(webhookId: string): Database.Database {
    let db = this.databases.get(webhookId)
    if (!db) {
      this.ensureCapacity()
      const dbPath = path.join(this.basePath, `${webhookId}.sqlite`)
      db = new Database(dbPath)
      this.databases.set(webhookId, db)
    }
    return db
  }

  private ensureCapacity(): void {
    const files = fs
      .readdirSync(this.basePath, { withFileTypes: true })
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.sqlite'))
      .map((dirent) => {
        const fullPath = path.join(this.basePath, dirent.name)
        const stats = fs.statSync(fullPath)
        return {
          path: fullPath,
          name: dirent.name,
          mtime: stats.mtimeMs,
        }
      })
      .sort((a, b) => a.mtime - b.mtime)

    if (files.length >= this.maxDatabases) {
      const oldest = files[0]
      const webhookId = path.basename(oldest.name, '.sqlite')
      const openDb = this.databases.get(webhookId)
      if (openDb) {
        openDb.close()
        this.databases.delete(webhookId)
      }
      fs.rmSync(oldest.path, { force: true })
    }
  }
}

export { WebhookDatabaseManager }
