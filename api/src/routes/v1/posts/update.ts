import Post from 'models/Post'
import type { RouteConfig } from 'types/router'
import type { BodyContext } from 'types/koa'

const action = async (ctx: BodyContext<Record<string, unknown>>) => {
  try {
    const identifier = ctx.params?.id
    if (!identifier) {
      ctx.throw(400, 'Post identifier is required')
      return
    }
    ctx.body = await Post.update({
      where: {
        id: String(identifier),
      },
      data: ctx.request.body,
    })
  } catch (err) {
    ctx.throw(err)
  }
}

const route: RouteConfig = {
  method: 'PUT',
  route: '/:id',
  handlers: [action],
}

export default route
