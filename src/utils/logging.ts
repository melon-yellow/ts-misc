
import { timestamp } from './sync.js'

// Saves Log
export async function log(log: string | Error): Promise<void> {
  // Structure
  const t = timestamp()
  console.log(`(${t}) ${log}`)
}