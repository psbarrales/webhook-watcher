import { randomUUID } from 'crypto'
import Model, { type QueryOptions } from 'models/Model'

export interface PostEntity {
  id: string
  title?: string
  body?: string
  [key: string]: unknown
}

class Post extends Model<PostEntity> {
  private readonly posts: Map<string, PostEntity> = new Map()

  async count(): Promise<number> {
    return this.posts.size
  }

  async find({ where = {} }: QueryOptions<PostEntity> = {}): Promise<PostEntity[]> {
    return Array.from(this.posts.values()).filter((post) =>
      Object.entries(where).every(([key, value]) => post[key] === value),
    )
  }

  async findOne({ where = {} }: QueryOptions<PostEntity>): Promise<PostEntity | undefined> {
    if (where.id) {
      return this.posts.get(where.id)
    }
    return Array.from(this.posts.values()).find((post) =>
      Object.entries(where).every(([key, value]) => post[key] === value),
    )
  }

  async create({ data = {} }: QueryOptions<PostEntity>): Promise<PostEntity> {
    const id = typeof data.id === 'string' && data.id.length > 0 ? data.id : randomUUID()
    const post: PostEntity = { ...data, id }
    this.posts.set(id, post)
    return post
  }

  async deleteOne({ where = {} }: QueryOptions<PostEntity>): Promise<PostEntity | undefined> {
    if (!where.id) {
      return undefined
    }
    const existing = this.posts.get(where.id)
    this.posts.delete(where.id)
    return existing
  }

  async deleteMany({ where = {} }: QueryOptions<PostEntity>): Promise<number> {
    const toDelete = await this.find({ where })
    toDelete.forEach((post) => this.posts.delete(post.id))
    return toDelete.length
  }

  async update({ where = {}, data = {} }: QueryOptions<PostEntity>): Promise<PostEntity> {
    if (!where.id) {
      throw new Error('Post identifier is required for update operations')
    }
    const existing = this.posts.get(where.id)
    if (!existing) {
      throw new Error(`Post ${where.id} not found`)
    }
    const updated = { ...existing, ...data, id: existing.id }
    this.posts.set(existing.id, updated)
    return updated
  }

  async updateMany({ where = {}, data = {} }: QueryOptions<PostEntity>): Promise<number> {
    const toUpdate = await this.find({ where })
    toUpdate.forEach((post) => {
      const updated = { ...post, ...data }
      this.posts.set(post.id, updated)
    })
    return toUpdate.length
  }
}

export default new Post()
