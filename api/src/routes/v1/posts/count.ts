import Post from 'models/Post'
import type { Context } from 'koa'
import type { RouteConfig } from 'types/router'

const action = async (ctx: Context) => {
  try {
    ctx.body = {
      count: await Post.count(),
    }
  } catch (err) {
    ctx.throw(err)
  }
}

const route: RouteConfig = {
  method: 'GET',
  route: '/count',
  handlers: [action],
}

export default route
