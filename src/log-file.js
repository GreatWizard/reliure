const { writeFile } = require('fs/promises')

let output = ''
let isEnabled = false
let originalStderrtWrite = undefined

module.exports.initLogging = () => {
  isEnabled = true
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
  process.stdout.write = originalStderrtWrite
  await writeFile('./error.log', output, 'utf-8')
}
