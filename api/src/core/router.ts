import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import Router from '@koa/router'
import type Koa from 'koa'
import type { DefaultContext, DefaultState, Middleware } from 'koa'
import type { RouteConfig } from 'types/router'

const SRC_PATH = path.resolve(__dirname, '..')
const ROUTES_PATH = 'routes'

type App = Koa<DefaultState, DefaultContext>
type RouteMiddleware = Middleware<DefaultState, DefaultContext>

const run = async (koa: App): Promise<void> => {
  console.debug('[core] routes: starting autodiscovery on routes/*')
  const router = new Router()
  createDirectoryRoutes(path.join(SRC_PATH, ROUTES_PATH), router)
  koa.use(router.routes()).use(router.allowedMethods())
}

const createDirectoryRoutes = (directory: string, router: Router): void => {
  const matches = globSync(`${directory}/*`, {
    ignore: ['**/index.ts', '**/*.ignore.ts'],
  })
  matches.forEach((match) => {
    if (fs.lstatSync(match).isDirectory()) {
      const routerDir = new Router({
        prefix: `/${path.basename(match)}`,
      })
      createDirectoryRoutes(match, routerDir)
      router.use(routerDir.routes()).use(routerDir.allowedMethods())
    } else {
      createFileRoute(match, router)
    }
  })
}

const createFileRoute = (file: string, router: Router): Router => {
  const fileName = path.basename(file, path.extname(file))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const defaultFile = require(file).default as RouteConfig | RouteConfig[]
  const configs: RouteConfig[] = []
  if (Array.isArray(defaultFile)) {
    configs.push(...defaultFile)
  } else {
    configs.push(defaultFile)
  }
  configs.forEach(({ method = '', route = `/${fileName}`, handlers = [] }) => {
    if (!method || !route || handlers.length === 0) {
      throw new Error(
        `${file}: Bad router definition method, route and handlers must to be defined`,
      )
    }
    const handlersCopy = [...handlers]
    const lastHandler = handlersCopy.pop()
    if (!lastHandler) {
      throw new Error(`${file}: Route definition must include at least one handler`)
    }
    const methodName = method.toLowerCase()
    const routeHandlers: RouteMiddleware[] = handlersCopy
    const routerMethod = (router as Record<string, unknown>)[methodName]
    if (typeof routerMethod !== 'function') {
      throw new Error(`${file}: Unsupported HTTP method ${method}`)
    }
    ;(routerMethod as (...args: unknown[]) => Router).call(
      router,
      route,
      ...routeHandlers,
      async (ctx, next) => {
        await lastHandler(ctx, next)
      },
    )
  })
  return router
}

export default {
  run,
}

export {
  createFileRoute as __createFileRoute,
  createDirectoryRoutes as __createDirectoryRoutes,
}
