// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const pino = require('pino')
const logger = require('pino-http')({},
  // pino.destination('./pino-http-log.log')
)

// Make sure commands gracefully respect termination signals (e.g. from Docker)
// Allow the graceful termination to be manually configurable
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0))
  process.on('SIGINT', () => process.exit(0))
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({
  dev, hostname, port,
  conf: {
    "experimental": { "appDir": true, }
  }
})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      logger(req, res)

      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})