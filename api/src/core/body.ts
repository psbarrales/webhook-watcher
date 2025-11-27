import body from 'koa-body'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

function use(): Middleware<DefaultState, DefaultContext> {
  console.debug('[core] requiring Body')
  return body({
    multipart: true,
  })
}

export default {
  use,
}
