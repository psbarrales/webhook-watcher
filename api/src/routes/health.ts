/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get health status
 *     tags: [Status]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: API Health status
 *         schema:
 *           type: object
 */

import pkg from '../../package.json'
import type { Context } from 'koa'
import type { RouteConfig } from 'types/router'

const initialDate = Date.now()
const body = {
  name: pkg.name,
  version: pkg.version,
  environment: process.env.NODE_ENV || '!NODE_ENV',
  build: process.env.BUILD_NUMBER || 'development',
  date: new Date(initialDate),
}

const setResponseBody = (ctx: Context, responseBody: unknown) => {
  ctx.body = responseBody
}

const healthAction = (responseBody: Record<string, unknown>, startedAt: number) => async (ctx: Context) => {
  responseBody.uptime = (Date.now() - startedAt) / 1000
  setResponseBody(ctx, responseBody)
}

const stringAction = (txt: string) => async (ctx: Context) => setResponseBody(ctx, txt)

const routes: RouteConfig[] = [
  {
    method: 'GET',
    route: '/',
    handlers: [healthAction(body, initialDate)],
  },
  {
    method: 'GET',
    route: '/health',
    handlers: [healthAction(body, initialDate)],
  },
  {
    method: 'GET',
    route: '/up',
    handlers: [stringAction('UP')],
  },
  {
    method: 'GET',
    route: '/ping',
    handlers: [stringAction('PONG')],
  },
]

export default routes

export {
  setResponseBody as __setResponseBody,
  healthAction as __healthAction,
  stringAction as __stringAction,
}
