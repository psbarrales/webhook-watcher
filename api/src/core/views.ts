import path from 'path'
import views from 'koa-views'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

function use(): Middleware<DefaultState, DefaultContext> {
  console.debug('[core] requiring Views')
  const viewsPath = path.join(__dirname, '/../views')
  return views(viewsPath, {
    map: {
      html: 'nunjucks',
      njk: 'nunjucks',
    },
  })
}

export default {
  use,
}
