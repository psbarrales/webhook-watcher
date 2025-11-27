/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get metrics data for prometheus
 *     tags: [Status]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Metrics data for prometheus
 *         schema:
 *           type: object
 */

import { client } from 'utils/metrics'
import type { Context } from 'koa'
import type { RouteConfig } from 'types/router'

const action = async (ctx: Context) => {
  ctx.body = await client.register.metrics()
}

const route: RouteConfig = {
  method: 'GET',
  route: '/metrics',
  handlers: [action],
}

export default route

export { action as __action }
