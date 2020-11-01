const log = context.logger('auth')

const sleep = () => {
  const randomDuration = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(), randomDuration(1000, 2000))
  })
}

module.exports = async (request, response, next) => {
  try {
    await sleep()

    if (request.headers.get('unauthorised') === 'true') {
      log.info(`request unauthorised`)
      response.unauthorised()
    } else {
      log.info(`request authorised`)
      next()
    }
  } catch (err) {
    log.error('error processing auth middleware', err)
    response.error()
  }
}
