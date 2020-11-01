const requried = require('../../util/required-param')
const api = require('./api')

const format = (correlationId) => (entry) => {
  return {
    timestamp: entry.timestamp,
    message: `${new Date(
      entry.timestamp,
    ).toISOString()} ${correlationId} ${entry.level.toUpperCase()} ${entry.message}`,
  }
}

const datePrefix = (now) => {
  const date = new Date(now)
  /* istanbul ignore next */
  const fixedWidth = (n) => (n >= 10 ? n : `0${n}`)
  return `${date.getFullYear()}/${fixedWidth(date.getMonth() + 1)}/${fixedWidth(date.getDate())}`
}

module.exports.send = async ({
  apiId = requried('apiId'),
  resource = requried('resource'),
  httpMethod = requried('httpMethod'),
  httpStatusCode = requried('httpStatusCode'),
  startTime = requried('startTime'),
  correlationId = requried('correlationId'),
  log = [],
} = {}) => {
  let response = {
    ok: true,
  }

  if (log.length > 0) {
    try {
      const data = prepareData({
        apiId,
        resource,
        httpMethod,
        httpStatusCode,
        startTime,
        correlationId,
        log,
      })

      const logStreamResult = await createLogStream({
        streamId: data.streamId,
      })

      response = logStreamResult

      if (logStreamResult.ok) {
        response = await writeLog({
          streamId: data.streamId,
          log: data.log,
        })
      }

      response = await writeMetrics({
        metrics: data.metrics,
      })
    } catch (err) {
      /* eslint-disable no-empty */
    }
  }

  return Promise.resolve(response)
}

const prepareData = ({
  apiId,
  resource,
  httpMethod,
  httpStatusCode,
  startTime,
  correlationId,
  log,
}) => {
  const now = Date.now()
  const duration = now - startTime
  const streamId = `${datePrefix(now)}/${correlationId}`
  const earliestTimestamp = log[0].timestamp

  const metaLogEntry = {
    timestamp: earliestTimestamp,
    level: 'START',
    message: `Duration: ${duration}ms, API: ${apiId}, resource: ${resource}, httpMethod: ${httpMethod}, httpStatusCode: ${httpStatusCode}`,
  }
  const logEntries = [metaLogEntry, ...log].map(format(correlationId))

  const metrics = createMetrics({
    apiId,
    resource,
    httpMethod,
    httpStatusCode,
    duration,
  })

  return {
    streamId,
    log: logEntries,
    metrics,
  }
}

const createMetrics = ({ apiId, resource, httpMethod, httpStatusCode, duration }) => {
  let metrics = []

  const countMetric = {
    MetricName: 'Count',
    Unit: 'Count',
    StorageResolution: 1,
    Value: 1,
  }

  metrics = metrics.concat(
    createMetricsWithDimensions({
      apiId,
      resource,
      httpMethod,
      httpStatusCode,
      metric: countMetric,
    }),
  )

  const durationMetric = {
    MetricName: 'Duration',
    Unit: 'Milliseconds',
    StorageResolution: 1,
    Value: duration,
  }

  metrics = metrics.concat(
    createMetricsWithDimensions({
      apiId,
      resource,
      httpMethod,
      httpStatusCode,
      metric: durationMetric,
    }),
  )

  return metrics
}

const createMetricsWithDimensions = ({ apiId, resource, httpMethod, httpStatusCode, metric }) => {
  const apiDimension = [
    {
      Name: 'Api',
      Value: apiId,
    },
  ]

  const resourceDimension = [
    {
      Name: 'Resource',
      Value: resource,
    },
  ]

  const methodDimension = [
    {
      Name: 'Method',
      Value: httpMethod.toUpperCase(),
    },
  ]

  const statusCodeDimension = [
    {
      Name: 'StatusCode',
      Value: httpStatusCode.toString(),
    },
  ]

  const all = [...apiDimension, ...resourceDimension, ...methodDimension, ...statusCodeDimension]

  return [
    { ...metric, Dimensions: apiDimension },
    { ...metric, Dimensions: resourceDimension },
    { ...metric, Dimensions: methodDimension },
    { ...metric, Dimensions: statusCodeDimension },
    { ...metric, Dimensions: all },
  ]
}

const createLogStream = async ({ streamId }) => {
  const body = {
    stream: streamId,
  }

  return api.request({
    resource: 'observability/logs/stream',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

const writeLog = async ({ streamId, log }) => {
  const body = {
    stream: streamId,
    log,
  }

  return api.request({
    resource: 'observability/logs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

const writeMetrics = async ({ metrics }) => {
  const body = {
    Namespace: 'DemoApi',
    MetricData: metrics,
  }

  return api.request({
    resource: 'observability/metrics',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}
