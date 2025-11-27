import client from 'prom-client'
import pkg from '../../package.json'

type CounterMethod = keyof client.Counter<string>
type GaugeMethod = keyof client.Gauge<string>
type HistogramMethod = keyof client.Histogram<string>

type MetricCache = {
  counter?: Record<string, client.Counter<string>>
  gauge?: Record<string, client.Gauge<string>>
  histogram?: Record<string, client.Histogram<string>>
  initialized?: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var metrics: MetricCache | undefined
}

const name = pkg.name.replace(/-/g, '_').replace(/\./g, '_')

const ensureCache = (): MetricCache => {
  global.metrics = global.metrics ?? {}
  return global.metrics
}

const getMetricName = (metricName: string): string => {
  const prefix = process.env.PREFIX_METRICS || name
  return `${prefix}_${metricName}`
}

function init() {
  const cache = ensureCache()
  if (!cache.initialized) {
    client.collectDefaultMetrics({
      prefix: `${process.env.PREFIX_METRICS || name}_`,
    })
    cache.initialized = true
  }
  return cache.initialized
}

function counter(
  opts: client.CounterConfiguration<string> & { name: string },
  fn: CounterMethod,
  ...args: unknown[]
): void {
  const cache = ensureCache()
  cache.counter = cache.counter ?? {}
  const name = getMetricName(opts.name)
  const help = opts.help ?? `Counter for ${name}`
  cache.counter[name] = cache.counter[name] ?? new client.Counter({ ...opts, name, help })
  const method = cache.counter[name][fn]
  if (typeof method === 'function') {
    ;(method as (...params: unknown[]) => void).apply(cache.counter[name], args)
  }
}

function gauge(
  opts: client.GaugeConfiguration<string> & { name: string },
  fn: GaugeMethod,
  ...args: unknown[]
): void {
  const cache = ensureCache()
  cache.gauge = cache.gauge ?? {}
  const name = getMetricName(opts.name)
  const help = opts.help ?? `Gauge for ${name}`
  cache.gauge[name] = cache.gauge[name] ?? new client.Gauge({ ...opts, name, help })
  const method = cache.gauge[name][fn]
  if (typeof method === 'function') {
    ;(method as (...params: unknown[]) => void).apply(cache.gauge[name], args)
  }
}

function Histogram(
  opts: client.HistogramConfiguration<string> & { name: string },
  fn: HistogramMethod,
  ...args: unknown[]
): void {
  const cache = ensureCache()
  cache.histogram = cache.histogram ?? {}
  const name = getMetricName(opts.name)
  const help = opts.help ?? `Histogram for ${name}`
  cache.histogram[name] = cache.histogram[name] ?? new client.Histogram({ ...opts, name, help })
  const method = cache.histogram[name][fn]
  if (typeof method === 'function') {
    ;(method as (...params: unknown[]) => void).apply(cache.histogram[name], args)
  }
}

init()

export default {
  client,
  init,
  counter,
  gauge,
  Histogram,
}

export { client }
