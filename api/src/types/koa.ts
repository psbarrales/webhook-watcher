import type { Context } from 'koa'

type BodyContext<TBody = unknown> = Context & {
  request: Context['request'] & { body: TBody }
}

export type { BodyContext }
