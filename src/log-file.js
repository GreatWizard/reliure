import { writeFile } from 'fs/promises'
import { join, resolve } from 'path'

const LOG_FILENAME = 'reliure.log'

let output = ''
let isEnabled = false
let location = '.'
let originalStderrtWrite = undefined

export function initLogging() {
  isEnabled = true
  location = resolve('.')
  originalStderrtWrite = process.stderr.write.bind(process.stderr)
  process.stderr.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
      output += chunk
    }
    return originalStderrtWrite(chunk, encoding, callback)
  }
}

export async function outputLogFile(error) {
  if (!isEnabled) return
  if (error) console.trace(error)
  await writeFile(join(location, LOG_FILENAME), output, 'utf-8')
}

process.on('exit', () => {
  if (originalStderrtWrite && isEnabled) {
    process.stdout.write = originalStderrtWrite
  }
})
