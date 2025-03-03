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
  await writeFile('./reliure.log', output, 'utf-8')
}

process.on('exit', () => {
  if (originalStderrtWrite && isEnabled) {
    process.stdout.write = originalStderrtWrite
  }
})
