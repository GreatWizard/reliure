const { writeFile } = require('fs/promises')
const { join, resolve } = require('path')

const LOG_FILENAME = 'reliure.log'

let output = ''
let isEnabled = false
let location = '.'
let originalStderrtWrite = undefined

module.exports.initLogging = (configPath) => {
  isEnabled = true
  location = resolve(configPath)
  originalStderrtWrite = process.stderr.write.bind(process.stderr)
  process.stderr.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
      output += chunk
    }
    return originalStderrtWrite(chunk, encoding, callback)
  }
}

module.exports.outputLogFile = async (error) => {
  if (!isEnabled) return
  if (error) console.trace(error)
  await writeFile(join(location, LOG_FILENAME), output, 'utf-8')
}

process.on('exit', () => {
  if (originalStderrtWrite && isEnabled) {
    process.stdout.write = originalStderrtWrite
  }
})
