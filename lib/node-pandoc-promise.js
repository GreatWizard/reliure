const stat = require('fs').stat
const spawn = require('child_process').spawn

module.exports = function (src, args = [], options = {}, pandocPath = 'pandoc') {
  return new Promise((resolve, reject) => {
    let pdSpawn
    let result = ''
    let isURL

    // Event Handlers
    let onStdOutData
    let onStdOutEnd
    let onStdErrData
    let onStatCheck

    isURL = function (src) {
      return /^(https?|ftp):\/\//i.test(src)
    }

    onStdOutData = function (data) {
      result += data
    }

    onStdOutEnd = function () {
      resolve(result)
    }

    onStdErrData = function (err) {
      reject(new Error(err))
    }

    onStatCheck = function (err, stats) {
      // If src is a file or valid web URL, push the src back into args array
      if ((stats && stats.isFile()) || isURL) {
        args.unshift(src)
      }

      // Create child_process.spawn
      pdSpawn = spawn(pandocPath, args, options)

      // If src is not a file, assume a string input.
      if (typeof stats === 'undefined' && !isURL) {
        pdSpawn.stdin.end(src, 'utf-8')
      }

      // Set handlers...
      pdSpawn.stdout.on('data', onStdOutData)
      pdSpawn.stdout.on('end', onStdOutEnd)
      pdSpawn.on('error', onStdErrData)
    }

    // Check if src is URL match.
    isURL = isURL(src)

    // Check file status of src
    stat(src, onStatCheck)
  })
}
