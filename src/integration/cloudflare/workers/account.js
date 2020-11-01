/* eslint-disable no-restricted-globals */
const context = require('../context')

addEventListener('fetch', (event) => {
  context.init()
  const resource = require('../../../resources/account')
  event.respondWith(resource(event))
})
