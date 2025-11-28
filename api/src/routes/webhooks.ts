import { randomUUID } from 'crypto'
import { WebhookLimitError } from 'application/webhooks/WebhookService'
import webhookService from 'infrastructure/container/webhookService'
import type { Context } from 'koa'
import type { WebhookRequest } from 'domain/entities/WebhookRequest'
import type { RouteConfig } from 'types/router'
import type { BodyContext } from 'types/koa'
import type { WebhookResponseRuleInput } from 'domain/entities/WebhookResponseRule'

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

const getWebhook = async (ctx: Context) => {
  const webhookId = ctx.params?.webhookId
  if (!webhookId) {
    ctx.throw(400, 'webhookId is required')
    return
  }
  const { responses } = await webhookService.getWebhook(webhookId)
  ctx.body = {
    id: webhookId,
    url: buildWebhookUrl(ctx, webhookId),
    responses,
  }
}

const updateWebhook = async (
  ctx: BodyContext<{ responses?: WebhookResponseRuleInput[] }>,
): Promise<void> => {
  const webhookId = ctx.params?.webhookId
  if (!webhookId) {
    ctx.throw(400, 'webhookId is required')
    return
  }
  const payload = ctx.request.body ?? {}
  const responsesInput = Array.isArray(payload.responses) ? payload.responses : []
  const updated = await webhookService.updateResponses(webhookId, responsesInput)
  ctx.body = {
    id: webhookId,
    url: buildWebhookUrl(ctx, webhookId),
    responses: updated,
  }
}

const captureRequest = async (ctx: Context) => {
  const webhookId = ctx.params?.webhookId
  if (!webhookId) {
    ctx.throw(400, 'webhookId is required')
    return
  }

  const body = (ctx.request as Context['request'] & { body?: unknown }).body ?? {}
  const query = ctx.request.query ?? {}
  const subPath = resolveSubPath(ctx, webhookId)

  let record: WebhookRequest
  try {
    record = await webhookService.recordRequest({
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
  } catch (error) {
    if (error instanceof WebhookLimitError) {
      ctx.status = error.status
      ctx.body = {
        error: error.message,
        code: error.code,
      }
      return
    }
    throw error
  }

  ctx.set('X-Webhook-Watcher-Request-Id', record.id)

  const responseRule = await webhookService.findResponseRule(webhookId, ctx.method, subPath)
  if (responseRule) {
    ctx.status = responseRule.status
    if (responseRule.contentType) {
      ctx.set('Content-Type', responseRule.contentType)
    }
    ctx.body = responseRule.body === undefined ? '' : responseRule.body
    return
  }

  ctx.status = 202
  ctx.body = {
    id: record.id,
    stored: true,
  }
}

const resolveSubPath = (ctx: Context, webhookId: string): string => {
  const wildcard = (ctx.params as Record<string, string | undefined>)?.['0']
  if (typeof wildcard === 'string' && wildcard.length > 0) {
    return wildcard.startsWith('/') ? wildcard : `/${wildcard}`
  }
  const prefix = `/hooks/${webhookId}`
  if (ctx.path === prefix) return '/'
  if (ctx.path.startsWith(`${prefix}/`)) {
    const rest = ctx.path.slice(prefix.length)
    if (!rest || rest === '/') return '/'
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  return '/'
}

const routes: RouteConfig[] = [
  {
    method: 'POST',
    route: '/webhooks',
    handlers: [createWebhook],
  },
  {
    method: 'GET',
    route: '/webhooks/:webhookId',
    handlers: [getWebhook],
  },
  {
    method: 'PUT',
    route: '/webhooks/:webhookId',
    handlers: [updateWebhook],
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

export {
  buildWebhookUrl,
  captureRequest,
  createWebhook,
  getRequest,
  getWebhook,
  listRequests,
  resolveSubPath,
  updateWebhook,
}
