const { v4: uuid } = require('uuid')

module.exports.send = async ({ request, route, statusCode }) => {
  try {
    const apiFromRequest = (req) => {
      let api = new URL(req.url).host
      const environment = context.environment.variable('ENVIRONMENT')
      if (environment !== 'prod') {
        api = `${api}/${environment}`
      }
      return api
    }

    const observability = require('../backing-services/observability')
    const response = await observability.send({
      apiId: apiFromRequest(request),
      resource: route,
      httpMethod: request.method,
      httpStatusCode: statusCode,
      startTime: context.startTime,
      // cf-request-id will be null when debugging via the Cloudflare dashboard, so create a unique id
      correlationId:
        request.headers.get('cf-request-id') || `cloudflare-worker-dashboard-${uuid()}`,
      log: context.log,
    })

    if (!response.ok) {
      // Will only be visible when debugging via the Cloudflare dashboard
      console.error(
        `Sending observability data failed: ${response.status} ${
          response.statusText
        } : ${await response.text()}`,
      )
    }
  } catch (err) {
    // Will only be visible when debugging via the Cloudflare dashboard
    console.error(`Error sending observability data: `, err)
  }

  return Promise.resolve()
}
