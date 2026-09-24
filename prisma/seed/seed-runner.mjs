import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client.js'
import { createId } from '../../server/common/id.server.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const seedFilesDirectory = path.join(root, 'prisma', 'seed', 'files')
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

const seedFiles = (
  await fs.readdir(seedFilesDirectory, { withFileTypes: true })
)
  .filter(
    (entry) => entry.isFile() && /\.(mjs|cjs|js|mts|cts|ts)$/.test(entry.name),
  )
  .map((entry) => entry.name)
  .sort()

function runSeed(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
        path.join(seedFilesDirectory, file),
      ],
      { cwd: root, env: process.env, stdio: 'inherit' },
    )
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) reject(new Error(`Seed ${file} terminated by ${signal}`))
      else if (code !== 0)
        reject(new Error(`Seed ${file} failed with exit code ${code}`))
      else resolve()
    })
  })
}

async function acquireSeedLock() {
  while (true) {
    const result = await prisma.$queryRawUnsafe(
      'SELECT pg_try_advisory_lock(hashtext($1)) AS locked',
      'app-base-seed-runner',
    )
    if (result[0]?.locked === true) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

try {
  // Prevent two CapRover instances from running the same seed simultaneously.
  await acquireSeedLock()

  for (const file of seedFiles) {
    const legacyVersion = file.replace(/\.[^.]+$/, '')
    const existing = await prisma.seedExecution.findFirst({
      where: { version: { in: [file, legacyVersion] } },
    })
    if (existing) {
      console.log(`[seed] skip ${file}`)
      continue
    }

    console.log(`[seed] run ${file}`)
    await runSeed(file)
    await prisma.seedExecution.create({
      data: { id: createId(), version: file, name: file },
    })
    console.log(`[seed] completed ${file}`)
  }
} finally {
  await prisma
    .$queryRawUnsafe(
      'SELECT pg_advisory_unlock(hashtext($1))',
      'app-base-seed-runner',
    )
    .catch(() => {})
  await prisma.$disconnect()
}
