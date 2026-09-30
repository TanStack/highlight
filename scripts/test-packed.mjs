import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const consumer = mkdtempSync(join(tmpdir(), 'highlight-consumer-'))
const env = { ...process.env, npm_config_cache: join(consumer, 'cache') }
try {
  const packed = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', consumer], { encoding: 'utf8', env }))[0]
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  execFileSync('npm', ['install', '--ignore-scripts', '--offline', '--no-audit', '--no-fund', '--package-lock=false', join(consumer, packed.filename)], { cwd: consumer, stdio: 'inherit', env })
  execFileSync(process.execPath, [resolve('scripts/test-runtime.mjs')], { cwd: consumer, stdio: 'inherit', env })
} finally {
  rmSync(consumer, { recursive: true, force: true })
}
