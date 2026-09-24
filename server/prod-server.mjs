import http from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

import app from '../dist/server/server.js'

const port = Number(process.env.PORT || 3000)
const host = process.env.HOST || '0.0.0.0'
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distClientDir = path.join(appRoot, 'dist', 'client')
const publicDir = path.join(appRoot, 'public')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
])

function toHeaders(rawHeaders) {
  const headers = new Headers()

  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
      continue
    }
    headers.set(key, value)
  }

  return headers
}

async function serveStaticFile(filePath, res) {
  let fileStat
  try {
    fileStat = await stat(filePath)
  } catch {
    return false
  }
  if (!fileStat.isFile()) return false

  const ext = path.extname(filePath).toLowerCase()
  const contentType = contentTypes.get(ext)
  if (contentType) res.setHeader('content-type', contentType)
  res.setHeader('cache-control', 'public, max-age=31536000, immutable')
  res.setHeader('content-length', String(fileStat.size))
  createReadStream(filePath).pipe(res)
  return true
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(
      req.url || '/',
      `http://${req.headers.host || `${host}:${port}`}`,
    )
    const pathname = decodeURIComponent(requestUrl.pathname)

    if (pathname.startsWith('/assets/')) {
      const assetPath = path.join(distClientDir, pathname)
      if (
        assetPath.startsWith(distClientDir) &&
        (await serveStaticFile(assetPath, res))
      ) {
        return
      }
    }

    const publicPath = path.join(publicDir, pathname)
    if (
      publicPath.startsWith(publicDir) &&
      (await serveStaticFile(publicPath, res))
    ) {
      return
    }

    const headers = toHeaders(req.headers)
    const init = {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
      duplex:
        req.method === 'GET' || req.method === 'HEAD' ? undefined : 'half',
    }

    const response = await app.fetch(new Request(requestUrl, init))

    res.statusCode = response.status
    res.statusMessage = response.statusText

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return
      res.setHeader(key, value)
    })

    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : []

    if (setCookies.length > 0) {
      res.setHeader('set-cookie', setCookies)
    }

    if (!response.body) {
      res.end()
      return
    }

    Readable.fromWeb(response.body).pipe(res)
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(port, host, () => {
  console.log(`Production server listening on http://${host}:${port}`)
})
