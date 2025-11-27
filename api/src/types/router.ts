import type { DefaultContext, DefaultState, Middleware } from 'koa'

export interface RouteConfig {
  method: string
  route?: string
  handlers?: Array<Middleware<DefaultState, DefaultContext>>
}
