const required = require('../../util/required-param')

const request = async ({
  resource = required('resource'),
  method = required('method'),
  headers = {},
  body = required('body'),
} = {}) => {
  const endpoint = context.environment.variable('BACKING_API_ENDPOINT')
  const url = `${endpoint}/${resource}`

  const mutatedHeaders = { ...headers }
  mutatedHeaders['x-api-key'] = context.environment.variable('BACKING_API_KEY')

  const options = { headers: mutatedHeaders, method, body }

  return fetch(url, options)
}

module.exports = {
  request,
}
