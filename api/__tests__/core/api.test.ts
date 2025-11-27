import type Koa from 'koa'

jest.mock('glob', () => ({ globSync: jest.fn() }))
jest.mock('koa-qs', () => jest.fn())
jest.mock('fakeUseModule', () => ({
  __esModule: true,
  default: {
    use: jest.fn(async () => jest.fn()),
  },
}))
jest.mock('fakeRunModule', () => ({
  __esModule: true,
  default: {
    run: jest.fn(),
  },
}))
jest.mock('koa', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    use: jest.fn().mockReturnThis(),
    listen: jest.fn(),
  }))
})

const createKoaStub = () => ({
  use: jest.fn(),
})

const getMocks = () => {
  const globMock = jest.requireMock('glob') as { globSync: jest.Mock }
  const koaQsMock = jest.requireMock('koa-qs') as jest.Mock
  const fakeRunModule = jest.requireMock('fakeRunModule') as { default: { run: jest.Mock } }
  const fakeUseModule = jest.requireMock('fakeUseModule') as { default: { use: jest.Mock } }
  const koaMock = jest.requireMock('koa') as jest.Mock
  return { globMock, koaQsMock, fakeRunModule, fakeUseModule, koaMock }
}

describe('core: api exports', () => {
  test('core: api should be defined', async () => {
    const module = await import('core/api')
    expect(module.default).toBeDefined()
  })

  test('core: core, middleware, module should be defined', async () => {
    const module = await import('core/api')
    expect(module.__core).toBeDefined()
    expect(module.__middleware).toBeDefined()
    expect(module.__module).toBeDefined()
  })
})

describe('core: api module loader', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('core: module should call koa.use when module exports use', async () => {
    const { globMock, fakeUseModule } = getMocks()
    globMock.globSync.mockReset()
    fakeUseModule.default.use.mockReset()
    globMock.globSync.mockReturnValue(['fakeUseModule'])
    const module = await import('core/api')
    const koa = createKoaStub() as unknown as Koa
    await module.__module('fakeUseModule', koa)
    expect(fakeUseModule.default.use).toHaveBeenCalled()
    expect(koa.use).toHaveBeenCalled()
  })

  test('core: module should call run when module exports run', async () => {
    const { globMock, fakeRunModule } = getMocks()
    globMock.globSync.mockReset()
    fakeRunModule.default.run.mockReset()
    globMock.globSync.mockReturnValue(['fakeRunModule'])
    const module = await import('core/api')
    const koa = createKoaStub() as unknown as Koa
    await module.__module('fakeRunModule', koa)
    expect(fakeRunModule.default.run).toHaveBeenCalled()
  })
})

describe('core: api core method', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('core: api core method should call koa.use', async () => {
    const { globMock } = getMocks()
    globMock.globSync.mockReset()
    globMock.globSync.mockReturnValue(['fakeUseModule'])
    const module = await import('core/api')
    const koa = createKoaStub() as unknown as Koa
    await module.__core(koa)
    expect(koa.use).toHaveBeenCalled()
  })
})

describe('core: api middleware method', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('core: api middleware should call koa.use', async () => {
    const { globMock } = getMocks()
    globMock.globSync.mockReset()
    globMock.globSync.mockReturnValue(['fakeUseModule'])
    const module = await import('core/api')
    const koa = createKoaStub() as unknown as Koa
    await module.__middleware(koa)
    expect(koa.use).toHaveBeenCalled()
  })
})

describe('core: default api', () => {
  beforeEach(() => {
    jest.resetModules()
    const { globMock, koaQsMock, koaMock } = getMocks()
    globMock.globSync.mockReset()
    globMock.globSync.mockReturnValue([])
    koaQsMock.mockReset()
    koaMock.mockClear()
  })

  test('core: api default export should init koa and middleware', async () => {
    const module = await import('core/api')
    const { koaQsMock, koaMock } = getMocks()
    await module.default()
    expect(koaMock).toHaveBeenCalled()
    expect(koaQsMock).toHaveBeenCalled()
  })
})
