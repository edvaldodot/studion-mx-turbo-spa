const {promisify} = require('util')
const handler = require('serve-handler')
const fs = require('fs')
const compression = require('compression')

const compressionHandler = promisify(compression())

module.exports = async (request, response) => {
  if (request.url === '/config') {
    await configHandler(request, response)
  } else {
    await compressionHandler(request, response)
    await handler(request, response, {
      public: 'dist',
      rewrites: [
        { 'source': '/**', 'destination': '/index.html' }
      ],
      headers: [
        {
          'source': '*',
          'headers': [
            {
              "key" : "X-FRAME-OPTIONS",
              "value" : "SAMEORIGIN"
            }
          ]
        },
        {
          'source': '**/*.@(html)',
          'headers': [{
            'key': 'Cache-Control',
            'value': 'no-cache'
          }]
        },
        {
          'source': '**/*.@(css|js)',
          'headers': [{
            'key': 'Cache-Control',
            'value': 'private, max-age=172800, stale-while-revalidate=604800'
          }]
        },
        {
          'source': '**/*.@(jpg|jpeg|gif|png|svg|webp|ico)',
          'headers': [{
            'key': 'Cache-Control',
            'value': 'private, max-age=172800, stale-while-revalidate=604800'
          }]
        }
      ]
    })
  }
}

async function configHandler (request, response) {
  try {
    let configs = JSON.parse(fs.readFileSync('config/configs.json', 'utf8'))

    response.setHeader('Content-Type', 'application/json; charset=utf-8')

    const envConfig = configs.find(environment => {
      return environment.linkedDomains.includes(request.headers.host)
    })

    if (envConfig) {
      return response.end(JSON.stringify(envConfig))
    }

    sendError(response, 404, 'config_not_found')
  } catch (error) {
    sendError(response, 500, error.message)
  }
}

function sendError (response, code, message) {
  response.statusCode = code
  response.end(JSON.stringify({
    'code': code,
    'message': message
  }))
}
