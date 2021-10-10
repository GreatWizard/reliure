#!/usr/bin/env node
import clear from 'clear'

import build from './lib/build.js'
import getFormats from './lib/get-formats.js'
import { installKindlegen } from './lib/kindlegen.js'
import mergeConfig from './lib/merge-config.js'
import { printTitle, info, success, error } from './lib/message.js'
import { getOptions, printVersion, printHelp } from './lib/options.js'
import readConfig from './lib/read-config.js'

const settings = { kindlegen: false }

let options = getOptions()

if (options.help) {
  printHelp()
  process.exit()
}

if (options.version) {
  printVersion()
  process.exit()
}

clear()
printTitle()

try {
  settings.kindlegen = await installKindlegen(options.mobi)
} catch (e) {
  settings.kindlegen = false
}

let config = await readConfig()
info(`Book detected: "${config.filename}"`)

let { formats } = await getFormats(settings, options)

let builds = []
for (let format of formats) {
  let currentConfig = mergeConfig(config, format)
  builds.push(
    new Promise(function (resolve, reject) {
      return build(currentConfig)
        .then(() => {
          success(`Bounded "${format}" file`)
          resolve()
        })
        .catch((e) => {
          error(`Error with the format "${format}"`)
          reject(e)
        })
    }),
  )
}

await Promise.all(builds)
console.log('✨ Done.')
