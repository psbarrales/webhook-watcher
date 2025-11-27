import { graphqlHTTP } from 'koa-graphql'
import type { RouteConfig } from 'types/router'

const route: RouteConfig = {
  method: 'ALL',
  route: '/graphql',
  handlers: [
    graphqlHTTP(async (request, response, ctx) => ({
      schema: ctx.schema,
      graphiql: true,
    })),
  ],
}

export default route
