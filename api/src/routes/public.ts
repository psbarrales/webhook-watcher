import path from 'path'
import send from 'koa-send'
import type { ParameterizedContext } from 'koa'
import type { RouteConfig } from 'types/router'

const getSendAction = (pathFiles = '') => {
  const serveBase = path.join(process.cwd(), '/src/public')
  return async (ctx: ParameterizedContext) =>
    send(ctx, ctx.path.replace(`/public${pathFiles}`, ''), {
      root: serveBase,
      immutable: true,
    })
}

const routes: RouteConfig[] = [
  {
    method: 'GET',
    route: '/public/(.*)',
    handlers: [getSendAction()],
  },
  {
    method: 'GET',
    route: '/favicon.ico',
    handlers: [getSendAction('/favicon.ico')],
  },
]

export default routes

export { getSendAction as __getSendAction }
