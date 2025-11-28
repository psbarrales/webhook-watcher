import cors from '@koa/cors'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

const parseAllowedOrigins = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean)

const isAllowed = (origin: string, allowlist: string[]): boolean => {
  const normalized = origin.trim().replace(/\/+$/, '')
  if (allowlist.length === 0) return true
  return allowlist.includes(normalized)
}

function use(): Middleware<DefaultState, DefaultContext> {
  console.debug('[core] requiring CORS')
  const allowlist = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS)

  return cors({
    origin: (ctx) => {
      const incoming = ctx.get('Origin')
      if (!incoming) return '*'
      return isAllowed(incoming, allowlist) ? incoming : ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'Date'],
    credentials: true,
  })
}

export default {
  use,
}

export { isAllowed, parseAllowedOrigins }
