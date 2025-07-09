import { stat } from 'fs'
import { spawn } from 'child_process'

import { debug, log } from './message.js'

export default async function (src, args = [], spawnOptions = {}, pandocPath = 'pandoc', options = {}) {
  if (options.debug) {
    debug('*** pandoc build')
    debug(JSON.stringify(spawnOptions, 0, 2))
    debug(`${pandocPath} ${args.join(' ')}`)
  }

  return new Promise((resolve, reject) => {
    // Check file status of src
    stat(src, (_err, stats) => {
      // Check if src is URL match.
      const isURL = /^(https?|ftp):\/\//i.test(src)

      // If src is a file or valid web URL, push the src back into args array
      if ((stats && stats.isFile()) || isURL) {
        args.unshift(src)
      }

      const pdSpawn = spawn(pandocPath, args, spawnOptions)

      // If src is not a file, assume a string input.
      if (typeof stats === 'undefined' && !isURL) {
        pdSpawn.stdin.end(src, 'utf-8')
      }

      let result = ''
      let error = ''

      pdSpawn.stdout.on('data', (data) => {
        result += data
        if (options.debug) {
          log(data)
        }
      })

      pdSpawn.stderr.on('data', (data) => {
        error += data
      })

      pdSpawn.on('close', (code) => {
        if (code !== 0 || error !== '') {
          reject(new Error(`pandoc returned error ${code}: ${error}`))
        }

        resolve(result)
      })
    })
  })
}
