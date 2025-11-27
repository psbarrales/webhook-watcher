import cors from '@koa/cors'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

function use(): Middleware<DefaultState, DefaultContext> {
  console.debug('[core] requiring CORS')
  return cors({
    origin: (ctx) => ctx.get('Origin') || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'Date'],
    credentials: true,
  })
}

export default {
  use,
}
