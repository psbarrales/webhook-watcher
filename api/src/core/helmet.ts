import helmet from 'koa-helmet'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

function use(): Middleware<DefaultState, DefaultContext> {
  console.debug('[core] requiring Helmet')
  return helmet({
    contentSecurityPolicy: false,
  })
}

export default {
  use,
}
