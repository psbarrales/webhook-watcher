import type { Context, Next } from 'koa'

async function addAPITag(ctx: Context, next: Next): Promise<void> {
  ctx.set('X-Api-Name', 'Simple API')
  await next()
}

export default addAPITag
