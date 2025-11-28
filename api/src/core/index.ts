import api from './api'
import { startWebhookSocketServer } from 'infrastructure/websocket/WebhookSocketServer'

const listen = () => console.info(`Listen on port: ${process.env.PORT}`)

export default {
  init: async () => {
    const app = await api()
    const server = app.listen(process.env.PORT, listen)
    startWebhookSocketServer(server)
  },
}

export { listen as __listen }
