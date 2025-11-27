import health, { __healthAction, __stringAction } from 'routes/health'

jest.mock('@koa/router')
jest.mock('koa-send', () => jest.fn())

test('routes: health should be defined', () => {
  expect(health).toBeDefined()
})

test('routes: health healthAction should return a function', () => {
  const action = __healthAction({}, Date.now())
  expect(action).toBeDefined()
  expect(action).toEqual(expect.any(Function))
})

test('routes: health stringAction should return a function', () => {
  const action = __stringAction('TEST')
  expect(action).toBeDefined()
  expect(action).toEqual(expect.any(Function))
})

test('routes: health action should change ctx.body', async () => {
  const action = __healthAction({}, 0)
  const ctx: any = {
    body: '',
  }
  await action(ctx)
  expect(ctx.body).not.toEqual('')
})

test('routes: health string action should change ctx.body', async () => {
  const action = __stringAction('TEST')
  const ctx: any = {
    body: '',
  }
  await action(ctx)
  expect(ctx.body).toEqual('TEST')
})
