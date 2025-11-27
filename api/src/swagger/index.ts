import path from 'path'
import swaggerJsdoc, { type Options as SwaggerOptions } from 'swagger-jsdoc'
import pkginfo from '../../package.json'

async function options(): Promise<SwaggerOptions> {
  return {
    definition: {
      info: {
        title: pkginfo.name,
        description: pkginfo.description ?? '',
        version: pkginfo.version,
        contact: pkginfo.author,
      },
      consumes: ['application/x-www-form-urlencoded', 'application/json'],
      servers: [],
      produces: ['application/json'],
      components: {
        securitySchemes: {
          OAuth2: {
            type: 'oauth2',
            description:
              'For more information, see https://developers.getbase.com/docs/rest/articles/oauth2/requests',
            flows: {
              authorizationCode: {
                authorizationUrl: '/v1/login/oauth/authorize',
                scopes: ['swagger:admin'],
              },
              password: {
                tokenUrl: '/v1/login/oauth/token',
                scopes: ['swagger:admin'],
              },
            },
          },
        },
      },
    },
    apis: [
      path.join(__dirname, '../routes/**/*.ts'),
      path.join(__dirname, '../tasks/**/*.ts'),
    ],
  }
}

export default async () => {
  return swaggerJsdoc(await options())
}

export { options as __options }
