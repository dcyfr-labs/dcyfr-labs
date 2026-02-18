#!/usr/bin/env node
import { spawn } from 'child_process'
import net from 'net'
import process from 'process'
import path from 'path'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: run-with-dev.mjs <script> [args...]')
  process.exit(2)
}

const script = path.resolve(process.cwd(), args[0])
const scriptArgs = args.slice(1)

function isPortOpen(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let done = false
    socket.setTimeout(timeout)
    socket.once('connect', () => {
      done = true
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      if (done) return
      done = true
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => {
      if (done) return
      done = true
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function waitForPort(port, timeoutMs = 30000, interval = 500) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port)) return true
    await new Promise((r) => setTimeout(r, interval))
  }
  return false
}

let startedDev = false
let devProc = null

;(async () => {
  const port = 3000
  try {
    const up = await isPortOpen(port)
    if (!up) {
      console.log(`Dev server not detected on http://localhost:${port} — starting 'npm run dev'...`)
      devProc = spawn('npm', ['run', 'dev'], { // NOSONAR - Administrative script, inputs from controlled sources
        stdio: 'inherit',
        env: process.env,
        shell: false,
      })
      startedDev = true

      const ok = await waitForPort(port, 60000, 500)
      if (!ok) {
        console.error('Timed out waiting for dev server to start.')
        if (devProc) devProc.kill('SIGTERM')
        process.exit(1)
      }
    } else {
      console.log(`Dev server detected on http://localhost:${port} — reusing it`)
    }

    // Run the requested script
    const nodeExe = process.execPath
    const testProc = spawn(nodeExe, [script, ...scriptArgs], { stdio: 'inherit', env: process.env }) // NOSONAR - Administrative script, inputs from controlled sources

    const cleanupAndExit = async (code = 0) => {
      if (startedDev && devProc) {
        try {
          console.log('Stopping dev server started for tests...')
          devProc.kill('SIGTERM')
        } catch {
          // ignore
        }
      }
      // give some time for process to exit cleanly
      setTimeout(() => process.exit(code), 500)
    }

    testProc.on('exit', (code, sig) => {
      const exitCode = typeof code === 'number' ? code : sig ? 1 : 0
      cleanupAndExit(exitCode)
    })
    testProc.on('error', (err) => {
      console.error('Failed to run test script', err)
      cleanupAndExit(1)
    })

    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP']
    signals.forEach((s) =>
      process.on(s, async () => {
        if (startedDev && devProc) devProc.kill('SIGTERM')
        process.exit(130)
      })
    )
  } catch (err) {
    console.error('run-with-dev error:', err)
    if (startedDev && devProc) devProc.kill('SIGTERM')
    process.exit(1)
  }
})()
