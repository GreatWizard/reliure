#!/usr/bin/env node

const log = console.log
const clear = require("clear")

const build = require("./lib/build")
const getFormats = require("./lib/get-formats")
const { installKindlegen } = require("./lib/kindlegen")
const mergeConfig = require("./lib/merge-config")
const { printTitle, info, success, error } = require("./lib/message")
const { getOptions, printVersion, printHelp } = require("./lib/options")
const readConfig = require("./lib/read-config")

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

  let config = await readConfig()
  info(`Book detected: "${config.filename}"`)

  let { formats } = await getFormats(settings, options)

  let builds = []
  for (let format of formats) {
    let currentConfig = mergeConfig(config, format)
    builds.push(
      new Promise(function(resolve, reject) {
        return build(currentConfig)
          .then(() => {
            success(`Bounded "${format}" file`)
            resolve()
          })
          .catch(e => {
            console.log(e)
            reject(`Error with the format "${format}"`)
          })
      })
    )
  }

  await Promise.all(builds)
  log("✨ Done.")
})
  .call(this)
  .catch(e => error(e))
