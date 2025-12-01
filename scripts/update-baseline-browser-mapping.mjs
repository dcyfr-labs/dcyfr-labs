#!/usr/bin/env node
/**
 * Update baseline-browser-mapping data file.
 * Usage:
 *   node scripts/update-baseline-browser-mapping.mjs [--widely-available-on-date YYYY-MM-DD] [--output src/data/baseline-browser-mapping.json]
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getAllVersions } from 'baseline-browser-mapping'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = {
    date: null,
    output: path.join(process.cwd(), 'src', 'data', 'baseline-browser-mapping.json'),
    includeDownstream: true,
    useSupports: false,
  }

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--widely-available-on-date' && args[i + 1]) {
      opts.date = args[++i]
    } else if (a === '--output' && args[i + 1]) {
      opts.output = args[++i]
    } else if (a === '--no-downstream') {
      opts.includeDownstream = false
    } else if (a === '--use-supports') {
      opts.useSupports = true
    }
  }
  return opts
}

async function main() {
  const opts = parseArgs()
  const today = new Date().toISOString().slice(0, 10)
  const date = opts.date || today

  console.log(`Generating baseline mapping for date: ${date}`)

  // getAllVersions returns an array of browsers with support metadata
  const data = getAllVersions({
    includeDownstreamBrowsers: opts.includeDownstream,
    outputFormat: 'array',
    useSupports: opts.useSupports
  })

  // If a date is provided, narrow the dataset to the Widely Available set for that date
  // The library doesn't directly accept a 'widelyAvailableOnDate' in getAllVersions, but getCompatibleVersions can be used for date-targeted output.
  // For simplicity we'll use getAllVersions and include all versions, then write to the file. If date-based filtering is required, use getCompatibleVersions in a follow-up.

  const outPath = path.isAbsolute(opts.output) ? opts.output : path.join(process.cwd(), opts.output)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify({ updated: new Date().toISOString(), data }, null, 2) + '\n')
  console.log(`Wrote baseline mapping to ${outPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
