import { performance } from 'node:perf_hooks'

export function measureRuntime({
  fixtures,
  run,
  targetBlocks,
  maxElapsedMs,
  outputBytes,
  observe = (result) => result.length,
  samples = 3,
  warmupIterations = 2,
}) {
  if (!fixtures.length) throw new Error('Cannot benchmark an empty fixture set')
  const iterations = Math.ceil(targetBlocks / fixtures.length)
  const blocks = fixtures.length * iterations

  for (let index = 0; index < warmupIterations; index++) {
    for (const fixture of fixtures) run(fixture)
  }

  const elapsed = []
  let outputUnits
  for (let sample = 0; sample < samples; sample++) {
    let observed = 0
    const start = performance.now()
    for (let index = 0; index < iterations; index++) {
      for (const fixture of fixtures) observed += observe(run(fixture))
    }
    elapsed.push(performance.now() - start)
    if (!Number.isFinite(observed) || (outputUnits !== undefined && observed !== outputUnits)) {
      throw new Error('Benchmark output must be finite and consistent across samples')
    }
    outputUnits = observed
  }

  const sorted = [...elapsed].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const elapsedMs = sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2

  // Count UTF-8 bytes in a separate pass so serialization does not affect timing.
  const htmlBytes = outputBytes
    ? fixtures.reduce((total, fixture) => total + outputBytes(run(fixture)), 0) * iterations
    : undefined

  return {
    fixtures: fixtures.length,
    iterations,
    blocks,
    outputUnits,
    elapsedMs: round(elapsedMs),
    samplesMs: elapsed.map(round),
    blocksPerMs: round(blocks / elapsedMs),
    ...(htmlBytes !== undefined
      ? { htmlBytes, htmlKiB: Math.round(htmlBytes / 1024) }
      : {}),
    ...(maxElapsedMs !== undefined
      ? { maxElapsedMs, passed: elapsedMs <= maxElapsedMs }
      : {}),
  }
}

function round(value) {
  return Number(value.toFixed(2))
}
