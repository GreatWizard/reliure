const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const { schemaReliure } = require('./schemas')

const DEFAULT_FILENAME = 'reliure.yml'

module.exports.findConfig = (pathOption) => {
  let file
  if (pathOption) {
    pathOption = path.isAbsolute(pathOption) ? pathOption : path.resolve(pathOption)
    if (fs.existsSync(path.join(pathOption, DEFAULT_FILENAME))) {
      file = path.join(pathOption, DEFAULT_FILENAME)
    } else if (fs.existsSync(pathOption)) {
      file = pathOption
    }
  } else {
    file = DEFAULT_FILENAME
  }
  return file
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
