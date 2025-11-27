import type { Context } from 'koa'

type FilterPayload = {
  where?: Record<string, unknown>
  fields?: Record<string, unknown>
  limit?: number
  sort?: Record<string, unknown>
  skip?: number
}

type FilterContext = Pick<Context, 'query'> & {
  query: Context['query'] & {
    filter?: string | FilterPayload
  }
}

const safeParse = (value: unknown): FilterPayload => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as FilterPayload
    } catch (error) {
      return {}
    }
  }
  if (value && typeof value === 'object') {
    return value as FilterPayload
  }
  return {}
}

const normalizeFilter = (ctx: FilterContext): FilterPayload => {
  return safeParse(ctx.query?.filter)
}

function filterQuery(ctx: FilterContext): Record<string, unknown> {
  const filter = normalizeFilter(ctx)
  const where = { ...(filter.where ?? {}) }
  if (typeof where.id !== 'undefined') {
    // Backwards compatibility with legacy `_id` usage
    ;(where as Record<string, unknown>)._id = where.id
    delete (where as Record<string, unknown>).id
  }
  return where
}

function fieldsQuery(ctx: FilterContext): Record<string, unknown> {
  const filter = normalizeFilter(ctx)
  return filter.fields ?? {}
}

function optionsQuery(ctx: FilterContext): FilterPayload {
  const filter = normalizeFilter(ctx)
  const options: FilterPayload = {}
  if (typeof filter.limit === 'number') {
    options.limit = filter.limit
  }
  if (filter.sort) {
    options.sort = filter.sort
  }
  if (typeof filter.skip === 'number') {
    options.skip = filter.skip
  }
  return options
}

export { filterQuery, fieldsQuery, optionsQuery }
