import cors, { isAllowed, parseAllowedOrigins } from 'core/cors'
import koaCors from '@koa/cors'

jest.mock('@koa/cors', () => jest.fn((opts) => opts))

test('core: cors and cors.use should be defined', () => {
  expect(cors).toBeDefined()
  expect(cors.use).toBeDefined()
})

test('core: cors.use should call @koa/cors middleware', () => {
  cors.use()
  expect(koaCors).toHaveBeenCalled()
})

test('core: cors origin allowlist blocks unwanted origins', () => {
  process.env.CORS_ALLOWED_ORIGINS = 'https://api.v1.devhook.space'
  const options = cors.use() as unknown as { origin: (ctx: { get: (h: string) => string }) => string }
  expect(options.origin({ get: () => 'https://api.v1.devhook.space' })).toBe('https://api.v1.devhook.space')
  expect(options.origin({ get: () => 'https://webhook.devhook.space' })).toBe('')
  delete process.env.CORS_ALLOWED_ORIGINS
})

test('core: isAllowed and parseAllowedOrigins normalize origins', () => {
  const allowlist = parseAllowedOrigins('https://api.v1.devhook.space/ , https://api.staging.devhook.space')
  expect(allowlist).toEqual(['https://api.v1.devhook.space', 'https://api.staging.devhook.space'])
  expect(isAllowed('https://api.v1.devhook.space/', allowlist)).toBe(true)
  expect(isAllowed('https://webhook.devhook.space', allowlist)).toBe(false)
})
