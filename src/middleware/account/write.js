const log = context.logger('account:write')

module.exports = async (request, response) => {
  try {
    log.info(`writing data...`)
    response.ok()
  } catch (err) {
    log.error('error processing account/write middleware', err)
    response.error()
  }
}
