import Koa, { type DefaultContext, type DefaultState, type Middleware } from 'koa'
import queue from 'queue'
import { globSync } from 'glob'
import query from 'koa-qs'

type App = Koa<DefaultState, DefaultContext>

const api = async (): Promise<App> => {
  const koa: App = new Koa()
  koa.on('error', (err) => {
    console.error(err)
  })
  await core(koa)
  await middleware(koa)
  query(koa)
  return koa
}

async function core(koa: App): Promise<void> {
  console.debug('[core] starting require module')
  const matches = globSync(`${__dirname}/*`, {
    ignore: ['**/index.ts', '**/api.ts', '**/*.ignore.ts', '**/*.require.ts'],
  }).sort()

  const q = queue({
    concurrency: 1,
  })

  matches.forEach((match) => {
    q.push(async () => module(match, koa))
  })

  await new Promise<void>((resolve, reject) => {
    q.on('error', reject)
    q.on('end', () => resolve())
    q.start()
  })
}

async function middleware(koa: App): Promise<unknown[]> {
  console.debug('[middleware] starting require module')
  const matches = globSync(`${__dirname}/../middleware/**.onload.ts`)
  return Promise.all(matches.map(async (match) => module(match, koa)))
}

async function module(match: string, koa: App): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require(match) as {
    default?: {
      use?: (koa: App) => Middleware<DefaultState, DefaultContext> | Promise<Middleware<DefaultState, DefaultContext>>
      run?: (koa: App) => void | Promise<void>
    }
  }
  if (loaded?.default?.use) {
    const middleware = await loaded.default.use(koa)
    await koa.use(middleware)
    return
  }
  if (loaded?.default?.run) {
    await loaded.default.run(koa)
  }
}

export default api

export { core as __core, middleware as __middleware, module as __module }
