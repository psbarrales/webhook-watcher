import { EventEmitter } from 'events'
import type {
  RequestRecordedEvent,
  WebhookEventPublisher,
} from 'domain/events/WebhookEvents'

const EVENT_REQUEST_RECORDED = 'request-recorded'

type RequestRecordedListener = (event: RequestRecordedEvent) => void

class WebhookEventBus implements WebhookEventPublisher {
  private readonly emitter = new EventEmitter()

  emitRequestRecorded(event: RequestRecordedEvent): void {
    this.emitter.emit(EVENT_REQUEST_RECORDED, event)
  }

  onRequestRecorded(listener: RequestRecordedListener): void {
    this.emitter.on(EVENT_REQUEST_RECORDED, listener)
  }

  offRequestRecorded(listener: RequestRecordedListener): void {
    this.emitter.off(EVENT_REQUEST_RECORDED, listener)
  }
}

const webhookEventBus = new WebhookEventBus()

export { webhookEventBus, EVENT_REQUEST_RECORDED }
