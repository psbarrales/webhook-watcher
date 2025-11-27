import { globSync } from 'glob'
import fs from 'fs'
import path from 'path'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { mergeSchemas, addResolversToSchema } from '@graphql-tools/schema'
import type { Context, DefaultContext, DefaultState, Middleware } from 'koa'
import type { GraphQLSchema } from 'graphql'

const SRC_PATH = path.resolve(__dirname, '..')
const SCHEMAS_PATH = 'graphql'

const use = async (): Promise<Middleware<DefaultState, DefaultContext>> => {
  const folders = getSchemasFolders(path.join(SRC_PATH, SCHEMAS_PATH))
  const schemas = mergeSchemas({ schemas: folders.map(loadGraphQL) })
  return async function graphql(ctx: Context & { schema?: GraphQLSchema }, next) {
    ctx.schema = schemas
    await next()
  }
}

const getSchemasFolders = (directory: string): string[] => {
  const matches = globSync(`${directory}/[A-Z]*`, {
    ignore: ['**/index.ts', '**/*.ignore'],
  })
  return matches
}

const loadGraphQL = (folder: string): GraphQLSchema => {
  const schemaFile = path.join(folder, 'schema.graphql')
  const resolverFile = path.join(folder, 'resolvers.ts')
  let resolvers = {}
  if (fs.existsSync(schemaFile)) {
    const schema = loadSchemaSync(schemaFile, {
      loaders: [new GraphQLFileLoader()],
    })
    if (fs.existsSync(resolverFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      resolvers = require(resolverFile).default
    }
    return addResolversToSchema({
      schema,
      resolvers,
    })
  }
  throw new Error(`schema.graphql not found on folder graphql/${path.basename(folder)}`)
}

export default {
  use,
}
