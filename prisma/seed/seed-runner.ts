import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'
import { createId } from '../../server/common/id.server'

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

try {
  await prisma.$executeRawUnsafe(
    'SELECT pg_advisory_lock(hashtext($1))',
    'app-base-seed-runner',
  )
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
    const seedModule = (await import(
      pathToFileURL(path.join(seedFilesDirectory, file)).href
    )) as {
      main?: () => Promise<void>
      prisma?: { $disconnect: () => Promise<void> }
    }
    if (!seedModule.main)
      throw new Error(`Seed file ${file} must export an async main() function`)
    try {
      await seedModule.main()
    } finally {
      await seedModule.prisma?.$disconnect()
    }
    await prisma.seedExecution.create({
      data: { id: createId(), version: file, name: file },
    })
    console.log(`[seed] completed ${file}`)
  }
} finally {
  await prisma
    .$executeRawUnsafe(
      'SELECT pg_advisory_unlock(hashtext($1))',
      'app-base-seed-runner',
    )
    .catch(() => {})
  await prisma.$disconnect()
}
