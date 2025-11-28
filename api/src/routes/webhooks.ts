import { randomUUID } from 'crypto'
import webhookService from 'infrastructure/container/webhookService'
import type { Context } from 'koa'
import type { RouteConfig } from 'types/router'

const buildWebhookUrl = (ctx: Context, id: string): string => {
  const envBase =
    process.env.WEBHOOK_PUBLIC_BASE_URL || process.env.WEBHOOK_BASE_URL || process.env.WEBHOOK_HOST
  const baseUrl = envBase ? envBase.replace(/\/$/, '') : `${ctx.protocol}://${ctx.host}`
  return `${baseUrl}/hooks/${id}`
}

const createWebhook = async (ctx: Context) => {
  const { id } = await webhookService.createWebhook()
  ctx.status = 201
  ctx.body = {
    id,
    url: buildWebhookUrl(ctx, id),
  }
}

const listRequests = async (ctx: Context) => {
  const webhookId = ctx.params?.webhookId
  if (!webhookId) {
    ctx.throw(400, 'webhookId is required')
    return
  }
  ctx.body = await webhookService.listRequests(webhookId)
}

const getRequest = async (ctx: Context) => {
  const webhookId = ctx.params?.webhookId
  const requestId = ctx.params?.requestId
  if (!webhookId || !requestId) {
    ctx.throw(400, 'webhookId and requestId are required')
    return
  }
  const found = await webhookService.getRequest(webhookId, requestId)
  if (!found) {
    ctx.throw(404, 'Request not found')
    return
  }
  ctx.body = found
}

const captureRequest = async (ctx: Context) => {
  const webhookId = ctx.params?.webhookId
  if (!webhookId) {
    ctx.throw(400, 'webhookId is required')
    return
  }

  const body = (ctx.request as Context['request'] & { body?: unknown }).body ?? {}
  const query = ctx.request.query ?? {}

  const record = await webhookService.recordRequest({
    id: randomUUID(),
    webhookId,
    method: ctx.method,
    path: ctx.path,
    headers: ctx.headers,
    query,
    queryString: ctx.request.querystring,
    body,
    ip: ctx.ip,
    url: ctx.request.href,
    protocol: ctx.protocol,
    host: ctx.request.host,
    origin: ctx.request.origin,
    referrer: ctx.get('referer') || ctx.get('referrer'),
    userAgent: ctx.get('user-agent'),
    contentType: ctx.request.type,
    contentLength: ctx.request.length ?? null,
  })

  ctx.status = 202
  ctx.body = {
    id: record.id,
    stored: true,
  }
}

const routes: RouteConfig[] = [
  {
    method: 'POST',
    route: '/webhooks',
    handlers: [createWebhook],
  },
  {
    method: 'GET',
    route: '/webhooks/:webhookId/requests',
    handlers: [listRequests],
  },
  {
    method: 'GET',
    route: '/webhooks/:webhookId/requests/:requestId',
    handlers: [getRequest],
  },
  {
    method: 'ALL',
    route: '/hooks/:webhookId',
    handlers: [captureRequest],
  },
  {
    method: 'ALL',
    route: '/hooks/:webhookId/(.*)',
    handlers: [captureRequest],
  },
]

export default routes

export { buildWebhookUrl, captureRequest, createWebhook, getRequest, listRequests }
