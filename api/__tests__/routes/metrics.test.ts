import metrics, { __action } from 'routes/metrics'

jest.mock('utils/metrics', () => ({
  client: {
    register: {
      metrics: () => 'Metrics called',
    },
  },
}))

test('routes: metrics should be defined', () => {
  expect(metrics).toBeDefined()
})

test('routes: action should call client.register.metrics', async () => {
  const ctx: any = {}
  await __action(ctx)
  expect(ctx.body).toEqual('Metrics called')
})
