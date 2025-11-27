import Post from 'models/Post'
import { filterQuery } from 'utils/query'
import type { Context } from 'koa'
import type { RouteConfig } from 'types/router'

const action = async (ctx: Context) => {
  try {
    ctx.body = await Post.find({
      where: filterQuery(ctx),
    })
  } catch (err) {
    ctx.throw(err)
  }
}

const route: RouteConfig = {
  method: 'GET',
  route: '/',
  handlers: [action],
}

export default route
