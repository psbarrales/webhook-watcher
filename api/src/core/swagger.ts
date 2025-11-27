import { koaSwagger } from 'koa2-swagger-ui'
import swagger from 'swagger/index'
import type Koa from 'koa'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

async function use(koa: Koa<DefaultState, DefaultContext>): Promise<Middleware<DefaultState, DefaultContext> | undefined> {
  if (process.env.DEBUG || process.env.NODE_ENV !== 'production') {
    console.debug('[core] requiring Swagger')
    const swaggerSpec = await swagger()
    ;(koa as Koa & { swagger?: unknown }).swagger = swaggerSpec
    return koaSwagger({
      routePrefix: '/swagger',
      swaggerOptions: {
        oauth2RedirectUrl: 'http://localhost:8080/auth/redirect',
        spec: swaggerSpec,
        jsonEditor: true,
      },
      hideTopbar: true,
    })
  }
  return undefined
}

export default {
  use,
}
