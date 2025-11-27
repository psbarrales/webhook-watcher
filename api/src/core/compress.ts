import compress from 'koa-compress'
import { constants as zlibConstants } from 'zlib'
import type { DefaultContext, DefaultState, Middleware } from 'koa'

function use(): Middleware<DefaultState, DefaultContext> {
  console.debug('[core] requiring Compress')
  return compress({
    filter,
    threshold: 2048,
    gzip: {
      flush: zlibConstants.Z_SYNC_FLUSH,
    },
    deflate: {
      flush: zlibConstants.Z_SYNC_FLUSH,
    },
    br: false,
  })
}

function filter(contentType: string): boolean {
  return /text/i.test(contentType)
}

export default {
  use,
}

export { filter as __filter }
