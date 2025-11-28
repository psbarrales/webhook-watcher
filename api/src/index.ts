import 'dotenv/config'
import './polyfills/generator-function'
import core from 'core'

process.setMaxListeners(0)
core.init()

export default core
