const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const { schemaReliure } = require('./schemas')

const DEFAULT_FILENAME = 'reliure.yml'

module.exports.findConfig = (pathOption) => {
  if (!pathOption) {
    pathOption = DEFAULT_FILENAME
  }
  if (!fs.existsSync(pathOption)) {
    throw `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`
  }

  let stat = fs.statSync(pathOption)

  if (stat.isFile()) {
    return path.resolve(pathOption)
  }

  if (stat.isDirectory()) {
    let configFile = path.join(pathOption, DEFAULT_FILENAME)
    if (!fs.existsSync(configFile)) {
      throw `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`
    }

    return path.resolve(configFile)
  }
}

module.exports.readConfig = (filename) => {
  try {
    let rawConfig = fs.readFileSync(filename, 'utf8')
    return yaml.load(rawConfig)
  } catch (e) {
    throw new Error(
      `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`,
    )
  }
}

module.exports.validateConfig = (config) => {
  let { error } = schemaReliure.validate(config, { abortEarly: false })
  if (error) {
    throw new Error(`Configuration file is invalid:${error.details.map((detail) => `\n  - ${detail.message}`)}`)
  }
  return true
}
