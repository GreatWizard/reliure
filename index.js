#!/usr/bin/env node
const clear = require('clear')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')

const build = require('./lib/build')
const getFormats = require('./lib/get-formats')
const { installKindlegen } = require('./lib/kindlegen')
const mergeConfig = require('./lib/merge-config')
const { printTitle, warn, info, success, error } = require('./lib/message')
const { getOptions, printVersion, printHelp } = require('./lib/options')
const { findConfig, readConfig, validateConfig } = require('./lib/read-config')
const { generateFontFilename } = require('./lib/utils')

const settings = { kindlegen: false, pdf: true }

const options = getOptions()

;(async (options) => {
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
    settings.kindlegen = await installKindlegen({
      mobi: options.mobi,
      kindlegenPath: options['kindlegen-path'],
    })
  } catch (e) {
    warn(`Kindle format (Mobi) is disabled: ${e.message}`)
    settings.kindlegen = false
  }

  let configFile = await findConfig(options.config)
  let config = await readConfig(configFile)
  await validateConfig(config)
  let cwd = await path.dirname(configFile)

  // Check existence of fonts in current directory
  let pdfConfig = mergeConfig(config, 'pdf')
  Object.keys(pdfConfig.fonts || []).forEach((type) => {
    let shapes = Object.keys(pdfConfig.fonts[type].shapes || [])
    if (!shapes.includes('upright')) {
      shapes.push('upright')
    }
    shapes.forEach((shape) => {
      let filename = generateFontFilename(pdfConfig.fonts, type, shape)
      if (!fs.existsSync(filename)) {
        settings.pdf = false
      }
    })
  })

  if (!settings.pdf) {
    warn(
      `PDF format is disabled: Run Reliure directly in the directory that contains configuration file and custom fonts`,
    )
  }

  info(`Book detected: "${config.filename}"`)

  let { formats } = await getFormats(settings, options)

  let builds = []
  for (let format of formats) {
    let currentConfig = mergeConfig(config, format)
    builds.push(
      new Promise(function (resolve, reject) {
        return build(currentConfig, {
          cwd,
          kindlegenPath: options['kindlegen-path'],
          debug: options.debug,
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
  .call(this, options)
  .catch((e) => {
    if (e.message) {
      console.log(chalk.red(`❌ ${e.message}`))
    } else {
      console.log(chalk.red(`❌ We are sorry, but an error has occurred.`))
      console.trace(e)
    }
    if (options.debug) {
      console.trace(e)
    } else {
      printHelp()
    }
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })
