/* eslint-disable @typescript-eslint/no-var-requires */
import { globSync } from 'glob'
import fs from 'fs'

jest.mock('glob', () => ({ globSync: jest.fn() }))
jest.mock('fs', () => ({ lstatSync: jest.fn() }))

const globSyncMock = globSync as jest.MockedFunction<typeof globSync>
const lstatSyncMock = fs.lstatSync as jest.MockedFunction<typeof fs.lstatSync>

const createRouterStub = () => ({
  use: jest.fn().mockReturnThis(),
  routes: jest.fn().mockReturnThis(),
  allowedMethods: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  register: jest.fn().mockReturnThis(),
})

beforeEach(() => {
  globSyncMock.mockReset()
  lstatSyncMock.mockReset()
})

test('core: router module exposes run function', async () => {
  globSyncMock.mockReturnValue([])
  await jest.isolateModulesAsync(async () => {
    const module = await import('core/router')
    expect(module.default).toBeDefined()
    expect(module.default.run).toEqual(expect.any(Function))
  })
})

test('core: router.run attaches routes to koa instance', async () => {
  globSyncMock.mockReturnValue([])
  const routerStub = createRouterStub()
  jest.doMock('@koa/router', () => jest.fn().mockImplementation(() => routerStub))
  await jest.isolateModulesAsync(async () => {
    const module = await import('core/router')
    const koa = { use: jest.fn().mockReturnThis() } as any
    await module.default.run(koa)
    expect(koa.use).toHaveBeenCalled()
  })
})

test('core: createFileRoute throws when definition is invalid', async () => {
  const routerStub = createRouterStub()
  jest.doMock('@koa/router', () => jest.fn())
  jest.doMock('fakeRoute', () => ({
    __esModule: true,
    default: { methods: 'GET' },
  }))
  await jest.isolateModulesAsync(async () => {
    const module = await import('core/router')
    expect(() => module.__createFileRoute('fakeRoute', routerStub as any)).toThrow()
  })
})

test('core: createFileRoute registers handler for supported methods', async () => {
  const routerStub = createRouterStub()
  jest.doMock('@koa/router', () => jest.fn())
  jest.doMock('fakeRoute', () => ({
    __esModule: true,
    default: { method: 'GET', route: '/', handlers: [jest.fn()] },
  }))
  await jest.isolateModulesAsync(async () => {
    const module = await import('core/router')
    module.__createFileRoute('fakeRoute', routerStub as any)
    expect(routerStub.get).toHaveBeenCalled()
  })
})

test('core: createDirectoryRoutes walks nested directories', async () => {
  const routerStub = createRouterStub()
  jest.doMock('@koa/router', () => jest.fn().mockImplementation(() => createRouterStub()))
  lstatSyncMock.mockImplementation((target: fs.PathLike) => {
    if (String(target).endsWith('index.ts')) {
      return {
        isDirectory: () => false,
      } as unknown as fs.Stats
    }

    return {
      isDirectory: () => true,
    } as unknown as fs.Stats
  })
  globSyncMock
    .mockReturnValueOnce(['fakeRoute/childDir'])
    .mockReturnValueOnce(['fakeRoute/childDir/index.ts'])
  jest.doMock('fakeRoute/childDir/index.ts', () => ({
    __esModule: true,
    default: { method: 'GET', route: '/', handlers: [jest.fn()] },
  }),
  { virtual: true })
  await jest.isolateModulesAsync(async () => {
    const module = await import('core/router')
    module.__createDirectoryRoutes('fakeRoute', routerStub as any)
    expect(routerStub.use).toHaveBeenCalled()
  })
})
