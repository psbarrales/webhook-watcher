import Post from 'models/Post'
import type { Context } from 'koa'
import type { RouteConfig } from 'types/router'

const action = async (ctx: Context) => {
  try {
    const identifier = ctx.params?.id
    if (!identifier) {
      ctx.throw(400, 'Post identifier is required')
      return
    }
    ctx.body = await Post.findOne({
      where: {
        id: String(identifier),
      },
    })
  } catch (err) {
    ctx.throw(err)
  }
}

const route: RouteConfig = {
  method: 'GET',
  route: '/:id',
  handlers: [action],
}

export default route
