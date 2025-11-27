import Post from 'models/Post'
import type { RouteConfig } from 'types/router'
import type { BodyContext } from 'types/koa'

const action = async (ctx: BodyContext<Record<string, unknown>>) => {
  try {
    const post = await Post.create({
      data: ctx.request.body,
    })
    ctx.body = post
  } catch (err) {
    ctx.throw(err)
  }
}

const route: RouteConfig = {
  method: 'POST',
  route: '/',
  handlers: [action],
}

export default route
