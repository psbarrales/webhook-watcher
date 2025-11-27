import type Koa from 'koa'

jest.mock('koa2-swagger-ui', () => ({ koaSwagger: jest.fn() }))
jest.mock('swagger/index', () => jest.fn())

const getMocks = () => {
  const swaggerIndex = jest.requireMock('swagger/index') as jest.Mock
  const swaggerUi = jest.requireMock('koa2-swagger-ui') as { koaSwagger: jest.Mock }
  return { swaggerIndex, koaSwagger: swaggerUi.koaSwagger }
}

test('core: swagger module exports use function', async () => {
  const module = await import('core/swagger')
  expect(module.default).toBeDefined()
  expect(module.default.use).toBeDefined()
})

describe('Production Swagger', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
    }
    delete process.env.DEBUG
    const { swaggerIndex, koaSwagger } = getMocks()
    swaggerIndex.mockClear()
    koaSwagger.mockClear()
  })

  test('core: swagger.use should not register swagger middleware', async () => {
    const module = await import('core/swagger')
    const fakeKoa = { use: jest.fn() } as unknown as Koa
    const { swaggerIndex, koaSwagger } = getMocks()
    const middleware = await module.default.use(fakeKoa)
    expect(middleware).toBeUndefined()
    expect(swaggerIndex).not.toHaveBeenCalled()
    expect(koaSwagger).not.toHaveBeenCalled()
  })

  afterEach(() => {
    process.env = originalEnv
  })
})

describe('Non-Production Swagger', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'staging',
    }
    delete process.env.DEBUG
    const { swaggerIndex, koaSwagger } = getMocks()
    swaggerIndex.mockClear()
    koaSwagger.mockClear()
  })

  test('core: swagger.use should load swagger middleware', async () => {
    const module = await import('core/swagger')
    const fakeKoa = { use: jest.fn() } as unknown as Koa
    const { swaggerIndex, koaSwagger } = getMocks()
    await module.default.use(fakeKoa)
    expect(swaggerIndex).toHaveBeenCalled()
    expect(koaSwagger).toHaveBeenCalled()
  })

  afterEach(() => {
    process.env = originalEnv
  })
})
