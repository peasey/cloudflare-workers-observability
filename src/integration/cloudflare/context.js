/* eslint-disable no-restricted-globals, no-empty */

const observability = require('./observability')

// abstraction for accessing environment variables
const environment = {
  variable(key) {
    try {
      if (self[key]) {
        return self[key]
      }
    } catch (err) {}

    return undefined
  },
}

// expose abstractions in the execution context
module.exports.init = () => {
  global.context = {
    environment,
    log: [],
    logger: require('./logger'),
    async respond({ request, route, statusCode, statusText = '', body, headers }) {
      await observability.send({ request, route, statusCode })
      return new Response(body, {
        status: statusCode,
        statusText,
        headers,
      })
    },
    startTime: Date.now(),
  }
}
