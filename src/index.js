#!/usr/bin/env node
const clear = require('clear')
const path = require('path')

const build = require('./build')
const { rearchive } = require('./build')
const getFormats = require('./get-formats')
const { detectOrInstallKindlegen } = require('./kindlegen')
const { initLogging, outputLogFile } = require('./log-file')
const mergeConfig = require('./merge-config')
const { printTitle, warn, info, success, error, log } = require('./message')
const { getOptions, printVersion, printHelp } = require('./options')
const { ensureConfigPath, findConfig, readConfig, validateConfig } = require('./read-config')

const settings = { kindlegenPath: undefined }

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

  let configPath = ensureConfigPath(options.config)
  if (!options['non-interactive']) {
    initLogging(configPath)
  }

  try {
    settings.kindlegenPath = await detectOrInstallKindlegen(options)
  } catch (e) {
    warn(`Kindle format (Mobi) is disabled: ${e.message}`)
    settings.kindlegenPath = undefined
  }

  let { formats } = await getFormats(settings, options)

  if (options.archive) {
    await rearchive(options.config, {
      mobi: formats.includes('mobi'),
      kindlegenPath: settings.kindlegenPath,
      debug: options.debug,
    })
    return
  }

  let configFile = await findConfig(configPath)
  let config = await readConfig(configFile)
  await validateConfig(config)
  let cwd = await path.dirname(configFile)

  info(`Book detected: "${config.filename}"`)

  let builds = []
  for (let format of formats) {
    let currentConfig = mergeConfig(config, format)
    builds.push(
      new Promise(function (resolve, reject) {
        return build(currentConfig, {
          cwd,
          kindlegenPath: settings.kindlegenPath,
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
  log('✨ Done.')
})
  .call(this, options)
  .catch(async (e) => {
    if (e.message) {
      error(`${e.message}`, '❌')
      await outputLogFile(e)
    } else {
      error(`We are sorry, but an error has occurred.`, '❌')
      console.trace(e)
      await outputLogFile()
    }
    if (options.debug) {
      console.trace(e)
    } else {
      printHelp()
    }
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })
