import type { IncomingMessage, Server as HttpServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import type { RequestRecordedEvent } from 'domain/events/WebhookEvents'
import { webhookEventBus } from 'infrastructure/events/webhookEventBus'

interface TrackedSocket {
  socket: WebSocket
  webhookId: string
}

const SOCKET_PATH = '/ws'

const startWebhookSocketServer = (server: HttpServer): void => {
  const wss = new WebSocketServer({ server, path: SOCKET_PATH })
  const sockets = new Set<TrackedSocket>()

  wss.on('connection', (socket, request) => {
    const webhookId = extractWebhookId(request)
    if (!webhookId) {
      socket.close(1008, 'webhookId query param required')
      return
    }
    const tracked = { socket, webhookId }
    sockets.add(tracked)
    socket.on('close', () => {
      sockets.delete(tracked)
    })
    socket.on('error', () => {
      sockets.delete(tracked)
    })
  })

  webhookEventBus.onRequestRecorded((event) => {
    broadcastRequest(event, sockets)
  })
}

const extractWebhookId = (request: IncomingMessage): string | null => {
  try {
    const host = request.headers.host ?? 'localhost'
    const url = new URL(request.url ?? '/', `http://${host}`)
    const webhookId = url.searchParams.get('webhookId')
    return webhookId && webhookId.trim().length > 0 ? webhookId : null
  } catch {
    return null
  }
}

const broadcastRequest = (event: RequestRecordedEvent, sockets: Set<TrackedSocket>): void => {
  if (sockets.size === 0) return
  const payload = JSON.stringify({
    type: 'request:created',
    data: event,
  })
  sockets.forEach((tracked) => {
    if (tracked.webhookId !== event.webhookId) return
    if (tracked.socket.readyState !== WebSocket.OPEN) {
      sockets.delete(tracked)
      return
    }
    tracked.socket.send(payload)
  })
}

export { startWebhookSocketServer }
