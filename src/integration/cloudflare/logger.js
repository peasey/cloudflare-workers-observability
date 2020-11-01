const replaceErrors = (key, value) => {
  if (value instanceof Error) {
    const error = {}
    Object.getOwnPropertyNames(value).forEach((k) => {
      error[k] = value[k]
    })
    return error
  }
  return value
}

const log = ({ stdout, level, prefix, message, err }) => {
  /* eslint-disable no-empty */
  try {
    let formattedMessage = `[${prefix}] ${message}`

    if (err) {
      formattedMessage = `${formattedMessage}\n${JSON.stringify(err, replaceErrors)}`
    }

    context.log.push({
      timestamp: Date.now(),
      level,
      message: formattedMessage,
    })

    if (err) {
      stdout(`[${prefix}] ${message}`, err)
    } else {
      stdout(`[${prefix}] ${message}`)
    }
  } catch (ignore) {}
}

const logDebug = (prefix) => (message) => {
  /* eslint-disable no-empty */
  try {
    const debug = context.environment.variable('DEBUG')
    if (debug) {
      log({ stdout: console.info, level: 'debug', prefix, message })
    }
  } catch (ignore) {}
}

const logInfo = (prefix) => (message) =>
  log({ stdout: console.info, level: 'info', prefix, message })

const logError = (prefix) => (message, err) =>
  log({ stdout: console.error, level: 'error', prefix, message, err })

const createLogger = (prefix) => {
  return {
    debug: logDebug(prefix),
    info: logInfo(prefix),
    error: logError(prefix),
  }
}

module.exports = createLogger
