/* eslint-disable @typescript-eslint/no-var-requires */
type GeneratorFunctionExport =
  | ((
      ...args: unknown[]
    ) => unknown)
  | {
      default?: unknown
      'module.exports'?: unknown
    }

const generatorFunctionModule = require('generator-function') as GeneratorFunctionExport

const resolvedExport =
  typeof generatorFunctionModule === 'function'
    ? generatorFunctionModule
    : (typeof generatorFunctionModule === 'object' &&
        generatorFunctionModule !== null &&
        (generatorFunctionModule.default ?? generatorFunctionModule['module.exports'])) ||
      undefined

if (typeof generatorFunctionModule !== 'function' && typeof resolvedExport === 'function') {
  const moduleId = require.resolve('generator-function')
  const cachedModule = require.cache[moduleId]

  if (cachedModule) {
    cachedModule.exports = resolvedExport
  } else {
    require.cache[moduleId] = {
      exports: resolvedExport,
      filename: moduleId,
      id: moduleId,
      loaded: true,
      require,
      path: moduleId,
      children: [],
    } as NodeModule
  }
}
