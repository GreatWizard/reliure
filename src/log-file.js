const { writeFile } = require('fs/promises')
const { join, resolve, dirname } = require('path')

const LOG_FILENAME = 'reliure.log'

let output = ''
let isEnabled = false
let location = '.'
let originalStderrtWrite = undefined

module.exports.initLogging = (configFile) => {
  isEnabled = true
  location = resolve(configFile)
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
  await writeFile(join(dirname(location), LOG_FILENAME), output, 'utf-8')
}

process.on('exit', () => {
  if (originalStderrtWrite && isEnabled) {
    process.stdout.write = originalStderrtWrite
  }
})
