#!/usr/bin/env node
const clear = require('clear')
const path = require('path')
const chalk = require('chalk')

const build = require('./lib/build')
const getFormats = require('./lib/get-formats')
const { installKindlegen } = require('./lib/kindlegen')
const mergeConfig = require('./lib/merge-config')
const { printTitle, info, success, error } = require('./lib/message')
const { getOptions, printVersion, printHelp } = require('./lib/options')
const { readConfig, findConfig } = require('./lib/read-config')

const settings = { kindlegen: false }

;(async () => {
  let options = getOptions()

  if (options.help) {
    printHelp()
    return
  }

  if (options.version) {
    printVersion()
    return
  }

  clear()
  printTitle()

  try {
    settings.kindlegen = await installKindlegen(options.mobi)
  } catch (e) {
    settings.kindlegen = false
  }

  let configFile = await findConfig(options.config)
  let config = await readConfig(configFile)
  let cwd = await path.dirname(configFile)
  info(`Book detected: "${config.filename}"`)

  let { formats } = await getFormats(settings, options)

  let builds = []
  for (let format of formats) {
    let currentConfig = mergeConfig(config, format)
    builds.push(
      new Promise(function (resolve, reject) {
        return build(currentConfig, {
          cwd,
        })
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
})
  .call(this)
  .catch((e) => {
    console.log(chalk.red(`❌ ${e.message}`))
    printHelp()
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })
