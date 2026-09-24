import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const prismaCli = path.join(
  appRoot,
  'node_modules',
  'prisma',
  'build',
  'index.js',
)
const tsxCli = path.join(appRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const serverEntry = path.join(appRoot, 'server', 'prod-server.mjs')
const seedRunner = path.join(appRoot, 'prisma', 'seed', 'seed-runner.mjs')

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appRoot,
      env: process.env,
      stdio: 'inherit',
    })

    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} terminated by ${signal}`))
        return
      }
      resolve(code ?? 1)
    })
  })
}

const migrationExitCode = await run(process.execPath, [
  prismaCli,
  'migrate',
  'deploy',
])
if (migrationExitCode !== 0) process.exit(migrationExitCode)

const seedExitCode = await run(process.execPath, [tsxCli, seedRunner])
if (seedExitCode !== 0) process.exit(seedExitCode)

const serverExitCode = await run(process.execPath, [serverEntry])
process.exit(serverExitCode)
